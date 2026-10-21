import { useState } from 'react'
import { Link } from 'react-router-dom'

function Login({ onLogin, onRegister, onGoogleLogin, isModal = false, onClose }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanStatus, setScanStatus] = useState('')
  const [detectedRole, setDetectedRole] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setScanStatus('')
    setDetectedRole(null)

    if (!email.trim() || !password) return setError('Please enter your email and password.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (mode === 'register' && !name.trim()) return setError('Please enter your name.')

    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await onRegister(email, password, name, (status) => setScanStatus(status))
        setDetectedRole(res?.role || 'user')
      } else {
        const res = await onLogin(email, password, (status) => setScanStatus(status))
        setDetectedRole(res?.role || 'user')
      }
    } catch (err) {
      setError(err.message)
      setScanStatus('')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setScanStatus('')
    setDetectedRole(null)
    setLoading(true)
    try {
      const res = await onGoogleLogin((status) => setScanStatus(status))
      setDetectedRole(res?.role || 'user')
    } catch (err) {
      setError(err.message)
      setScanStatus('')
    } finally {
      setLoading(false)
    }
  }

  const cardContent = (
    <div className="login-card shadow-lg p-4 p-md-5 bg-studio-card border border-studio rounded-4 position-relative">
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-outline-secondary border-0 text-studio-muted position-absolute top-0 end-0 m-3 fs-5"
          style={{ width: '36px', height: '36px', borderRadius: '50%' }}
          aria-label="Close"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      )}

      <div className="text-center mb-3">
        <span className="brand-mark bg-studio-light-black border border-studio">
          <i className="bi bi-droplet-half text-white" />
        </span>
      </div>
      <h1>ahsashjahdjbcd</h1>

      <h1 className="text-center mb-1 fs-3 fw-bold text-white">PAP's Jolo Studio</h1>
      <p className="text-center mb-4 text-studio-muted small">
        Tattoo · Piercing · Haircut Appointments
      </p>

      <div className="auth-mode-toggle mb-3">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => { setMode('login'); setError(''); setScanStatus('') }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => { setMode('register'); setError(''); setScanStatus('') }}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="mb-2">
            <label className="form-label small text-studio-muted">Full Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              required
            />
          </div>
        )}

        <div className="mb-2">
          <label className="form-label small text-studio-muted">Email Address</label>
          <input
            type="email"
            className="form-control"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label small text-studio-muted">Password</label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="btn btn-outline-secondary border-studio text-white"
              type="button"
              onClick={() => setShowPassword((v) => !v)}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
        </div>

        {/* Live Firebase Role Scanning Banner */}
        {scanStatus && (
          <div className="alert bg-studio-light-black border border-info text-info py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
            <div className="spinner-border spinner-border-sm text-info flex-shrink-0" role="status" />
            <span className="flex-grow-1">{scanStatus}</span>
          </div>
        )}

        {/* Detected Role Success feedback */}
        {detectedRole && (
          <div className="alert bg-success bg-opacity-25 border border-success text-success py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill fs-5 text-success"></i>
            <div>
              <strong>{detectedRole === 'admin' ? 'Admin Role Verified' : 'Client Role Verified'}!</strong>
              <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                Redirecting to {detectedRole === 'admin' ? 'Admin Management Dashboard' : 'Client Dashboard'}...
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="alert bg-studio-black text-danger border border-danger py-2 small mb-3">
            <i className="bi bi-exclamation-triangle-fill me-1"></i> {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-dark text-white border border-light w-100 py-2 fw-semibold"
          disabled={loading}
        >
          {loading ? (
            <span>
              <span className="spinner-border spinner-border-sm me-2" />
              Scanning & Authenticating...
            </span>
          ) : mode === 'register' ? (
            'Create Account'
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="divider">
        <span>OR</span>
      </div>

      <button
        onClick={handleGoogle}
        type="button"
        className="btn btn-outline-light w-100 py-2 d-flex align-items-center justify-content-center gap-2"
        disabled={loading}
      >
        <i className="bi bi-google" /> Continue with Google
      </button>

      {!isModal && (
        <div className="text-center mt-4">
          <Link to="/" className="text-studio-muted text-decoration-none small hover-underline">
            <i className="bi bi-arrow-left me-1"></i> Back to PAP's Jolo Studio Home
          </Link>
        </div>
      )}
    </div>
  )

  if (isModal) {
    return (
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 1055,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose()
        }}
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
          <div className="modal-content bg-transparent border-0">
            {cardContent}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-screen d-flex justify-content-center align-items-center bg-studio-black">
      {cardContent}
    </div>
  )
}

export default Login
