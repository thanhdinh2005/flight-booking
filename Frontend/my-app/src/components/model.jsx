import { createPortal } from 'react-dom'

export default function Modal({
  title,
  sub,
  onClose,
  children,
  footer,
  overlayClassName = '',
  modalClassName = '',
}) {
  const modalContent = (
    <div
      className={`adm-overlay ${overlayClassName}`.trim()}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={`adm-modal adm-fade ${modalClassName}`.trim()}>
        <div className="adm-modal-head">
          <div className="adm-modal-heading">
            <div className="adm-modal-title">{title}</div>
            {sub && <div className="adm-modal-sub">{sub}</div>}
          </div>
        </div>
        <button className="adm-modal-x" onClick={onClose}>✕</button>
        <div className="adm-modal-body">
          {children}
        </div>
        {footer && <div className="adm-modal-foot">{footer}</div>}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
