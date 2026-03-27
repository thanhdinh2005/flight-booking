// FlightResults.jsx — Kết quả tìm kiếm chuyến bay
// Khi click vào card → mở panel chọn hạng vé (Economy / Business)
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import '../styles/Flightresult.css';


const MOCK_FLIGHTS = [
  {
    id: 1, airline: "Vietnam Airlines", code: "VN",
    flightNo: "VN-201", dep: "07:00", arr: "09:10", duration: "2g10p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Airbus A321",
    baggage: "1 xách tay 7kg", checkin: "23kg (có phí)",
    meal: "Có bữa ăn", entertainment: "Màn hình cá nhân", wifi: "Không",
    refund: "Phí 30% trước 24h", exchange: "Phí 200.000₫",
    logoColor: "#1a3c6e", logoText: "#fff",
    prices: { ECONOMY: 1250000, BUSINESS: 3800000 },
  },
  {
    id: 2, airline: "VietJet Air", code: "VJ",
    flightNo: "VJ-134", dep: "09:30", arr: "11:45", duration: "2g15p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Airbus A320",
    baggage: "1 xách tay 7kg", checkin: "Không (có thể mua thêm)",
    meal: "Không (có thể mua)", entertainment: "Không", wifi: "Không",
    refund: "Không hoàn", exchange: "Phí 300.000₫",
    logoColor: "#e5002b", logoText: "#fff",
    prices: { ECONOMY: 890000, BUSINESS: 2600000 },
  },
  {
    id: 3, airline: "Bamboo Airways", code: "QH",
    flightNo: "QH-401", dep: "13:15", arr: "15:25", duration: "2g10p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Boeing 737-800",
    baggage: "1 xách tay 10kg", checkin: "20kg",
    meal: "Snack miễn phí", entertainment: "Không", wifi: "Có (có phí)",
    refund: "Phí 25% trước 48h", exchange: "Phí 150.000₫",
    logoColor: "#00863d", logoText: "#fff",
    prices: { ECONOMY: 1050000, BUSINESS: 3100000 },
  },
  {
    id: 4, airline: "Vietnam Airlines", code: "VN",
    flightNo: "VN-205", dep: "16:00", arr: "18:15", duration: "2g15p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Boeing 787",
    baggage: "2 xách tay 14kg", checkin: "2 kiện 32kg",
    meal: "Bữa ăn đặc biệt", entertainment: "Màn hình 15\" + tai nghe", wifi: "Miễn phí",
    refund: "Miễn phí trước 24h", exchange: "Miễn phí",
    logoColor: "#1a3c6e", logoText: "#fff",
    prices: { ECONOMY: 1480000, BUSINESS: 4200000 },
  },
  {
    id: 5, airline: "VietJet Air", code: "VJ",
    flightNo: "VJ-156", dep: "20:00", arr: "22:10", duration: "2g10p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Airbus A320neo",
    baggage: "1 xách tay 7kg", checkin: "Không (có thể mua thêm)",
    meal: "Không (có thể mua)", entertainment: "Không", wifi: "Không",
    refund: "Không hoàn", exchange: "Phí 300.000₫",
    logoColor: "#e5002b", logoText: "#fff",
    prices: { ECONOMY: 750000, BUSINESS: 2200000 },
  },
];

const MOCK_BOOKED = [
  {
    id: "BK001", bookingCode: "VB-4X9K2",
    airline: "Vietnam Airlines", code: "VN",
    flightNo: "VN-201", dep: "07:00", arr: "09:10", duration: "2g10p",
    depAirport: "Nội Bài", depCode: "HAN",
    arrAirport: "Tân Sơn Nhất", arrCode: "SGN",
    aircraft: "Airbus A321",
    baggage: "1 xách tay 7kg", checkin: "23kg (có phí)",
    meal: "Có bữa ăn", entertainment: "Màn hình cá nhân", wifi: "Không",
    refund: "Phí 30% trước 24h", exchange: "Phí 200.000₫",
    logoColor: "#1a3c6e", logoText: "#fff",
    date: "20/04/2026", status: "confirmed",
    prices: { ECONOMY: 1250000, BUSINESS: 3800000 },
    passengers: [
      { name: "NGUYEN VAN AN", class: "Phổ thông" },
      { name: "TRAN THI BINH", class: "Phổ thông" },
    ],
  },
  {
    id: "BK002", bookingCode: "VB-4X9K2",
    airline: "VietJet Air", code: "VJ",
    flightNo: "VJ-156", dep: "20:00", arr: "22:10", duration: "2g10p",
    depAirport: "Tân Sơn Nhất", depCode: "SGN",
    arrAirport: "Nội Bài", arrCode: "HAN",
    aircraft: "Airbus A320",
    baggage: "1 xách tay 7kg", checkin: "Không (có thể mua thêm)",
    meal: "Không (có thể mua)", entertainment: "Không", wifi: "Không",
    refund: "Không hoàn", exchange: "Phí 300.000₫",
    logoColor: "#e5002b", logoText: "#fff",
    date: "28/04/2026", status: "confirmed",
    prices: { ECONOMY: 890000, BUSINESS: 2600000 },
    passengers: [
      { name: "NGUYEN VAN AN", class: "Phổ thông" },
      { name: "TRAN THI BINH", class: "Phổ thông" },
    ],
  },
];

