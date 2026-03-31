import { createPortal } from 'react-dom'

export default function Modal({
  title,
  sub,
  onClose,
  children,
  footer,
  overlayClassName = '',
  modalClassName = '',
  closeOnOverlay = true,
}) {
  const modalContent = (
    <div
      className={`adm-overlay ${overlayClassName}`.trim()}
      onMouseDown={e => closeOnOverlay && e.target === e.currentTarget && onClose()}
    >
      <div
        className={`adm-modal adm-fade ${modalClassName}`.trim()}
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      >
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
