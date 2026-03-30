import { useCallback, useEffect, useMemo, useState } from 'react'
import { fmt, fmtNum } from './helpers'
import { dashboardAPI } from './adminAPI'

function OverviewCard({ title, value, sub, color }) {
  return (
    <div className="adm-card" style={{
      padding: 22,
      border: '1px solid rgba(103, 183, 255, 0.16)',
      boxShadow: '0 18px 40px rgba(2, 6, 23, 0.28)',
      background: 'linear-gradient(180deg, rgba(16, 24, 38, 0.98) 0%, rgba(11, 18, 30, 0.98) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 999,
        background: color,
        opacity: 0.10,
        filter: 'blur(22px)',
        top: -60,
        right: -50,
      }} />
      <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94a3b8', marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: '#f8fafc', marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#8ea0b8' }}>{sub}</div>
    </div>
  )
}

export function SectionDashboard() {
  const [stats, setStats] = useState({ revenue: 0, netRevenue: 0, totalBookings: 0, totalFlights: 0, refundedAmount: 0, period: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const summaryData = await dashboardAPI.getStats()
      setStats(summaryData)
    } catch (err) {
      setError(err.message || 'Không tải được dữ liệu dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const cards = useMemo(() => ([
    {
      title: 'Doanh thu gộp',
      value: fmt(stats.revenue),
      sub: 'Tổng tiền vé ghi nhận',
      color: '#3b82f6',
    },
    {
      title: 'Doanh thu thuần',
      value: fmt(stats.netRevenue),
      sub: 'Sau hoàn tiền và điều chỉnh',
      color: '#10b981',
    },
    {
      title: 'Đơn đặt chỗ',
      value: fmtNum(stats.totalBookings),
      sub: 'Tổng booking thành công',
      color: '#8b5cf6',
    },
    {
      title: 'Số tiền hoàn',
      value: fmt(stats.refundedAmount),
      sub: 'Giá trị refund đã xử lý',
      color: '#f59e0b',
    },
  ]), [stats])

  return (
    <div className="adm-fade" style={{ display: 'grid', gap: 18 }}>
      <div className="adm-card" style={{
        padding: 24,
        background: 'linear-gradient(135deg, rgba(8, 18, 32, 0.98) 0%, rgba(12, 51, 73, 0.98) 52%, rgba(18, 90, 88, 0.95) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.16)',
        boxShadow: '0 24px 50px rgba(2, 6, 23, 0.34)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7dd3fc', fontWeight: 800, marginBottom: 10 }}>
              Executive Dashboard
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#f8fafc', marginBottom: 8 }}>
              Bảng điều khiển vận hành kinh doanh
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 16, padding: '12px 16px', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {cards.map(card => <OverviewCard key={card.title} {...card} />)}
      </div>
    </div>
  )
}
