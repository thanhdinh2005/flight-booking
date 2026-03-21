// FlightResults.jsx — Kết quả tìm kiếm chuyến bay
// Aesthetic: Editorial / Newspaper — trắng sạch, typography nặng, grid bất đối xứng
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import '../styles/Flightresult.css';

const MOCK_FLIGHTS = [
  {
    id: 1, airline: "Vietnam Airlines", code: "VN",
    flightNo: "VN-201", dep: "07:00", arr: "09:10", duration: "2g10p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Airbus A321", price: 1250000, class: "Phổ thông",
    baggage: "1 xách tay 7kg", checkin: "23kg (có phí)",
    meal: "Có bữa ăn", entertainment: "Màn hình cá nhân", wifi: "Không",
    refund: "Phí 30% trước 24h", exchange: "Phí 200.000₫",
    logoColor: "#1a3c6e", logoText: "#fff",
  },
  {
    id: 2, airline: "VietJet Air", code: "VJ",
    flightNo: "VJ-134", dep: "09:30", arr: "11:45", duration: "2g15p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Airbus A320", price: 890000, class: "Phổ thông",
    baggage: "1 xách tay 7kg", checkin: "Không (có thể mua thêm)",
    meal: "Không (có thể mua)", entertainment: "Không", wifi: "Không",
    refund: "Không hoàn", exchange: "Phí 300.000₫",
    logoColor: "#e5002b", logoText: "#fff",
  },
  {
    id: 3, airline: "Bamboo Airways", code: "QH",
    flightNo: "QH-401", dep: "13:15", arr: "15:25", duration: "2g10p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Boeing 737-800", price: 1050000, class: "Phổ thông",
    baggage: "1 xách tay 10kg", checkin: "20kg",
    meal: "Snack miễn phí", entertainment: "Không", wifi: "Có (có phí)",
    refund: "Phí 25% trước 48h", exchange: "Phí 150.000₫",
    logoColor: "#00863d", logoText: "#fff",
  },
  {
    id: 4, airline: "Vietnam Airlines", code: "VN",
    flightNo: "VN-205", dep: "16:00", arr: "18:15", duration: "2g15p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Boeing 787", price: 1480000, class: "Thương gia",
    baggage: "2 xách tay 14kg", checkin: "2 kiện 32kg",
    meal: "Bữa ăn đặc biệt", entertainment: "Màn hình 15\" + tai nghe", wifi: "Miễn phí",
    refund: "Miễn phí trước 24h", exchange: "Miễn phí",
    logoColor: "#1a3c6e", logoText: "#fff",
  },
  {
    id: 5, airline: "VietJet Air", code: "VJ",
    flightNo: "VJ-156", dep: "20:00", arr: "22:10", duration: "2g10p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Airbus A320neo", price: 750000, class: "Phổ thông",
    baggage: "1 xách tay 7kg", checkin: "Không (có thể mua thêm)",
    meal: "Không (có thể mua)", entertainment: "Không", wifi: "Không",
    refund: "Không hoàn", exchange: "Phí 300.000₫",
    logoColor: "#e5002b", logoText: "#fff",
  },
];