function fmt(n) { return Number(n).toLocaleString("vi-VN") + "₫"; }

// ── Seat Class Config ─────────────────────────────────────────────────────────
const SEAT_CLASSES = {
  ECONOMY: {
    label: "Phổ thông",
    labelEn: "Economy",
    icon: "💺",
    color: "#1a3c6e",
    bgColor: "#f0f4fa",
    borderColor: "#1a3c6e",
    features: [
      "Hành lý xách tay 7kg",
      "Chỗ ngồi tiêu chuẩn",
      "Bữa ăn nhẹ (tùy hãng)",
      "Hoàn/đổi vé có phí",
    ],
  },
  BUSINESS: {
    label: "Thương gia",
    labelEn: "Business",
    icon: "👑",
    color: "#92400e",
    bgColor: "#fffbeb",
    borderColor: "#d97706",
    features: [
      "Hành lý ký gửi 32kg",
      "Ghế rộng / giường nằm",
      "Bữa ăn cao cấp",
      "Phòng chờ thương gia",
      "Ưu tiên boarding",
      "Hoàn/đổi vé miễn phí",
    ],
  },
};

// ── Seat Class Selector Modal ────────────────────────────────────────────────
function SeatClassPanel({ flight, pax, onSelect, onClose }) {
  const [chosen, setChosen] = useState(null);

  // Giá từ API hoặc từ prices map
  function getPrice(seatClass) {
    if (flight.prices?.[seatClass]) return flight.prices[seatClass];
    // Fallback: BUSINESS = 3x ECONOMY
    const base = flight.price || 0;
    return seatClass === "ECONOMY" ? base : base * 3;
  }

  function handleConfirm() {
    if (!chosen) return;
    onSelect(flight, chosen);
  }

  return (
    <div className="scp-overlay" onClick={onClose}>
      <div className="scp-drawer" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="scp-header">
          <div className="scp-header__flight">
            <div
              className="scp-header__logo"
              style={{ background: flight.logoColor, color: flight.logoText }}
            >
              {flight.code}
            </div>
            <div>
              <div className="scp-header__title">
                {flight.airline} · {flight.flightNo}
              </div>
              <div className="scp-header__route">
                {flight.depCode} {flight.dep} → {flight.arrCode} {flight.arr} · {flight.duration}
              </div>
            </div>
          </div>
          <button className="scp-close" onClick={onClose}>✕</button>
        </div>

        <div className="scp-eyebrow">Chọn hạng ghế</div>

        {/* Two class cards */}
        <div className="scp-cards">
          {Object.entries(SEAT_CLASSES).map(([key, cfg]) => {
            const price = getPrice(key);
            const isChosen = chosen === key;
            return (
              <div
                key={key}
                className={`scp-card${isChosen ? " scp-card--chosen" : ""}`}
                style={{
                  borderColor: isChosen ? cfg.borderColor : "#e5e7eb",
                  background: isChosen ? cfg.bgColor : "#fff",
                }}
                onClick={() => setChosen(key)}
              >
                {/* Badge */}
                <div
                  className="scp-card__badge"
                  style={{ background: cfg.color, color: "#fff" }}
                >
                  {cfg.icon} {cfg.label}
                </div>

                {/* Price */}
                <div className="scp-card__price">
                  <span
                    className="scp-card__price-amt"
                    style={{ color: cfg.color }}
                  >
                    {fmt(price * pax)}
                  </span>
                  <span className="scp-card__price-per">
                    {fmt(price)}/người · {pax} HK
                  </span>
                </div>

                {/* Features */}
                <ul className="scp-card__features">
                  {cfg.features.map((f, i) => (
                    <li key={i}>
                      <span
                        className="scp-card__check"
                        style={{ color: cfg.color }}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Selected indicator */}
                {isChosen && (
                  <div
                    className="scp-card__selected-mark"
                    style={{ background: cfg.color }}
                  >
                    ✓ Đã chọn
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="scp-footer">
          <button className="scp-cancel" onClick={onClose}>
            Huỷ
          </button>
          <button
            className="scp-confirm"
            disabled={!chosen}
            onClick={handleConfirm}
            style={{
              background: chosen
                ? SEAT_CLASSES[chosen].color
                : "#9ca3af",
              cursor: chosen ? "pointer" : "not-allowed",
            }}
          >
            {chosen
              ? `Tiếp tục với ${SEAT_CLASSES[chosen].label} →`
              : "Chọn hạng ghế để tiếp tục"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Flight Detail Modal ───────────────────────────────────────────────────────
function FlightDetailModal({ flight, pax, mode, onClose, onBuy }) {
  const isCheckin = mode === "checkin";
  const isPending = flight.status === "pending";
  const amenities = [
    flight.meal && !flight.meal.startsWith("Không") ? `🍽️ ${flight.meal}` : null,
    flight.wifi !== "Không" ? `📶 WiFi: ${flight.wifi}` : null,
    flight.entertainment !== "Không" ? `🎬 ${flight.entertainment}` : null,
  ].filter(Boolean);

  // Giá Economy để hiển thị trong modal
  const basePrice = flight.prices?.ECONOMY ?? flight.price ?? 0;

  return (
    <div className="fdm-overlay" onClick={onClose}>
      <div className="fdm-box" onClick={e => e.stopPropagation()}>

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

        <div className="fdm-section">
          <div className="fdm-sec-title">Thông tin chuyến bay</div>
          <div className="fdm-grid2">
            {[
              ["Số hiệu", flight.flightNo],
              ["Tàu bay", flight.aircraft],
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

        {/* Giá 2 hạng trong modal */}
        {!isCheckin && (
          <div className="fdm-section">
            <div className="fdm-sec-title">Giá vé (từ)</div>
            <div className="fdm-price-row">
              {Object.entries(SEAT_CLASSES).map(([key, cfg]) => (
                <div key={key} className="fdm-price-item" style={{ borderColor: cfg.borderColor }}>
                  <div className="fdm-price-item__label" style={{ color: cfg.color }}>
                    {cfg.icon} {cfg.label}
                  </div>
                  <div className="fdm-price-item__amt" style={{ color: cfg.color }}>
                    {fmt((flight.prices?.[key] ?? basePrice) * pax)}
                  </div>
                  <div className="fdm-price-item__per">
                    {fmt(flight.prices?.[key] ?? basePrice)}/người
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        <div className="fdm-section">
          <div className="fdm-sec-title">Hành lý</div>
          <table className="fdm-table">
            <tbody>
              <tr><td>Hành lý xách tay</td><td>{flight.baggage}</td></tr>
              <tr><td>Hành lý ký gửi</td><td>{flight.checkin}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="fdm-section">
          <div className="fdm-sec-title">Tiện ích trên máy bay</div>
          {amenities.length > 0
            ? <div className="fdm-chips">{amenities.map((a, i) => <span key={i} className="fdm-chip">{a}</span>)}</div>
            : <span className="fdm-none">Không có tiện ích bổ sung</span>
          }
        </div>

        <div className="fdm-section">
          <div className="fdm-sec-title">Điều kiện vé</div>
          <table className="fdm-table">
            <tbody>
              <tr><td>Hoàn vé</td><td>{flight.refund}</td></tr>
              <tr><td>Đổi vé</td><td>{flight.exchange}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="fdm-footer">
          <div>
            {!isCheckin ? (
              <>
                <div className="fdm-footer__price">
                  từ {fmt((flight.prices?.ECONOMY ?? basePrice) * pax)}
                </div>
                <div className="fdm-footer__per">
                  {fmt(flight.prices?.ECONOMY ?? basePrice)}/người · {pax} hành khách
                </div>
              </>
            ) : (
              <span className={`fdm-status-badge fdm-status-badge--${flight.status}`}>
                {flight.status === "confirmed" ? "✓ CONFIRMED" : "⚠ PENDING"}
              </span>
            )}
          </div>
          {!isCheckin ? (
            <button
              className="fdm-footer__buy"
              onClick={() => { onBuy(flight); onClose(); }}
            >
              Chọn hạng ghế →
            </button>
          ) : isPending ? (
            <span className="fdm-footer__pending-note">Chuyến chưa được xác nhận</span>
          ) : (
            <button
              className="fdm-footer__buy fdm-footer__buy--checkin"
              onClick={() => { onBuy(flight); onClose(); }}
            >
              Check-in chuyến này →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FlightResults({
  mode       = "buy",
  searchData = { from: "HAN", to: "SGN", date: "", retDate: "", passengers: "1", tripType: "one" },
  flights,
  isLoading,
  onSelect   = () => {},
  onBack     = () => {},
  navigateOnSelect = true,
}) {
  const [sort, setSort]               = useState("price");
  const [detailFlight, setDetailFlight] = useState(null);
  // Panel chọn hạng vé
  const [classFlight, setClassFlight] = useState(null);
  

  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const isCheckin      = mode === "checkin";
  const pax            = parseInt(searchData.passengers) || 1;

  // Mở panel chọn hạng vé
  function openClassPanel(f, e) {
    e?.stopPropagation();
    setClassFlight(f);
  }

  // Người dùng đã chọn hạng vé → build flight object → chuyển sang PassengerForm
  function handleSelectClass(f, seatClass) {
    const price = f.prices?.[seatClass] ?? f.price ?? 0;
    const classCfg = SEAT_CLASSES[seatClass];

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
      class:       classCfg.label,        // "Phổ thông" / "Thương gia"
      seat_class:  seatClass,             // "ECONOMY" / "BUSINESS" — gửi lên API
      price,
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

    setClassFlight(null); // đóng panel

    // Luồng nhúng trong TabMuaVe
    if (typeof onSelect === "function") {
      onSelect(flight);
    }

    // Luồng độc lập → navigate sang BuyTicketPage
    if (navigateOnSelect) {
      navigate("/buy-ticket", {
        state: {
          flight,
          searchData: {
            from:       searchData.from,
            to:         searchData.to,
            fromLabel:  searchData.fromLabel || searchData.from,
            toLabel:    searchData.toLabel   || searchData.to,
            date:       searchData.date,
            retDate:    searchData.retDate,
            passengers: searchData.passengers || "1",
            tripType:   searchData.tripType   || "one",
          },
        },
      });
    }
  }

  // ── URL params ──
  const urlOrigin = searchParams.get("origin")      || searchParams.get("from") || "";
  const urlDest   = searchParams.get("destination") || searchParams.get("to")   || "";
  const urlDate   = searchParams.get("date")        || searchParams.get("departure_date") || "";
  const urlPax    = searchParams.get("adults")      || searchParams.get("passengers")     || "";

  const displaySearchData = {
    ...searchData,
    from:       urlOrigin || searchData.from,
    to:         urlDest   || searchData.to,
    date:       urlDate   || searchData.date,
    passengers: urlPax    || searchData.passengers || "1",
  };

  const rawList  = isCheckin
    ? (flights?.outbound || MOCK_BOOKED)
    : (flights?.outbound || []);
  const dataList = isCheckin && searchData.bookingCode
    ? rawList.filter(f =>
        f.bookingCode?.toUpperCase().includes(searchData.bookingCode.toUpperCase()) &&
        (searchData.passengerName
          ? f.passengers?.some(p => p.name.toUpperCase().includes(searchData.passengerName.toUpperCase()))
          : true)
      )
    : rawList;

  const sorted = [...dataList].sort((a, b) => {
    // Sort dùng giá Economy làm giá so sánh
    const priceA = a.prices?.ECONOMY ?? a.price ?? 0;
    const priceB = b.prices?.ECONOMY ?? b.price ?? 0;
    return sort === "price"
      ? priceA - priceB
      : a.dep.localeCompare(b.dep);
  });

  const formattedFlights = sorted.map(f => ({
    ...f,
    airline:    f.airline    || "Vietnam Airlines",
    flightNo:   f.flightNo   || f.flight_number,
    dep:        f.dep        || f.dep_time,
    arr:        f.arr        || f.arr_time,
    depAirport: f.depAirport || f.origin_name || f.origin,
    arrAirport: f.arrAirport || f.destination_name || f.destination,
    depCode:    f.depCode    || f.origin,
    arrCode:    f.arrCode    || f.destination,
    duration:   f.duration   || "2g00p",
    aircraft:   f.aircraft   || "Airbus A321",
    // Đảm bảo prices map luôn có
    prices: f.prices || {
      ECONOMY:  f.price || 0,
      BUSINESS: (f.price || 0) * 3,
    },
  }));

  if (!isCheckin && flights == null) {
    return (
      <div className="fr-root">
        <div className="fr-container">
          <div className="fr-loading">
            <div className="fr-loading-spinner">⟳</div>
            <div>Đang tải kết quả chuyến bay...</div>
          </div>
        </div>
      </div>
    );
  }

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
    );
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
            <button className="fr-back-btn" onClick={onBack}>← Tìm lại</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Seat Class Panel */}
      {classFlight && (
        <SeatClassPanel
          flight={classFlight}
          pax={pax}
          onSelect={handleSelectClass}
          onClose={() => setClassFlight(null)}
        />
      )}

      {/* Flight Detail Modal */}
      {detailFlight && (
        <FlightDetailModal
          flight={detailFlight}
          pax={pax}
          mode={mode}
          onClose={() => setDetailFlight(null)}
          onBuy={f => { setDetailFlight(null); openClassPanel(f); }}
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
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560", alignSelf: "center", marginRight: 4 }}>
              Sắp xếp:
            </span>
            {(isCheckin
              ? [["dep", "Giờ khởi hành"]]
              : [["price", "Giá thấp nhất"], ["dep", "Giờ khởi hành"]]
            ).map(([v, l]) => (
              <button
                key={v}
                className={`fr-sort-btn${sort === v ? " active" : ""}`}
                onClick={() => setSort(v)}
              >
                {l}
              </button>
            ))}
          </div>

          {formattedFlights.map((f, i) => {
            const isPending     = f.status === "pending";
            const economyPrice  = f.prices.ECONOMY;
            const businessPrice = f.prices.BUSINESS;

            return (
              <div
                key={f.id}
                className="fr-card fr-card--clickable"
                style={{ opacity: isPending ? 0.65 : 1 }}
                // Click vào bất kỳ vùng nào của card → mở panel chọn hạng vé
                onClick={!isCheckin ? () => openClassPanel(f) : undefined}
              >
                <div className="fr-card__index">{String(i + 1).padStart(2, "0")}</div>

                <div className="fr-card__airline">
                  <div
                    className="fr-card__airline-logo"
                    style={{ background: f.logoColor, color: f.logoText }}
                  >
                    {f.code}
                  </div>
                  <div className="fr-card__airline-name">{f.airline}</div>
                  <div className="fr-card__airline-no">{f.flightNo}</div>
                </div>

                <div className="fr-card__times">
                  <div className="fr-card__time-row">
                    <span className="fr-card__dep">{f.dep}</span>
                    <span className="fr-card__arrow">——</span>
                    <span className="fr-card__arr">{f.arr}</span>
                  </div>
                  <div className="fr-card__duration">
                    {f.duration}
                    {isCheckin && f.date && <> · <b>{f.date}</b></>}
                  </div>
                </div>

                <div className="fr-card__stops">
                  <div className="fr-card__stops-dot" />
                  Bay thẳng
                </div>

                {/* Giá 2 hạng — chỉ hiện khi mua vé */}
                {!isCheckin && (
                  <div className="fr-card__prices">
                    <div className="fr-card__price-item fr-card__price-item--eco">
                      <span className="fr-card__price-class">💺 Phổ thông</span>
                      <span className="fr-card__price-amt">{fmt(economyPrice * pax)}</span>
                      <span className="fr-card__price-per">{fmt(economyPrice)}/người</span>
                    </div>
                    <div className="fr-card__price-divider" />
                    <div className="fr-card__price-item fr-card__price-item--biz">
                      <span className="fr-card__price-class">👑 Thương gia</span>
                      <span className="fr-card__price-amt">{fmt(businessPrice * pax)}</span>
                      <span className="fr-card__price-per">{fmt(businessPrice)}/người</span>
                    </div>
                  </div>
                )}

                {/* Trạng thái checkin */}
                {isCheckin && (
                  <div className="fr-card__price">
                    <div className={`fr-checkin-status fr-checkin-status--${f.status}`}>
                      {f.status === "confirmed" ? "✓ CONFIRMED" : "⚠ PENDING"}
                    </div>
                    <div className="fr-card__price-per">{f.passengers?.length} hành khách</div>
                  </div>
                )}

                {/* Actions */}
                <div className="fr-card__action" onClick={e => e.stopPropagation()}>
                  <button
                    className="fr-btn-detail"
                    onClick={e => { e.stopPropagation(); setDetailFlight(f); }}
                  >
                    Chi tiết
                  </button>

                  {!isCheckin ? (
                    <button
                      className="fr-btn-buy"
                      type="button"
                      onClick={e => { e.stopPropagation(); openClassPanel(f); }}
                    >
                      Chọn hạng ghế →
                    </button>
                  ) : isPending ? (
                    <button className="fr-btn-buy fr-btn-disabled" disabled>
                      Chưa xác nhận
                    </button>
                  ) : (
                    <button
                      className="fr-btn-buy fr-btn-checkin"
                      onClick={e => { e.stopPropagation(); openClassPanel(f); }}
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
