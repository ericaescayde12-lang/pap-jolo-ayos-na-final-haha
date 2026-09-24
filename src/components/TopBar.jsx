import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
    } finally {
      navigate('/')
    }
  }

  return (
    <header className="bg-studio-light-black border-bottom border-studio text-white py-3 px-3 mb-4 shadow-sm">
      <div className="container-fluid px-2 px-md-4">
        <div className="d-flex align-items-center justify-content-between">
          {/* Brand Name on the Left */}
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-droplet-half fs-4 text-white"></i>
            <span className="fw-bold fs-5 tracking-wide text-white">PAP's Jolo Studio</span>
          </div>

          {/* Logout Button on the Top-Right Header */}
          {user && (
            <div className="d-flex align-items-center gap-2">
              <span className="small text-white-50 d-none d-sm-inline">
                {user.name} ({user.role === 'admin' ? 'Admin' : 'Client'})
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1 px-3 py-1 fw-semibold rounded-pill"
                title="Logout Account"
                style={{ fontSize: '0.85rem', borderColor: '#444' }}
              >
                <span>Logout</span>
                <i className="bi bi-box-arrow-right ms-1"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar
