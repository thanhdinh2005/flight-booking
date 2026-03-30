import { useCallback, useEffect, useMemo, useState } from 'react'
import { fmt, fmtNum } from './helpers'
import { dashboardAPI } from './adminAPI'
import { getToken, isTokenExpired } from '../../services/keycloakService'
import DatePicker, { isBeforeIsoDate } from '../common/DatePicker'

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://backend.test/api'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function firstDayOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function compactCurrency(value) {
  const n = Number(value || 0)
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr`
  return fmt(n)
}

function compactAxisDate(label) {
  const value = String(label ?? '').trim()
  const slashMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slashMatch) return `${slashMatch[1]}/${slashMatch[2]}`

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}`

  return value
}

function parseRouteCodes(label) {
  const parts = String(label ?? '')
    .split('→')
    .map(part => part.trim())
    .filter(Boolean)

  if (parts.length !== 2) return null
  return { from: parts[0], to: parts[1] }
}

function formatAirportLabel(airport = {}) {
  return airport.city || airport.name || airport.code || ''
}

function DashboardMetric({ label, value, note, accent }) {
  return (
    <div style={{
      borderRadius: 24,
      padding: 20,
      background: 'linear-gradient(180deg, rgba(16, 24, 38, 0.98) 0%, rgba(11, 18, 30, 0.98) 100%)',
      border: '1px solid rgba(103, 183, 255, 0.14)',
      boxShadow: '0 20px 45px rgba(2, 6, 23, 0.28)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: '0 auto auto 0',
        width: 120,
        height: 120,
        background: accent,
        opacity: 0.10,
        filter: 'blur(18px)',
        transform: 'translate(-20%, -35%)',
      }} />
      <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10, fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#8ea0b8' }}>{note}</div>
    </div>
  )
}

function RevenueTrend({ labels = [], datasets = [] }) {
  const gross = datasets.find(ds => ds.type === 'bar') ?? datasets[0] ?? { data: [] }
  const net = datasets.find(ds => ds.type === 'line') ?? datasets[1] ?? { data: [] }
  const max = Math.max(...gross.data, ...net.data, 1)
  const labelStep = labels.length > 24 ? 3 : labels.length > 14 ? 2 : 1
  const columnMinWidth = labels.length <= 7 ? 64 : labels.length <= 14 ? 42 : 18

  if (!labels.length || !gross.data.length) {
    return (
      <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
        Không có dữ liệu xu hướng doanh thu.
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 18 }}>
        {datasets.map((ds, index) => (
          <div key={`${ds.name}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-mid)' }}>
            <span style={{
              width: 12,
              height: 12,
              borderRadius: ds.type === 'line' ? 999 : 3,
              background: ds.type === 'line' ? '#0f766e' : '#3b82f6',
              display: 'inline-block',
            }} />
            {ds.name}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${labels.length}, minmax(${columnMinWidth}px, 1fr))`, gap: labels.length <= 7 ? 12 : 6, alignItems: 'end', minHeight: 260 }}>
        {labels.map((label, index) => {
          const grossValue = Number(gross.data?.[index] || 0)
          const netValue = Number(net.data?.[index] || 0)
          const grossPct = Math.max((grossValue / max) * 100, grossValue > 0 ? 6 : 2)
          const netPct = Math.max((netValue / max) * 100, netValue > 0 ? 6 : 2)
          const showLabel = index % labelStep === 0 || index === labels.length - 1
          const showValue = grossValue > 0 && (labels.length <= 10 || grossValue === max || index === labels.length - 1)

          return (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontFamily: 'DM Mono', color: 'var(--text-mid)', minHeight: 16 }}>
                {showValue ? compactCurrency(grossValue) : ''}
              </div>
              <div style={{
                width: '100%',
                height: 190,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{
                  width: labels.length <= 7 ? 28 : 20,
                  height: `${grossPct}%`,
                  borderRadius: '14px 14px 8px 8px',
                  background: 'linear-gradient(180deg, #60a5fa, #2563eb)',
                  boxShadow: '0 14px 24px rgba(37, 99, 235, 0.20)',
                }} />
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: `${netPct}%`,
                  transform: 'translate(-50%, 50%)',
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: '#0f766e',
                  border: '3px solid #d1fae5',
                  boxShadow: '0 0 0 6px rgba(15, 118, 110, 0.10)',
                }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', minHeight: 16, whiteSpace: 'nowrap' }}>
                {showLabel ? compactAxisDate(label) : ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RouteBars({ title, items = [] }) {
  const max = Math.max(...items.map(item => item.value), 1)

  if (!items.length) {
    return (
      <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
        Không có dữ liệu tuyến bay.
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', marginBottom: 18 }}>{title}</div>
      <div style={{ display: 'grid', gap: 14 }}>
        {items.map(item => {
          const value = Number(item.value || 0)
          const width = max > 0 ? `${Math.max((value / max) * 100, value > 0 ? 5 : 0)}%` : '0%'
          return (
            <div key={item.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: '#cbd5e1', fontWeight: 700 }}>{item.label}</span>
                <span style={{ color: '#2563eb', fontWeight: 800 }}>{fmtNum(value)} vé</span>
              </div>
              <div style={{ height: 12, borderRadius: 999, background: 'rgba(148, 163, 184, 0.18)', overflow: 'hidden' }}>
                <div style={{
                  width,
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #60a5fa, #2563eb)',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SectionStats() {
  const [startDate, setStartDate] = useState(firstDayOfMonth())
  const [endDate, setEndDate] = useState(todayStr())
  const [summary, setSummary] = useState(null)
  const [chart, setChart] = useState({ labels: [], datasets: [] })
  const [topRoute, setTopRoute] = useState({ chart_title: '', labels: [], datasets: [] })
  const [routeLookup, setRouteLookup] = useState({})
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [exportMsg, setExportMsg] = useState('')

  function handleStartDateChange(value) {
    setStartDate(value)
    if (endDate && isBeforeIsoDate(endDate, value)) {
      setEndDate(value)
    }
  }

  function handleEndDateChange(value) {
    if (startDate && isBeforeIsoDate(value, startDate)) {
      setEndDate(startDate)
      return
    }
    setEndDate(value)
  }

  const fetchRouteLookup = useCallback(async () => {
    const token = getToken()
    if (!token || isTokenExpired()) throw new Error('Phiên đăng nhập hết hạn.')

    const res = await fetch(`${API_BASE}/admin/routes`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`)

    const routes = Array.isArray(json?.data) ? json.data : []
    return routes.reduce((acc, route) => {
      const fromCode = route.origin?.code ?? ''
      const toCode = route.destination?.code ?? ''
      if (fromCode && toCode) {
        acc[`${fromCode}→${toCode}`] = {
          from: formatAirportLabel(route.origin),
          to: formatAirportLabel(route.destination),
        }
      }
      return acc
    }, {})
  }, [])

  const fetchTopRoutes = useCallback(async () => {
    const token = getToken()
    if (!token || isTokenExpired()) throw new Error('Phiên đăng nhập hết hạn.')

    const res = await fetch(`${API_BASE}/admin/top-route`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`)

    const data = json.data || {}
    return {
      chart_title: data.chart_title || 'So sánh doanh số vé giữa các tuyến bay',
      labels: data.labels || [],
      datasets: data.datasets || [],
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [summaryData, chartData, routeData, routeLookupData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRevenueChart(startDate, endDate),
        fetchTopRoutes(),
        fetchRouteLookup(),
      ])

      setSummary(summaryData)
      setChart(chartData)
      setTopRoute(routeData)
      setRouteLookup(routeLookupData)
    } catch (err) {
      setError(err.message || 'Không tải được dữ liệu thống kê.')
    } finally {
      setLoading(false)
    }
  }, [fetchRouteLookup, fetchTopRoutes, startDate, endDate])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleExportPDF = async () => {
    setExporting(true)
    setExportMsg('')
    try {
      const token = getToken()
      if (!token || isTokenExpired()) throw new Error('Phiên đăng nhập hết hạn.')

      const qs = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      })

      const res = await fetch(`${API_BASE}/admin/reports/export-pdf?${qs.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bao-cao-${startDate}-${endDate}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      setExportMsg('Đã tải báo cáo PDF về máy.')
    } catch (err) {
      setExportMsg(`Xuất PDF thất bại: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  const metrics = useMemo(() => ([
    {
      label: 'Doanh thu gộp',
      value: compactCurrency(summary?.revenue ?? 0),
      note: `Chi tiết ${fmt(summary?.revenue ?? 0)}`,
      accent: '#3b82f6',
    },
    {
      label: 'Doanh thu thuần',
      value: compactCurrency(summary?.netRevenue ?? 0),
      note: `Chi tiết ${fmt(summary?.netRevenue ?? 0)}`,
      accent: '#0f766e',
    },
    {
      label: 'Tiền đã hoàn',
      value: compactCurrency(summary?.refundedAmount ?? 0),
      note: `Chi tiết ${fmt(summary?.refundedAmount ?? 0)}`,
      accent: '#f59e0b',
    },
    {
      label: 'Đơn đặt chỗ',
      value: fmtNum(summary?.totalBookings ?? 0),
      note: 'Số booking thành công',
      accent: '#8b5cf6',
    },
    {
      label: 'Chuyến khai thác',
      value: fmtNum(summary?.totalFlights ?? 0),
      note: 'Tổng chuyến bay đang ghi nhận',
      accent: '#ef4444',
    },
  ]), [summary])

  const topRouteItems = useMemo(() => {
    const values = topRoute.datasets?.[0]?.data || []
    return (topRoute.labels || [])
      .map((label, index) => {
        const routeCodes = parseRouteCodes(label)
        const lookupKey = routeCodes ? `${routeCodes.from}→${routeCodes.to}` : ''
        const routeName = routeLookup[lookupKey]
        return {
          key: lookupKey || label || String(index),
          label: routeName ? `${routeName.from} → ${routeName.to}` : label,
          value: Number(values[index] || 0),
        }
      })
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
  }, [routeLookup, topRoute])

  return (
    <div className="adm-fade" style={{ display: 'grid', gap: 18 }}>
      <div className="adm-card" style={{
        padding: 24,
        background: 'linear-gradient(135deg, rgba(8, 18, 32, 0.98) 0%, rgba(12, 34, 54, 0.98) 52%, rgba(14, 55, 62, 0.96) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.14)',
        boxShadow: '0 28px 60px rgba(2, 6, 23, 0.34)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            
            <div style={{ fontSize: 30, fontWeight: 900, color: '#f8fafc', marginBottom: 8 }}>
              Trung tâm thống kê kinh doanh
            </div>
           
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <DatePicker value={startDate} onChange={handleStartDateChange} placeholder="Từ ngày" theme="admin" triggerStyle={{ minWidth: 160, height: 40, padding: '9px 14px' }} />
            <DatePicker value={endDate} onChange={handleEndDateChange} minDate={startDate || undefined} placeholder="Đến ngày" theme="admin" triggerStyle={{ minWidth: 160, height: 40, padding: '9px 14px' }} />
            <button className="adm-btn adm-btn-ghost" onClick={fetchAll} disabled={loading}>
              {loading ? '⏳ Đang tải...' : '🔄 Làm mới'}
            </button>
            <button className="adm-btn adm-btn-primary" onClick={handleExportPDF} disabled={exporting || loading}>
              {exporting ? '⏳ Đang xuất...' : '📄 Xuất PDF'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 16, padding: '12px 16px', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {exportMsg && (
        <div style={{ background: 'rgba(15,118,110,.08)', border: '1px solid rgba(15,118,110,.20)', color: '#0f766e', borderRadius: 16, padding: '12px 16px', fontSize: 13 }}>
          {exportMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {metrics.map(item => (
          <DashboardMetric key={item.label} {...item} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
        <div className="adm-card" style={{ padding: 24, background: 'linear-gradient(180deg, rgba(15, 22, 34, 0.98) 0%, rgba(10, 16, 26, 0.98) 100%)', border: '1px solid rgba(103, 183, 255, 0.14)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 900, color: '#f8fafc' }}>Phân tích tài chính</div>
           
            </div>
          </div>
          <RevenueTrend labels={chart.labels} datasets={chart.datasets} />
        </div>

        <div className="adm-card" style={{ padding: 24, background: 'linear-gradient(180deg, rgba(15, 22, 34, 0.98) 0%, rgba(10, 16, 26, 0.98) 100%)', border: '1px solid rgba(103, 183, 255, 0.14)' }}>
          <RouteBars
            title={topRoute.chart_title || 'So sánh doanh số vé giữa các tuyến bay'}
            items={topRouteItems}
          />
        </div>
      </div>
    </div>
  )
}