// ── Mock data vé đã đặt (dùng cho mode="checkin") ──────────────────────────
const MOCK_BOOKED = [
  {
    id: "BK001", bookingCode: "VB-4X9K2",
    airline: "Vietnam Airlines", code: "VN",
    flightNo: "VN-201", dep: "07:00", arr: "09:10", duration: "2g10p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Airbus A321", price: 1250000, class: "Phổ thông",
    baggage: "1 xách tay 7kg", checkin: "23kg (có phí)",
    meal: "Có bữa ăn", entertainment: "Màn hình cá nhân", wifi: "Không",
    refund: "Phí 30% trước 24h", exchange: "Phí 200.000₫",
    logoColor: "#1a3c6e", logoText: "#fff",
    date: "20/04/2026", status: "confirmed",
    passengers: [
      { name: "NGUYEN VAN AN",  class: "Phổ thông" },
      { name: "TRAN THI BINH", class: "Phổ thông" },
    ],
  },
  {
    id: "BK002", bookingCode: "VB-4X9K2",
    airline: "VietJet Air", code: "VJ",
    flightNo: "VJ-156", dep: "20:00", arr: "22:10", duration: "2g10p",
    depAirport: "Tân Sơn Nhất", depCode: "SGN",
    arrAirport: "Nội Bài", arrCode: "HAN",
    aircraft: "Airbus A320", price: 890000, class: "Phổ thông",
    baggage: "1 xách tay 7kg", checkin: "Không (có thể mua thêm)",
    meal: "Không (có thể mua)", entertainment: "Không", wifi: "Không",
    refund: "Không hoàn", exchange: "Phí 300.000₫",
    logoColor: "#e5002b", logoText: "#fff",
    date: "28/04/2026", status: "confirmed",
    passengers: [
      { name: "NGUYEN VAN AN",  class: "Phổ thông" },
      { name: "TRAN THI BINH", class: "Phổ thông" },
    ],
  },
  {
    id: "BK003", bookingCode: "VB-7M2P1",
    airline: "Bamboo Airways", code: "QH",
    flightNo: "QH-401", dep: "13:15", arr: "15:25", duration: "2g10p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Đà Nẵng", arrCode: "DAD",
    aircraft: "Boeing 737-800", price: 1050000, class: "Phổ thông",
    baggage: "1 xách tay 10kg", checkin: "20kg",
    meal: "Snack miễn phí", entertainment: "Không", wifi: "Có (có phí)",
    refund: "Phí 25% trước 48h", exchange: "Phí 150.000₫",
    logoColor: "#00863d", logoText: "#fff",
    date: "15/05/2026", status: "pending",
    passengers: [
      { name: "NGUYEN VAN AN", class: "Phổ thông" },
    ],
  },
];

function fmt(n) { return n.toLocaleString("vi-VN") + "₫"; }

