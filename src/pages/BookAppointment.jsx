import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useAppointments, SERVICES } from '../context/AppointmentsContext.jsx'

function BookAppointment() {
  const { user } = useAuth()
  const { addAppointment, catalog } = useAppointments()
  const navigate = useNavigate()
  const location = useLocation()

  const prefilledService = location.state?.service || SERVICES[0].name
  const prefilledDesign = location.state?.design || ''
  const prefilledPrice = location.state?.price || null

  const [clientName, setClientName] = useState(user.name)
  const [date, setDate] = useState('')
  const [service, setService] = useState(prefilledService)
  const [design, setDesign] = useState(prefilledDesign)
  const [price, setPrice] = useState(prefilledPrice || 0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const availableDesigns = catalog.filter(
    (item) => item.category.toLowerCase() === service.toLowerCase()
  )

  useEffect(() => {
    const matches = catalog.filter((c) => c.category.toLowerCase() === service.toLowerCase())
    if (matches.length > 0) {
      if (!matches.some((m) => m.title === design)) {
        setDesign(matches[0].title)
        setPrice(matches[0].price)
      }
    } else {
      setDesign('Standard ' + service)
      setPrice(service === 'Tattoo' ? 1500 : service === 'Piercing' ? 600 : 350)
    }
  }, [service, catalog])

  function handleDesignChange(selectedTitle) {
    setDesign(selectedTitle)
    const found = availableDesigns.find((d) => d.title === selectedTitle)
    if (found) {
      setPrice(found.price)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!clientName.trim() || !date) {
      setError('Please fill in all required fields before booking.')
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (new Date(date) < today) {
      setError('Please choose today or a future date.')
      return
    }

    addAppointment({
      name: clientName.trim(),
      date,
      service,
      design: design || `${service} Appointment`,
      price: price || 0,
      bookedBy: user.email,
      userId: user.uid,
    })

    setSuccess(true)
    setDate('')
    setTimeout(() => {
      navigate('/appointments')
    }, 1500)
  }

  return (
    <div className="bg-studio-black" style={{ minHeight: '100vh' }}>

      <div className="container mb-5 pb-5" style={{ maxWidth: '540px' }}>
        {success && (
          <div className="alert bg-studio-light-black text-white border border-studio d-flex align-items-center gap-2 shadow-sm" role="alert">
            <i className="bi bi-check-circle-fill fs-5 text-white"></i>
            <div>
              <strong>Appointment booked successfully!</strong>
              <div className="small text-studio-muted">Redirecting to your booking appointments list...</div>
            </div>
          </div>
        )}

        {/* Step 1: Select Service Category */}
        <div className="card shadow-sm mb-3 border-studio bg-studio-card rounded-3">
          <div className="card-header bg-studio-light-black text-white fw-semibold small py-3 border-studio">
            1. Select Service Category
          </div>
          <div className="card-body">
            <div className="row g-2 mb-2">
              {SERVICES.map((s) => (
                <div className="col-4" key={s.name}>
                  <button
                    type="button"
                    className="btn w-100 py-3 d-flex flex-column align-items-center justify-content-center transition-all rounded-3"
                    style={{
                      background: service === s.name ? '#1e1e1e' : '#121212',
                      color: '#ffffff',
                      border: service === s.name ? '2px solid #ffffff' : '1px solid #333333',
                    }}
                    onClick={() => setService(s.name)}
                  >
                    <i className={`bi ${s.icon} fs-4 mb-1 text-white`}></i>
                    <span className="fw-semibold small">{s.name}</span>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-studio-muted small mb-0">
              <i className="bi bi-clock me-1 text-white"></i>Typical duration:{' '}
              {SERVICES.find((s) => s.name === service)?.duration}
            </p>
          </div>
        </div>

        {/* Step 2: Choose Design & Schedule */}
        <div className="card shadow-sm border-studio bg-studio-card rounded-3">
          <div className="card-header bg-studio-light-black text-white fw-semibold small py-3 border-studio">
            2. Choose Design Picture &amp; Schedule
          </div>
          <div className="card-body">
            {error && <div className="alert bg-studio-black text-white border border-studio py-2 small">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-studio-muted fw-semibold">
                  Select Design Picture / Style
                </label>
                <select
                  className="form-select"
                  value={design}
                  onChange={(e) => handleDesignChange(e.target.value)}
                >
                  {availableDesigns.map((d) => (
                    <option key={d.id} value={d.title}>
                      {d.title} — ₱{Number(d.price).toLocaleString()}
                    </option>
                  ))}
                  <option value={`Custom ${service} Request`}>
                    Custom {service} Request (Consultation)
                  </option>
                </select>
              </div>

              {/* Price display badge */}
              <div className="mb-3 p-3 bg-studio-light-black rounded-3 border border-studio d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-studio-muted d-block">Estimated Service Price</small>
                  <span className="fw-bold text-white">{design}</span>
                </div>
                <span className="badge bg-studio-black text-white fs-5 px-3 py-2 border border-studio shadow-sm">
                  ₱{Number(price).toLocaleString()}
                </span>
              </div>

              <div className="mb-3">
                <label className="form-label small text-studio-muted fw-semibold">Client Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small text-studio-muted fw-semibold">Preferred Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-dark text-white border border-light w-100 py-2 fw-semibold shadow-sm">
                Confirm Booking (₱{Number(price).toLocaleString()})
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary text-studio-muted border-studio w-100 mt-2"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}

export default BookAppointment
