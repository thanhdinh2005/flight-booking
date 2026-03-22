import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/HomeLayout";
import Home from "./components/HomePage";
import MyTicket from "./components/Myticker";
import CancelTicket from "./components/Cancelticker";

import Tabthutuc from "./components/tabs/Tabthutuc";
import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/protected";
import AdminDashboard from "./admin/AdminDashboard";
import FlightResults from "./components/Flightresults";
import ExperiencePage from "./pages/ExperiencePage";
import HelpPage from "./pages/HelpPage";
import './styles/signup.css'
import FlightsPage from "./components/Flightspage";
import BuyTicketPage from "./components/Buyticketpage";

/* ── Trang Auth: chứa Login / Register / ForgotPassword ── */
function AuthPage() {
  const [page, setPage] = useState('login')

  return (
    <div className="signup-wrapper">
      {/* Cột trái: form đăng nhập/đăng ký */}
      <div className="auth-area">
        {page === 'register'
          ? <Register onNavigate={setPage} />
          : <Login    onNavigate={setPage} />
        }
      </div>
      
      {/* Cột phải: tagline */}
      <div className="tagline-panel">
        <div className="login-tagline">
          Khám phá thế giới<br />
          cùng Việt Jett
        </div>
      </div>
    </div>
  )
}

/* ── Trang không có quyền ── */
function Unauthorized() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16,
      fontFamily:"'Be Vietnam Pro', sans-serif", background:'#e8f7fd'
    }}>
      <span style={{fontSize:64}}>⛔</span>
      <h2 style={{color:'#1a3a4a'}}>Không có quyền truy cập</h2>
      <p style={{color:'#4a7a90'}}>Tài khoản của bạn không có quyền vào trang này.</p>
      <a href="/login" style={{color:'#1a9a8e', fontWeight:600}}>← Quay lại đăng nhập</a>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   App – Router gốc
═══════════════════════════════════════════════ */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Customer layout */}
        <Route
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/flights" element={<FlightResults />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/flights"     element={<FlightsPage />} />
          <Route path="/buy-ticket"  element={<BuyTicketPage />} />
          <Route path="/my-tickets" element={<MyTicket />} />
          <Route path="/cancel-ticket" element={<CancelTicket />} />
        
          <Route path="/thu-tuc" element={<Tabthutuc />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}