// ── Flight Detail Modal ──────────────────────────────────────────────────────
function FlightDetailModal({ flight, pax, mode, onClose, onBuy }) {
  const isCheckin = mode === "checkin";
  const isPending = flight.status === "pending";
  const amenities = [
    flight.meal && !flight.meal.startsWith("Không") ? `🍽️ ${flight.meal}` : null,
    flight.wifi !== "Không" ? `📶 WiFi: ${flight.wifi}` : null,
    flight.entertainment !== "Không" ? `🎬 ${flight.entertainment}` : null,
  ].filter(Boolean);

  return (
    <div className="fdm-overlay" onClick={onClose}>
      <div className="fdm-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="fdm-header">
          <div>
            <div className="fdm-header__eyebrow">Chi tiết chuyến bay</div>
            <div className="fdm-header__title">{flight.airline}</div>
            <div className="fdm-header__sub">
              {flight.flightNo} · {flight.aircraft}
              {isCheckin && flight.date && <> · {flight.date}</>}
            </div>
          </div>
          <button className="fdm-close" onClick={onClose}>✕</button>
        </div>

        {/* Timeline */}
        <div className="fdm-timeline">
          <div className="fdm-tl-point">
            <div className="fdm-tl-time">{flight.dep}</div>
            <div className="fdm-tl-code">{flight.depCode}</div>
            <div className="fdm-tl-city">{flight.depAirport}</div>
          </div>
          <div className="fdm-tl-mid">
            <div className="fdm-tl-dur">{flight.duration}</div>
            <div className="fdm-tl-track"><span className="fdm-tl-plane">✈</span></div>
            <div className="fdm-tl-nonstop">Bay thẳng</div>
          </div>
          <div className="fdm-tl-point fdm-tl-point--right">
            <div className="fdm-tl-time">{flight.arr}</div>
            <div className="fdm-tl-code">{flight.arrCode}</div>
            <div className="fdm-tl-city">{flight.arrAirport}</div>
          </div>
        </div>

        {/* Flight info */}
        <div className="fdm-section">
          <div className="fdm-sec-title">Thông tin chuyến bay</div>
          <div className="fdm-grid2">
            {[
              ["Số hiệu", flight.flightNo],
              ["Tàu bay", flight.aircraft],
              ["Hạng ghế", flight.class],
              ["Thời gian bay", flight.duration],
              ["Điểm khởi hành", `${flight.depAirport} (${flight.depCode})`],
              ["Điểm đến", `${flight.arrAirport} (${flight.arrCode})`],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="fdm-kv__k">{k}</div>
                <div className="fdm-kv__v">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Passengers — chỉ hiện khi checkin */}
        {isCheckin && flight.passengers?.length > 0 && (
          <div className="fdm-section">
            <div className="fdm-sec-title">Hành khách ({flight.passengers.length})</div>
            <table className="fdm-table">
              <tbody>
                {flight.passengers.map(p => (
                  <tr key={p.name}><td>{p.name}</td><td>{p.class}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Baggage */}
        <div className="fdm-section">
          <div className="fdm-sec-title">Hành lý</div>
          <table className="fdm-table">
            <tbody>
              <tr><td>Hành lý xách tay</td><td>{flight.baggage}</td></tr>
              <tr><td>Hành lý ký gửi</td><td>{flight.checkin}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Amenities */}
        <div className="fdm-section">
          <div className="fdm-sec-title">Tiện ích trên máy bay</div>
          {amenities.length > 0
            ? <div className="fdm-chips">{amenities.map((a, i) => <span key={i} className="fdm-chip">{a}</span>)}</div>
            : <span className="fdm-none">Không có tiện ích bổ sung</span>
          }
        </div>

        {/* Fare conditions */}
        <div className="fdm-section">
          <div className="fdm-sec-title">Điều kiện vé</div>
          <table className="fdm-table">
            <tbody>
              <tr><td>Hoàn vé</td><td>{flight.refund}</td></tr>
              <tr><td>Đổi vé</td><td>{flight.exchange}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Sticky footer */}
        <div className="fdm-footer">
          <div>
            {!isCheckin ? (
              <>
                <div className="fdm-footer__price">{fmt(flight.price * pax)}</div>
                <div className="fdm-footer__per">{fmt(flight.price)}/người · {pax} hành khách</div>
              </>
            ) : (
              <span className={`fdm-status-badge fdm-status-badge--${flight.status}`}>
                {flight.status === "confirmed" ? "✓ CONFIRMED" : "⚠ PENDING"}
              </span>
            )}
          </div>
          {!isCheckin ? (
            <button className="fdm-footer__buy" onClick={() => { onBuy(flight); onClose(); }}>
              Mua ngay →
            </button>
          ) : isPending ? (
            <span className="fdm-footer__pending-note">Chuyến chưa được xác nhận</span>
          ) : (
            <button className="fdm-footer__buy fdm-footer__buy--checkin"
              onClick={() => { onBuy(flight); onClose(); }}>
              Check-in chuyến này →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function FlightResults({
  mode       = "buy",
  searchData = { from: "HAN", to: "SGN", date: "2026-04-01", passengers: "2" },
  flights,
  isLoading,
  onSelect   = () => {},
  onBack     = () => {},
}) {
  const [sort, setSort] = useState("price");
  const [detailFlight, setDetailFlight] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCheckin = mode === "checkin";
  const pax = parseInt(searchData.passengers) || 1;

  // Chuẩn hoá flight object để đảm bảo đủ field cho PassengerForm
  function handleBuy(f) {
    const flight = {
      id:          f.id,
      airline:     f.airline,
      flightNo:    f.flightNo || f.flight_number,
      dep:         f.dep || f.dep_time,
      arr:         f.arr || f.arr_time,
      depAirport:  f.depAirport || f.origin_name || f.origin,
      arrAirport:  f.arrAirport || f.destination_name || f.destination,
      depCode:     f.depCode || f.origin,
      arrCode:     f.arrCode || f.destination,
      duration:    f.duration,
      aircraft:    f.aircraft,
      class:       f.class,
      price:       f.price,
      baggage:     f.baggage,
      checkin:     f.checkin,
      meal:        f.meal,
      wifi:        f.wifi,
      refund:      f.refund,
      exchange:    f.exchange,
      logoColor:   f.logoColor,
      logoText:    f.logoText,
      code:        f.code,
    };

    // Luồng nhúng trong TabMuaVe → gọi callback để TabMuaVe chuyển screen
    if (typeof onSelect === 'function') {
      onSelect(flight);
    }

    // Luồng độc lập từ Topbar → navigate sang trang mua vé
    // (dù onSelect có hay không, luôn navigate để đảm bảo điều hướng)
    navigate('/buy-ticket', {
      state: {
        flight,
        searchData: {
          from:       searchData.from,
          to:         searchData.to,
          fromLabel:  searchData.fromLabel || searchData.from,
          toLabel:    searchData.toLabel   || searchData.to,
          date:       searchData.date,
          retDate:    searchData.retDate,
          passengers: searchData.passengers || '1',
          tripType:   searchData.tripType   || 'one',
        },
      },
    });
  }
  
  // Đọc params từ URL (khi điều hướng từ Topbar)
  const searchQuery  = searchParams.get('q')          || '';
  const urlOrigin    = searchParams.get('origin')     || searchParams.get('from') || '';
  const urlDest      = searchParams.get('destination')|| searchParams.get('to')   || '';
  const urlDate      = searchParams.get('date')       || searchParams.get('departure_date') || '';
  const urlPax       = searchParams.get('adults')     || searchParams.get('passengers')     || '';

  // Merge URL params vào searchData — URL params có độ ưu tiên cao hơn props
  const displaySearchData = {
    ...searchData,
    from:       urlOrigin  || searchData.from,
    to:         urlDest    || searchData.to,
    date:       urlDate    || searchData.date,
    passengers: urlPax     || searchData.passengers || '1',
  };

  // Use flights from props if provided, otherwise use mock data
  const rawList = flights?.outbound || (isCheckin ? MOCK_BOOKED : MOCK_FLIGHTS);
  
  const dataList = isCheckin && searchData.bookingCode
    ? rawList.filter(f =>
        f.bookingCode?.toUpperCase().includes(searchData.bookingCode.toUpperCase()) &&
        (searchData.passengerName
          ? f.passengers?.some(p => p.name.toUpperCase().includes(searchData.passengerName.toUpperCase()))
          : true)
      )
    : rawList;

  const sorted = [...dataList].sort((a, b) =>
    sort === "price" ? a.price - b.price : a.dep.localeCompare(b.dep)
  );
  
  // Format flight data to ensure consistent structure
  const formattedFlights = sorted.map(f => ({
    ...f,
    airline: f.airline || 'Vietnam Airlines',
    flightNo: f.flightNo || f.flight_number,
    dep: f.dep || f.dep_time,
    arr: f.arr || f.arr_time,
    depAirport: f.depAirport || f.origin_name || f.origin,
    arrAirport: f.arrAirport || f.destination_name || f.destination,
    depCode: f.depCode || f.origin,
    arrCode: f.arrCode || f.destination,
    price: f.price || 0,
    duration: f.duration || '2g00p',
    aircraft: f.aircraft || 'Airbus A321',
  }));

  if (isLoading) {
    return (
      <div className="fr-root">
        <div className="fr-container">
          <div className="fr-loading">
            <div className="fr-loading-spinner">⟳</div>
            <div>Đang tìm chuyến bay...</div>
          </div>
        </div>
      </div>
    )
  }

  if (formattedFlights.length === 0) {
    return (
      <div className="fr-root">
        <div className="fr-container">
          <div className="fr-empty">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1a3c6e", marginBottom: 8 }}>
              Không tìm thấy chuyến bay
            </div>
            <div style={{ fontSize: 13, color: "#6b6560", marginBottom: 16 }}>
              Vui lòng thử tìm kiếm với tiêu chí khác
            </div>
            <button className="fr-back-btn" onClick={onBack}>
              ← Tìm lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      

      {detailFlight && (
        <FlightDetailModal
          flight={detailFlight}
          pax={pax}
          mode={mode}
          onClose={() => setDetailFlight(null)}
          onBuy={handleBuy}
        />
      )}

      <div className="fr-root">
        <div className="fr-container">

          <div className="fr-masthead">
            <div className="fr-masthead__route">
              {displaySearchData.from} <span>→</span> {displaySearchData.to}
            </div>
            <div className="fr-masthead__meta">
              {isCheckin ? (
                <>
                  <span>Mã: <b>{displaySearchData.bookingCode || "—"}</b></span>
                  <span>HK: <b>{displaySearchData.passengerName || "—"}</b></span>
                </>
              ) : (
                <>
                  <span><b>{displaySearchData.date}</b></span>
                  <span><b>{pax}</b> hành khách</span>
                  <span>Bay thẳng</span>
                </>
              )}
            </div>
          </div>

          <div className="fr-count">
            {isCheckin
              ? `${dataList.length} vé đã đặt`
              : `${formattedFlights.length} chuyến bay được tìm thấy`}
          </div>

          <div className="fr-sortbar">
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560", alignSelf: "center", marginRight: 4 }}>Sắp xếp:</span>
            {(isCheckin
              ? [["dep","Giờ khởi hành"]]
              : [["price","Giá thấp nhất"],["dep","Giờ khởi hành"]]
            ).map(([v, l]) => (
              <button key={v} className={`fr-sort-btn${sort === v ? " active" : ""}`} onClick={() => setSort(v)}>{l}</button>
            ))}
          </div>

          {formattedFlights.map((f, i) => {
            const isPending = f.status === "pending";
            return (
            <div key={f.id} className="fr-card" style={{ opacity: isPending ? 0.65 : 1 }}>
              <div className="fr-card__index">{String(i + 1).padStart(2, "0")}</div>

              <div className="fr-card__airline">
                <div className="fr-card__airline-logo" style={{ background: f.logoColor, color: f.logoText }}>
                  {f.code}
                </div>
                <div className="fr-card__airline-name">{f.airline}</div>
                <div className="fr-card__airline-class">{f.class}</div>
              </div>

              <div className="fr-card__times">
                <div className="fr-card__time-row">
                  <span className="fr-card__dep">{f.dep}</span>
                  <span className="fr-card__arrow">——</span>
                  <span className="fr-card__arr">{f.arr}</span>
                </div>
                <div className="fr-card__duration">
                  {f.duration} · {f.flightNo}
                  {isCheckin && f.date && <> · <b>{f.date}</b></>}
                </div>
              </div>

              <div className="fr-card__stops">
                <div className="fr-card__stops-dot" />
                Bay thẳng
              </div>

              {/* Giá chỉ hiện khi mua vé */}
              {!isCheckin && (
                <div className="fr-card__price">
                  <div className="fr-card__price-amt">{fmt(f.price * pax)}</div>
                  <div className="fr-card__price-per">{fmt(f.price)}/người</div>
                </div>
              )}

              {/* Trạng thái chỉ hiện khi checkin */}
              {isCheckin && (
                <div className="fr-card__price">
                  <div className={`fr-checkin-status fr-checkin-status--${f.status}`}>
                    {f.status === "confirmed" ? "✓ CONFIRMED" : "⚠ PENDING"}
                  </div>
                  <div className="fr-card__price-per">{f.passengers?.length} hành khách</div>
                </div>
              )}

              {/* Hai nút hành động */}
              <div className="fr-card__action">
                <button
                  className="fr-btn-detail"
                  onClick={e => { e.stopPropagation(); setDetailFlight(f); }}
                >
                  Xem chi tiết
                </button>

                {!isCheckin ? (
                  <button
                    className="fr-btn-buy"
                    type="button"
                    onClick={e => { e.stopPropagation(); handleBuy(f); }}
                  >
                    Mua ngay →
                  </button>
                ) : isPending ? (
                  <button className="fr-btn-buy fr-btn-disabled" disabled>
                    Chưa xác nhận
                  </button>
                ) : (
                  <button
                    className="fr-btn-buy fr-btn-checkin"
                    onClick={e => { e.stopPropagation(); handleBuy(f); }}
                  >
                    Check-in →
                  </button>
                )}
            </div>
          </div>
          );
        })}

        <div className="fr-footer">
          <button className="fr-back-btn" onClick={onBack}>← Tìm lại</button>
          <span style={{ fontSize: 12, color: "#6b6560" }}>
            {isCheckin ? "Chọn chuyến để tiến hành check-in" : "Giá đã bao gồm thuế & phí"}
          </span>
        </div>

      </div>
    </div>
  </>
);
}