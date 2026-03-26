// src/pages/FlightsPage.jsx
// Trang kết quả tìm kiếm — điều hướng từ Topbar
// URL ví dụ: /flights?origin=DAD&destination=HAN&departure_date=2026-03-17&return_date=2026-03-19&price=1000000
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import FlightResults from '../components/Flightresults';
import { searchFlights, formatFlight, filterFlights } from '../services/flightAPI';

function mapFlightResult(result, maxPrice) {
  let outbound = (result?.data?.outbound ?? []).flatMap(day =>
    (day.flights ?? []).map(f => formatFlight(f))
  );
  let returnFlights = (result?.data?.return ?? []).flatMap(day =>
    (day.flights ?? []).map(f => formatFlight(f))
  );

  if (maxPrice) {
    outbound      = filterFlights(outbound,      { maxPrice });
    returnFlights = filterFlights(returnFlights, { maxPrice });
  }

  return { outbound, return: returnFlights };
}

export default function FlightsPage() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const location        = useLocation();

  function goBackToSearch() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/home');
  }

  const origin         = (searchParams.get('origin')         || '').toUpperCase();
  const destination    = (searchParams.get('destination')    || '').toUpperCase();
  const departure_date = searchParams.get('departure_date')  || '';
  const return_date    = searchParams.get('return_date')     || '';
  const maxPrice       = searchParams.get('price') ? parseInt(searchParams.get('price')) : undefined;
  const adults         = parseInt(searchParams.get('adults') || '1');
  const currentQuery   = searchParams.toString();
  const hasPrefetched  = location.state?.prefetchedResult && location.state?.prefetchedQuery === currentQuery;
  const initialFlights = hasPrefetched ? mapFlightResult(location.state.prefetchedResult, maxPrice) : null;

  const [flights,   setFlights]   = useState(initialFlights);
  const [isLoading, setIsLoading] = useState(!!(origin && destination && departure_date && !initialFlights));
  const [error,     setError]     = useState('');

  const searchData = {
    from:       origin      || 'HAN',
    to:         destination || 'SGN',
    date:       departure_date,
    retDate:    return_date,
    passengers: String(adults),
    tripType:   return_date ? 'round' : 'one',
  };

  useEffect(() => {
    if (hasPrefetched) {
      applyFlightResult(location.state.prefetchedResult);
      return;
    }

    if (origin && destination && departure_date) {
      setIsLoading(true);
      fetchFlights();
      return;
    }

    setIsLoading(false);
    setFlights({ outbound: [], return: [] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, departure_date, return_date, adults, hasPrefetched, currentQuery]);

  function applyFlightResult(result) {
    setFlights(mapFlightResult(result, maxPrice));
    setError('');
    setIsLoading(false);
  }

  async function fetchFlights() {
    setIsLoading(true);
    setError('');
    try {
      if (!origin || !destination || !departure_date) {
        setFlights({ outbound: [], return: [] });
        return;
      }

      const result = await searchFlights({
        origin,
        destination,
        departure_date,
        return_date: return_date || undefined,
        adults,
      });
      applyFlightResult(result);
    } catch (err) {
      setError(err.message || 'Lỗi tải chuyến bay');
    } finally {
      setIsLoading(false);
    }
  }

  if (!searchParams.toString()) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '50vh', gap: 12,
        fontFamily: 'sans-serif', color: '#555',
      }}>
        <div style={{ fontSize: 48 }}>✈️</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Vui lòng nhập thông tin tìm kiếm</div>
        <div style={{ fontSize: 13, color: '#888' }}>Dùng thanh tìm kiếm ở trên để tìm chuyến bay</div>
        <button onClick={goBackToSearch} style={{
          marginTop: 8, padding: '10px 24px', background: '#1a3c6e',
          color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
        }}>← Quay lại</button>
      </div>
    );
  }

  return (
    <div>
      {(origin || destination || departure_date) && (
        <div style={{
          maxWidth: 700,
          margin: '16px auto 0',
          padding: '12px 16px',
          borderRadius: 10,
          background: '#eff6ff',
          color: '#1d4ed8',
          fontSize: 14,
          fontWeight: 500,
        }}>
          {return_date
            ? `Đang hiển thị hành trình khứ hồi ${origin} → ${destination}, đi ngày ${departure_date}, về ngày ${return_date}.`
            : `Đang hiển thị hành trình một chiều ${origin} → ${destination}, đi ngày ${departure_date}.`}
        </div>
      )}
      {error && (
        <div style={{
          padding: '12px 16px', background: '#fef2f2', color: '#dc2626',
          borderRadius: 6, margin: '16px auto', maxWidth: 700, fontSize: 14,
        }}>
          ⚠️ {error} —{' '}
          <button onClick={fetchFlights} style={{
            background: 'none', border: 'none', color: '#dc2626',
            cursor: 'pointer', textDecoration: 'underline',
          }}>Thử lại</button>
        </div>
      )}
      <FlightResults
        mode="buy"
        searchData={searchData}
        flights={flights}
        isLoading={isLoading}
        onBack={goBackToSearch}
      />
    </div>
  );
}
