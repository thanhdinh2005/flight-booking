import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken, getUserFromToken, getAccessToken, logoutKeycloak } from '../services/keycloakService'
import '../styles/home.css'


import Topbar from './Topbar'
import Sidebar from './Sidebar'
import Hero from './Hero'
import SearchPanel from './Searchpanel'
import PopularFlights from './Popularflights'
import SearchOverlay from './Searchoverlay'
import Toast from './Toast'

export default function Home() {
  const navigate = useNavigate()
  const token = getAccessToken()
  const currentUser = token ? getUserFromToken(token) : null

  const [expanded, setExpanded] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState({ msg: '', show: false })

  const notify = useCallback((msg) => {
    setToast({ msg, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500)
  }, [])

  const handleLogout = async () => {
    await logoutKeycloak()
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="home-root">
      <Topbar currentUser={currentUser} onOpenSearch={() => setSearchOpen(true)} onLogout={handleLogout} />
      
      <div className="home-body">
        <Sidebar expanded={expanded} setExpanded={setExpanded} notify={notify} />
        
        <main className="home-main">
          <Hero />
          <div className="home-content">
          <SearchPanel notify={notify} />
          <PopularFlights notify={notify} />
          </div>
        </main>
      </div>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} notify={notify} />
      <Toast show={toast.show} msg={toast.msg} />
    </div>
  )
}