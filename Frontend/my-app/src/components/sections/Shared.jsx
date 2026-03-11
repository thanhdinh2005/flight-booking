/* ─────────────────────────────────────────
   Shared UI
───────────────────────────────────────── */
export const fmt = n => new Intl.NumberFormat('vi-VN').format(n) + '₫'

export function Spinner() {
  return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
      Đang tải...
    </div>
  )
}

export function ErrBox({ msg, onRetry }) {
  return (
    <div style={{ padding: '12px 16px', background: 'rgba(255,92,92,.07)', border: '1px solid rgba(255,92,92,.25)', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <span>⚠️ {msg}</span>
      {onRetry && <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={onRetry}>Thử lại</button>}
    </div>
  )
}