import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Header from './components/TopBar.jsx'
import Footer from './components/BottomNav.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BookAppointment from './pages/BookAppointment.jsx'
import MyAppointments from './pages/MyAppointments.jsx'
import Profile from './pages/Profile.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import NotFound from './pages/NotFound.jsx'
import StudiosTable from './components/StudiosTable.jsx'

function RequireAuth({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }
  return children
}

export default function App() {
  const { user, loading, login, register, loginWithGoogle, logout } = useAuth()

  useEffect(() => {
    if (user && user.role === 'user') {
      document.body.classList.add('has-bottom-nav')
    } else {
      document.body.classList.remove('has-bottom-nav')
    }
  }, [user])
  
  if (loading) {
    return (
      <div className="app-loading bg-studio-black text-white">
        <div className="spinner-border" role="status" />
        <span>Loading PAP's Jolo Studio...</span>
      </div>
    )
  }

  return (
    <>
      {user && <Header onLogout={logout} />}
      <Routes>
        {/* Landing page is shown first before login */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <LandingPage onLogin={login} onRegister={register} onGoogleLogin={loginWithGoogle} />
            )
          }
        />
        <Route
          path="/landing"
          element={<LandingPage onLogin={login} onRegister={register} onGoogleLogin={loginWithGoogle} />}
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Login onLogin={login} onRegister={register} onGoogleLogin={loginWithGoogle} />
            )
          }
        />

        {/* Protected User Routes */}
        <Route path="/dashboard" element={<RequireAuth role="user"><Dashboard /></RequireAuth>} />
        <Route path="/book" element={<RequireAuth role="user"><BookAppointment /></RequireAuth>} />
        <Route path="/appointments" element={<RequireAuth role="user"><MyAppointments /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth role="user"><Profile /></RequireAuth>} />
        <Route path="/studiotable"  element={<StudiosTable/>} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user?.role === 'user' && <Footer />}
    </>
  )
}