// src/components/tabs/TabQuanLy.jsx
// Luồng: Nhập số hiệu bay → hiển thị trạng thái chuyến bay theo style Việt Jett
import { useState } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .tql-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    --teal:       #2aabab;
    --teal-dark:  #1e8888;
    --teal-dim:   rgba(42,171,171,0.10);
    --teal-mid:   rgba(42,171,171,0.22);
    --bg:         #f0fafa;
    --card:       #ffffff;
    --ink:        #1a2a2a;
    --muted:      #5a7a7a;
    --border:     #c8e8e8;
    --success:    #17a07a;
    --warn:       #e89b20;
    --danger:     #e05252;
  }

  /* ── Search form ─────────────────────────────────── */
  .tql-form {
    display: flex; align-items: flex-end;
    gap: 12px; flex-wrap: wrap;
    padding: 4px 0 16px;
  }
  .tql-field {
    display: flex; flex-direction: column; gap: 5px;
    flex: 1; min-width: 160px;
  }
  .tql-field label {
    font-size: 11px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    color: var(--muted);
  }
  .tql-input {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    color: var(--ink);
    padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: 9px;
    background: var(--card);
    outline: none;
    transition: border-color .15s;
    width: 100%;
    box-sizing: border-box;
  }
  .tql-input:focus { border-color: var(--teal); }
  .tql-input::placeholder { color: #aac8c8; font-weight: 400; }

  .tql-btn {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 700;
    padding: 11px 28px;
    background: var(--teal); color: #fff;
    border: none; border-radius: 9px;
    cursor: pointer; white-space: nowrap;
    transition: background .15s, transform .1s;
    align-self: flex-end;
  }
  .tql-btn:hover { background: var(--teal-dark); }
  .tql-btn:active { transform: scale(.97); }
  .tql-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* ── Loading skeleton ────────────────────────────── */
  .tql-loading {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 0; color: var(--muted);
    font-size: 13px; font-weight: 600;
  }
  .tql-spinner {
    width: 18px; height: 18px;
    border: 2px solid var(--teal-dim);
    border-top-color: var(--teal);
    border-radius: 50%;
    animation: tql-spin .7s linear infinite;
  }
  @keyframes tql-spin { to { transform: rotate(360deg); } }

  /* ── Error ───────────────────────────────────────── */
  .tql-error {
    padding: 12px 16px;
    background: rgba(224,82,82,0.08);
    border: 1px solid rgba(224,82,82,0.25);
    border-radius: 9px;
    color: var(--danger);
    font-size: 13px; font-weight: 600;
    margin-top: 8px;
  }

  /* ── Result card ─────────────────────────────────── */
  .tql-result {
    margin-top: 20px;
    animation: tql-fadeup .3s ease;
  }
  @keyframes tql-fadeup {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .tql-result__header { margin-bottom: 20px; }
  .tql-result__title {
    font-size: 22px; font-weight: 700; color: var(--ink);
    margin-bottom: 10px;
  }
  .tql-result__route-label {
    font-size: 11px; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--teal); margin-bottom: 6px;
    display: flex; align-items: center; gap: 6px;
  }
  .tql-result__route-label::before {
    content: ''; display: inline-block;
    width: 16px; height: 1px; background: var(--teal);
  }
  .tql-result__airports {
    display: flex; align-items: center; gap: 12px;
    font-size: 16px; font-weight: 600; color: var(--ink);
    flex-wrap: wrap;
  }
  .tql-result__airports .swap-icon {
    font-size: 18px; color: var(--teal);
  }
  .tql-result__date {
    font-size: 13px; color: var(--muted); margin-top: 4px;
  }

  .tql-card {
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(42,171,171,0.08);
  }

  /* Card top strip – airline info */
  .tql-card__airline-bar {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
  }
  .tql-card__airline-logo {
    font-size: 22px;
  }
  .tql-card__flight-no {
    font-size: 15px; font-weight: 700; color: var(--teal);
  }
  .tql-card__airline-divider {
    width: 1px; height: 18px;
    background: var(--border);
  }
  .tql-card__operator {
    font-size: 12px; color: var(--muted); font-weight: 500;
  }

  /* Status badge */
  .tql-status {
    margin-left: auto;
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 13px; border-radius: 100px;
    font-size: 12px; font-weight: 700;
  }
  .tql-status--landed {
    background: rgba(23,160,122,0.12); color: var(--success);
  }
  .tql-status--ontime {
    background: rgba(42,171,171,0.12); color: var(--teal);
  }
  .tql-status--delayed {
    background: rgba(232,155,32,0.12); color: var(--warn);
  }
  .tql-status--cancelled {
    background: rgba(224,82,82,0.10); color: var(--danger);
  }

  /* Flight timeline */
  .tql-card__body {
    display: flex; align-items: center;
    padding: 24px 20px; gap: 12px;
  }
  .tql-point { min-width: 120px; }
  .tql-point--right { text-align: right; min-width: 120px; }

  .tql-point__sched {
    font-size: 11px; color: var(--muted);
    margin-bottom: 2px;
  }
  .tql-point__sched span { color: var(--ink); font-weight: 600; }
  .tql-point__actual-label {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px;
    color: var(--teal); margin-bottom: 2px;
  }
  .tql-point__time {
    font-size: 32px; font-weight: 700; color: var(--ink);
    line-height: 1;
  }
  .tql-point__code {
    font-size: 18px; font-weight: 700; color: var(--ink);
    margin-top: 4px;
  }
  .tql-point__city { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .tql-point__terminal { font-size: 11px; color: var(--muted); }
  .tql-point__date-small { font-size: 11px; color: var(--muted); margin-top: 2px; }

  .tql-track {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; gap: 8px;
  }
  .tql-track__line {
    width: 100%; height: 1.5px;
    background: linear-gradient(90deg, var(--teal), rgba(42,171,171,0.3));
    position: relative;
  }
  .tql-track__plane {
    position: absolute; right: -1px; top: -8px;
    font-size: 16px; color: var(--teal);
  }
  .tql-track__status-pill {
    display: inline-flex; align-items: center; gap: 5px;
    border: 1.5px solid var(--success);
    color: var(--success);
    background: rgba(23,160,122,0.07);
    font-size: 11px; font-weight: 700;
    padding: 4px 12px; border-radius: 100px;
    letter-spacing: .3px;
  }

  /* Extra info row */
  .tql-card__extra {
    display: flex; gap: 0;
    border-top: 1px solid var(--border);
  }
  .tql-card__extra-item {
    flex: 1; padding: 12px 20px;
    border-right: 1px solid var(--border);
  }
  .tql-card__extra-item:last-child { border-right: none; }
  .tql-card__extra-label {
    font-size: 10px; font-weight: 600;
    letter-spacing: 1px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 4px;
  }
  .tql-card__extra-value {
    font-size: 13px; font-weight: 700; color: var(--ink);
  }

  @media (max-width: 620px) {
    .tql-card__body { flex-direction: column; align-items: flex-start; }
    .tql-point--right { text-align: left; }
    .tql-track { width: 100%; }
    .tql-card__extra { flex-direction: column; }
    .tql-card__extra-item { border-right: none; border-bottom: 1px solid var(--border); }
    .tql-card__extra-item:last-child { border-bottom: none; }
  }
`;

// ── Mock data flights ─────────────────────────────────────────────────────────
const MOCK_FLIGHTS = {
  'VN134': {
    flightNo: 'VN 134', operator: 'VIETNAM AIRLINES', logo: '🌸',
    from: 'Tp. Hồ Chí Minh (SGN), Việt Nam', fromCode: 'SGN', fromTerminal: 'Nhà ga 3',
    to: 'Đà Nẵng (DAD), Việt Nam', toCode: 'DAD', toTerminal: 'Nhà ga 1',
    date: 'Thứ 7 Ngày 14 tháng 3, 2026', dateShort: '14/03/2026',
    schedDep: '15:15', actualDep: '15:11',
    schedArr: '16:35', actualArr: '16:20',
    status: 'landed', statusLabel: '✓ Đã hạ cánh',
    aircraft: 'Airbus A321', duration: '1g 05p', gate: 'B12',
  },
  'VJ156': {
    flightNo: 'VJ 156', operator: 'VIETJET AIR', logo: '🔴',
    from: 'Nội Bài, Hà Nội (HAN)', fromCode: 'HAN', fromTerminal: 'Nhà ga 2',
    to: 'Tân Sơn Nhất (SGN)', toCode: 'SGN', toTerminal: 'Nhà ga 1',
    date: 'Thứ 7 Ngày 14 tháng 3, 2026', dateShort: '14/03/2026',
    schedDep: '20:00', actualDep: '20:15',
    schedArr: '22:10', actualArr: '22:25',
    status: 'delayed', statusLabel: '⚠ Trễ 15 phút',
    aircraft: 'Airbus A320neo', duration: '2g 10p', gate: 'C4',
  },
  'QH401': {
    flightNo: 'QH 401', operator: 'BAMBOO AIRWAYS', logo: '🎋',
    from: 'Nội Bài, Hà Nội (HAN)', fromCode: 'HAN', fromTerminal: 'Nhà ga 1',
    to: 'Đà Nẵng (DAD), Việt Nam', toCode: 'DAD', toTerminal: 'Nhà ga 1',
    date: 'Thứ 7 Ngày 14 tháng 3, 2026', dateShort: '14/03/2026',
    schedDep: '13:15', actualDep: '13:15',
    schedArr: '15:25', actualArr: '15:25',
    status: 'ontime', statusLabel: '✓ Đúng giờ',
    aircraft: 'Boeing 737-800', duration: '2g 10p', gate: 'A7',
  },
};

const STATUS_CLASS = {
  landed: 'tql-status--landed',
  ontime: 'tql-status--ontime',
  delayed: 'tql-status--delayed',
  cancelled: 'tql-status--cancelled',
};

export default function TabQuanLy({ onAction }) {
  const [flightNo, setFlightNo] = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  function handleSearch() {
    const key = flightNo.replace(/\s/g, '').toUpperCase();
    if (!key) { setError('Vui lòng nhập số hiệu bay!'); return; }
    setError(''); setResult(null); setLoading(true);
    if (onAction) onAction('📊 Đang kiểm tra trạng thái chuyến bay...');

    setTimeout(() => {
      setLoading(false);
      const data = MOCK_FLIGHTS[key];
      if (data) {
        setResult(data);
        if (onAction) onAction(`✈️ Tìm thấy chuyến bay ${data.flightNo}`);
      } else {
        setError(`Không tìm thấy chuyến bay "${flightNo}". Thử: VN 134, VJ 156, QH 401`);
        if (onAction) onAction('⚠️ Không tìm thấy chuyến bay');
      }
    }, 900);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  const trackPill = result?.status === 'landed'
    ? <div className="tql-track__status-pill">✓ Đã hạ cánh</div>
    : result?.status === 'delayed'
    ? <div className="tql-track__status-pill" style={{ borderColor: 'var(--warn)', color: 'var(--warn)', background: 'rgba(232,155,32,0.07)' }}>⚠ Trễ giờ</div>
    : <div className="tql-track__status-pill">✓ Đúng giờ</div>;

  return (
    <>
      <style>{css}</style>
      <div className="tql-root">

        {/* Form */}
        <div className="tql-form">
          <div className="tql-field">
            <label>Số hiệu chuyến bay</label>
            <input
              className="tql-input"
              placeholder="VD: VN 134, VJ 156, QH 401"
              value={flightNo}
              onChange={e => { setFlightNo(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button className="tql-btn" onClick={handleSearch} disabled={loading}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>

        {/* Error */}
        {error && <div className="tql-error">⚠ {error}</div>}

        {/* Loading */}
        {loading && (
          <div className="tql-loading">
            <div className="tql-spinner" />
            Đang kiểm tra trạng thái chuyến bay...
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="tql-result">
            <div className="tql-result__header">
              <div className="tql-result__title">Trạng thái chuyến bay</div>
              <div className="tql-result__route-label">Chặng bay</div>
              <div className="tql-result__airports">
                <span>{result.from}</span>
                <span className="swap-icon">⇌</span>
                <span>{result.to}</span>
              </div>
              <div className="tql-result__date">{result.date}</div>
            </div>

            <div className="tql-card">
              {/* Airline bar */}
              <div className="tql-card__airline-bar">
                <span className="tql-card__airline-logo">{result.logo}</span>
                <span className="tql-card__flight-no">{result.flightNo}</span>
                <div className="tql-card__airline-divider" />
                <span className="tql-card__operator">Khai thác bởi {result.operator}</span>
                <span className={`tql-status ${STATUS_CLASS[result.status]}`}>
                  {result.statusLabel}
                </span>
              </div>

              {/* Timeline */}
              <div className="tql-card__body">
                {/* Departure */}
                <div className="tql-point">
                  <div className="tql-point__sched">Đã lên lịch <span>{result.schedDep}</span></div>
                  <div className="tql-point__actual-label">Thực tế</div>
                  <div className="tql-point__time">{result.actualDep}</div>
                  <div className="tql-point__code">{result.fromCode}</div>
                  <div className="tql-point__city">{result.from}</div>
                  <div className="tql-point__terminal">{result.fromTerminal}</div>
                  <div className="tql-point__date-small">{result.dateShort}</div>
                </div>

                {/* Track */}
                <div className="tql-track">
                  <div className="tql-track__line">
                    <span className="tql-track__plane">✈</span>
                  </div>
                  {trackPill}
                </div>

                {/* Arrival */}
                <div className="tql-point tql-point--right">
                  <div className="tql-point__sched">Đã lên lịch <span>{result.schedArr}</span></div>
                  <div className="tql-point__actual-label">Thực tế</div>
                  <div className="tql-point__time">{result.actualArr}</div>
                  <div className="tql-point__code">{result.toCode}</div>
                  <div className="tql-point__city">{result.to}</div>
                  <div className="tql-point__terminal">{result.toTerminal}</div>
                  <div className="tql-point__date-small">{result.dateShort}</div>
                </div>
              </div>

              {/* Extra info */}
              <div className="tql-card__extra">
                {[
                  ['Tàu bay',      result.aircraft],
                  ['Thời gian bay', result.duration],
                  ['Cổng khởi hành', `Cổng ${result.gate}`],
                  ['Hạng vé',      'Phổ thông'],
                ].map(([label, value]) => (
                  <div className="tql-card__extra-item" key={label}>
                    <div className="tql-card__extra-label">{label}</div>
                    <div className="tql-card__extra-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}