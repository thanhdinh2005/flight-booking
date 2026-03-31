const COLORS = {
  active: '#00e5a0', disabled: '#ff5c5c', inactive: '#888', suspended: '#ff5c5c',
  confirmed: '#00e5a0', refunded: '#f59e0b', cancelled: '#ff5c5c',
  scheduled: '#60a5fa', boarding: '#f59e0b', full: '#ff5c5c',
  create: '#00e5a0', book: '#60a5fa', update: '#a78bfa',
  refund: '#f59e0b', cancel: '#ff5c5c', delete: '#ff5c5c',
}
const LABELS = {
  active: 'Hoạt động', disabled: 'Tạm khóa', inactive: 'Tạm khóa', suspended: 'Tạm khóa',
  confirmed: 'Xác nhận', refunded: 'Đã hoàn', cancelled: 'Đã hủy',
  scheduled: 'Lịch bay', boarding: 'Lên máy bay', full: 'Hết chỗ',
  create: 'Tạo mới', book: 'Đặt vé', update: 'Cập nhật',
  refund: 'Hoàn vé', cancel: 'Hủy', delete: 'Xóa',
}

export default function Badge({ value, labels = LABELS, colors = COLORS }) {
  const normalizedValue = String(value ?? '').trim().toLowerCase()
  const c = colors[normalizedValue] || '#888'
  const l = labels[normalizedValue] || value
  return (
    <span className="adm-badge" style={{ background: `${c}18`, color: c }}>
      <span className="adm-dot" style={{ background: c }} />
      {l}
    </span>
  )
}
