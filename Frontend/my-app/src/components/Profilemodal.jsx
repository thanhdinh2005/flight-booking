// src/components/ProfileModal.jsx
import { useState, useEffect } from 'react';
import '../styles/ProfileModal.css';

const ROLE_LABELS = {
  admin:    { label: 'Quản trị viên', color: '#ef4444' },
  staff:    { label: 'Nhân viên',     color: '#f59e0b' },
  customer: { label: 'Khách hàng',    color: '#22c55e' },
};

export default function ProfileModal({ onClose }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { fetchMe(); }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fetchMe = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://backend.test/api/me');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Lỗi không xác định');
      setUser(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initials = user
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const roleInfo = user
    ? (ROLE_LABELS[user.role] ?? { label: user.role, color: '#6b7280' })
    : null;

  return (
    <div className="pm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal">

        <button className="pm-close" onClick={onClose} aria-label="Đóng">✕</button>

        {loading && (
          <div className="pm-state">
            <div className="pm-spinner" />
            <p>Đang tải thông tin...</p>
          </div>
        )}

        {error && !loading && (
          <div className="pm-state pm-state--error">
            <span className="pm-state-icon">⚠️</span>
            <p>{error}</p>
            <button className="pm-retry" onClick={fetchMe}>Thử lại</button>
          </div>
        )}

        {user && !loading && (
          <>
            <div className="pm-header">
              <div className="pm-avatar" style={{ '--role-color': roleInfo.color }}>
                {initials}
              </div>
              <div className="pm-header-info">
                <h2 className="pm-name">{user.full_name}</h2>
                <span className="pm-badge" style={{ background: roleInfo.color }}>
                  {roleInfo.label}
                </span>
              </div>
            </div>

            <div className="pm-body">
              <Row icon="✉️" label="Email"              value={user.email} />
              <Row icon="📞" label="Số điện thoại"      value={user.phone_number || '—'} />
              <Row icon="🆔" label="ID tài khoản"       value={`#${user.id}`} mono />
              <Row icon="📅" label="Ngày tạo"
                value={new Date(user.created_at).toLocaleString('vi-VN')} />
              <Row icon="🔄" label="Cập nhật lần cuối"
                value={new Date(user.updated_at).toLocaleString('vi-VN')} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, value, mono }) {
  return (
    <div className="pm-row">
      <span className="pm-row-icon">{icon}</span>
      <div className="pm-row-content">
        <span className="pm-row-label">{label}</span>
        <span className={`pm-row-value${mono ? ' mono' : ''}`}>{value}</span>
      </div>
    </div>
  );
}