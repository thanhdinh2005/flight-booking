import { useState, useEffect, useCallback } from 'react'
import { fmt } from './helpers'
import { statsAPI, dashboardAPI } from './adminAPI'
import { TOP_ROUTES } from './mockData'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtVND(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(0)} tr`
  return fmt(n)
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function firstDayOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ labels = [], datasets = [] }) {
  if (!datasets.length || !datasets[0]?.data?.length) return null
  const values  = datasets[0].data
  const max     = Math.max(...values, 1)
  const days    = labels.length ? labels : values.map((_, i) => `T${i + 1}`)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 110, paddingBottom: 20, position: 'relative' }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 3 }}>
          <div
            title={`${days[i]}: ${fmtVND(v)}`}
            style={{
              width: '100%',
              height: `${Math.max((v / max) * 85, 4)}%`,
              background: 'var(--accent)',
              borderRadius: '3px 3px 0 0',
              opacity: 0.85,
              transition: 'height 0.3s ease',
              minHeight: 4,
            }}
          />
          <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'DM Mono', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%', textAlign: 'center' }}>
            {days[i]}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Progress bar row ─────────────────────────────────────────────────────────
function ProgRow({ label, value, pct, color = 'var(--accent)' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', gap: 16 }}>
          {value !== undefined && (
            <span style={{ fontFamily: 'DM Mono', color: 'var(--accent)' }}>{value}</span>
          )}
          <span style={{ fontFamily: 'DM Mono', fontWeight: 500 }}>{pct}%</span>
        </div>
      </div>
      <div className="adm-prog-wrap" style={{ height: 7 }}>
        <div className="adm-prog" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color = 'var(--accent)', sub }) {
  return (
    <div className="adm-stat-card" style={{ '--card-color': color }}>
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-val" style={{ fontSize: 26 }}>{value}</div>
      {sub && <div className="adm-stat-delta">{sub}</div>}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SectionStats() {
  // Date range — mặc định tháng hiện tại
  const [startDate, setStartDate] = useState(firstDayOfMonth())
  const [endDate,   setEndDate]   = useState(todayStr())

  // Data states
  const [summary,    setSummary]    = useState(null)
  const [chartData,  setChartData]  = useState({ labels: [], datasets: [] })
  const [loadFactor, setLoadFactor] = useState(null)
  const [topRoutes,  setTopRoutes]  = useState(TOP_ROUTES)

  const [loading,    setLoading]    = useState(true)
  const [exporting,  setExporting]  = useState(false)
  const [error,      setError]      = useState('')
  const [exportMsg,  setExportMsg]  = useState('')

  // ── Fetch tất cả dữ liệu ─────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [sumRes, chartRes, lfRes, routeRes] = await Promise.allSettled([
        // GET /admin/dashboard/summary
        dashboardAPI.getStats(),
        // GET /admin/revenue-chart?start_date=&end_date=
        dashboardAPI.getRevenueChart(startDate, endDate),
        // GET /admin/load-factor?start_date=&end_date=
        statsAPI.getLoadFactor(startDate, endDate),
        // GET /admin/stats/top-routes
        statsAPI.getTopRoutes(),
      ])

      if (sumRes.status === 'fulfilled')   setSummary(sumRes.value)
      if (chartRes.status === 'fulfilled') setChartData(chartRes.value)
      if (lfRes.status === 'fulfilled')    setLoadFactor(lfRes.value)
      if (routeRes.status === 'fulfilled' && routeRes.value?.length) setTopRoutes(routeRes.value)
    } catch (err) {
      setError('Lỗi tải dữ liệu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => { fetchAll() }, [startDate, endDate])

  // ── Export PDF ───────────────────────────────────────────────────────────
  // GET /admin/reports/export-pdf?start_date=&end_date=
  const handleExportPDF = async () => {
    setExporting(true)
    setExportMsg('')
    try {
      const res = await statsAPI.exportPDF(startDate, endDate)
      // Backend có thể trả về { url } hoặc { success, message }
      if (res?.url) {
        window.open(res.url, '_blank')
        setExportMsg('Đang mở file PDF...')
      } else if (res?.download_url) {
        window.open(res.download_url, '_blank')
        setExportMsg('Đang mở file PDF...')
      } else if (res?.data?.url) {
        window.open(res.data.url, '_blank')
        setExportMsg('Đang mở file PDF...')
      } else {
        setExportMsg(res?.message ?? 'Đã gửi yêu cầu xuất báo cáo.')
      }
    } catch (err) {
      setExportMsg('Lỗi xuất PDF: ' + err.message)
    } finally {
      setExporting(false)
      setTimeout(() => setExportMsg(''), 5000)
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const grossRevenue    = summary?.revenue       ?? 0
  const netRevenue      = summary?.netRevenue     ?? 0
  const refundedAmount  = summary?.refundedAmount ?? 0
  const totalBookings   = summary?.totalBookings  ?? 0
  const totalFlights    = summary?.totalFlights   ?? 0

  const overallLF       = loadFactor?.overall?.load_factor_percentage ?? 0
  const totalSeats      = loadFactor?.overall?.total_seats_supplied   ?? 0
  const totalSold       = loadFactor?.overall?.total_seats_sold       ?? 0

  const routeChart      = loadFactor?.chartByRoute ?? { labels: [], datasets: [] }
  const routeLabels     = routeChart.labels ?? []
  const routeValues     = routeChart.datasets?.[0]?.data ?? []

  return (
    <div className="adm-fade">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="adm-sec-header">
        <div>
          <div className="adm-sec-title">Thống kê & Báo cáo</div>
          <div className="adm-sec-sub">
            {loading ? '⏳ Đang tải...' : `${startDate} — ${endDate}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="adm-input"
            type="date"
            style={{ height: 34, padding: '5px 10px', fontSize: 13 }}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>→</span>
          <input
            className="adm-input"
            type="date"
            style={{ height: 34, padding: '5px 10px', fontSize: 13 }}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
          <button
            className="adm-btn adm-btn-ghost"
            onClick={fetchAll}
            disabled={loading}
          >
            🔄 Làm mới
          </button>
          <button
            className="adm-btn adm-btn-primary"
            onClick={handleExportPDF}
            disabled={exporting || loading}
          >
            {exporting ? '⏳ Đang xuất...' : '📄 Xuất PDF'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '10px 16px', borderRadius: 4, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18 }} onClick={() => setError('')}>✕</button>
        </div>
      )}
      {exportMsg && (
        <div style={{ backgroundColor: 'rgba(34,197,94,.12)', color: 'var(--accent)', border: '1px solid rgba(34,197,94,.25)', padding: '10px 16px', borderRadius: 4, marginBottom: 14, fontSize: 13 }}>
          ✅ {exportMsg}
        </div>
      )}

      {/* ── Stat cards — từ /admin/dashboard/summary ───────────────────── */}
      <div className="adm-stat-grid" style={{ marginBottom: 20 }}>
        <StatCard label="Doanh thu gộp"   value={fmtVND(grossRevenue)}   color="var(--accent)"  sub="Gross Revenue" />
        <StatCard label="Doanh thu thuần" value={fmtVND(netRevenue)}     color="var(--accent2)" sub="Net Revenue" />
        <StatCard label="Tiền đã hoàn"    value={fmtVND(refundedAmount)} color="var(--warn)"    sub="Refunds" />
        <StatCard label="Tổng booking"    value={totalBookings}          color="var(--purple)"  sub="Bookings" />
        <StatCard label="Chuyến bay"      value={totalFlights}           color="var(--accent)"  sub="Flights" />
        <StatCard
          label="Tỷ lệ lấp đầy"
          value={`${Number(overallLF).toFixed(1)}%`}
          color={overallLF >= 80 ? 'var(--danger)' : overallLF >= 60 ? 'var(--warn)' : 'var(--accent2)'}
          sub={`${totalSold} / ${totalSeats} ghế`}
        />
      </div>

      <div className="adm-2col" style={{ gap: 18 }}>

        {/* ── Biểu đồ doanh thu — từ /admin/revenue-chart ────────────── */}
        <div className="adm-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="adm-sec-title" style={{ margin: 0 }}>Doanh thu theo ngày</div>
            {chartData?.datasets?.[0] && (
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                {chartData.datasets[0].name ?? 'Doanh thu gộp'}
              </span>
            )}
          </div>

          {chartData?.datasets?.length ? (
            <BarChart labels={chartData.labels} datasets={chartData.datasets} />
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)', fontSize: 13 }}>
              {loading ? '⏳ Đang tải...' : 'Không có dữ liệu biểu đồ'}
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: 10, fontFamily: 'DM Mono', color: 'var(--text-dim)', marginTop: 4 }}>
            Đơn vị: VNĐ — di chuột vào cột để xem giá trị
          </div>

          {/* Nếu có dataset thứ 2 (net revenue), hiển thị dạng legend */}
          {chartData?.datasets?.length > 1 && (
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10, fontSize: 11 }}>
              {chartData.datasets.map((ds, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: i === 0 ? 'var(--accent)' : 'var(--accent2)', opacity: 0.85 }} />
                  <span style={{ color: 'var(--text-mid)' }}>{ds.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Tỷ lệ lấp đầy theo tuyến — từ /admin/load-factor ─────── */}
        <div className="adm-card" style={{ padding: '18px 20px' }}>
          <div className="adm-sec-title" style={{ marginBottom: 14 }}>
            Tỷ lệ lấp đầy theo tuyến
            {loading && <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>⏳</span>}
          </div>

          {routeLabels.length > 0 ? (
            routeLabels.map((label, i) => {
              const pct = Math.round(routeValues[i] ?? 0)
              const color = pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warn)' : 'var(--accent)'
              return (
                <ProgRow key={i} label={label} pct={pct} color={color} />
              )
            })
          ) : topRoutes.length > 0 ? (
            topRoutes.map((r, i) => (
              <ProgRow key={i} label={r.route} value={fmtVND(r.rev)} pct={r.pct} />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)', fontSize: 13 }}>
              {loading ? '⏳ Đang tải...' : 'Không có dữ liệu'}
            </div>
          )}
        </div>
      </div>

      {/* ── Tuyến bay phổ biến — từ /admin/stats/top-routes ───────────── */}
      {topRoutes.length > 0 && (
        <div className="adm-card" style={{ padding: 20, marginTop: 18 }}>
          <div className="adm-sec-title" style={{ marginBottom: 16 }}>
            Tuyến bay phổ biến
            {loading && <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>⏳</span>}
          </div>
          {topRoutes.map((r, i) => (
            <ProgRow key={i} label={r.route} value={fmtVND(r.rev)} pct={r.pct} />
          ))}
        </div>
      )}

      {/* ── Tóm tắt kỳ báo cáo ────────────────────────────────────────── */}
      <div className="adm-card" style={{ padding: 20, marginTop: 18 }}>
        <div className="adm-sec-title" style={{ marginBottom: 14 }}>Tóm tắt kỳ báo cáo</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Kỳ báo cáo',      value: `${startDate} → ${endDate}` },
            { label: 'Tổng doanh thu',   value: fmtVND(grossRevenue) },
            { label: 'Doanh thu thuần',  value: fmtVND(netRevenue) },
            { label: 'Hoàn tiền',        value: fmtVND(refundedAmount) },
            { label: 'Tổng booking',     value: totalBookings },
            { label: 'Tổng chuyến bay',  value: totalFlights },
            { label: 'Tỷ lệ lấp đầy',   value: `${Number(overallLF).toFixed(1)}%` },
            { label: 'Ghế đã bán',       value: `${totalSold} / ${totalSeats}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '10px 14px', background: 'var(--surface2)', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontWeight: 500, fontSize: 14, fontFamily: typeof value === 'number' ? 'DM Mono' : 'inherit' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="adm-btn adm-btn-primary"
            onClick={handleExportPDF}
            disabled={exporting || loading}
            style={{ gap: 6 }}
          >
            {exporting ? '⏳ Đang xuất...' : '📄 Xuất báo cáo PDF'}
          </button>
        </div>
      </div>

    </div>
  )
}