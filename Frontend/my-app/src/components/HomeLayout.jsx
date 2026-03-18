// src/layouts/HomeLayout.jsx
import { Outlet, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";

import { clearToken, getUserFromToken, getAccessToken, logoutKeycloak } from "../services/keycloakService";
import '../styles/home.css'
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";

export default function HomeLayout() {
  const navigate = useNavigate();
  const token = getAccessToken();
  const currentUser = token ? getUserFromToken(token) : null;

  const [activeTab, setActiveTab] = useState("khampha");
  const [toast, setToast] = useState({ msg: "", show: false });

  const notify = useCallback((msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  }, []);

  const handleLogout = async () => {
    await logoutKeycloak();
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="home-root">
      <Topbar currentUser={currentUser} onLogout={handleLogout} />

      <div className="home-body">
        <Sidebar activeId={activeTab} onSelect={id => setActiveTab(id)} />

        <main className="home-main">
          {/* Nội dung trang sẽ thay đổi ở đây */}
          <Outlet context={{ notify }} />
        </main>
      </div>

      <Toast show={toast.show} msg={toast.msg} />
    </div>
  );
}   