export default function Modal({ title, sub, onClose, children, footer }) {
  return (
    <div className="adm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal adm-fade">
        <div className="adm-modal-title">{title}</div>
        {sub && <div className="adm-modal-sub">{sub}</div>}
        <button className="adm-modal-x" onClick={onClose}>✕</button>
        {children}
        {footer && <div className="adm-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}