import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useAppointments, SERVICES } from '../context/AppointmentsContext.jsx'

function serviceIcon(name) {
  return SERVICES.find((s) => s.name === name)?.icon ?? 'bi-calendar'
}

function MyAppointments() {
  const { user } = useAuth()
  const { appointments } = useAppointments()

  const mine = appointments
    .filter((a) => a.bookedBy === user.email)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  function getStatusBadge(status) {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return <span className="badge bg-studio-light-black text-white border border-secondary px-3 py-1">Accepted</span>
      case 'declined':
        return <span className="badge bg-studio-black text-white border border-studio px-3 py-1">Declined</span>
      case 'cancelled':
        return <span className="badge bg-studio-card text-studio-muted border border-studio px-3 py-1">Cancelled</span>
      case 'pending':
      default:
        return <span className="badge bg-studio-card text-white border border-studio px-3 py-1">Pending Approval</span>
    }
  }

  return (
    <div className="bg-studio-black" style={{ minHeight: '100vh' }}>

      <div className="container mb-5 pb-5" style={{ maxWidth: '580px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-white mb-0">My Booked Appointments</h5>
            <small className="text-studio-muted">View booked services, designs, prices, and approval status</small>
          </div>
          <Link to="/book" className="btn btn-sm btn-dark text-white border border-studio d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-calendar-plus text-white"></i>
            <span>Book New</span>
          </Link>
        </div>

        {mine.length === 0 ? (
          <div className="text-center py-5 card border-studio shadow-sm p-4 bg-studio-card rounded-3">
            <i className="bi bi-calendar-x text-secondary" style={{ fontSize: '3rem' }}></i>
            <h6 className="mt-3 mb-1 fw-bold text-white">No appointments booked yet</h6>
            <p className="text-studio-muted small mb-4">
              Explore our Haircut, Piercing, and Tattoo display pictures in Home and book your preferred appointment slot!
            </p>
            <div>
              <Link to="/dashboard" className="btn btn-dark text-white border border-studio btn-sm me-2 shadow-sm">
                <i className="bi bi-images me-1 text-white"></i>View Display Pictures
              </Link>
              <Link to="/book" className="btn btn-outline-secondary text-white btn-sm">
                Book Slot Directly
              </Link>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {mine.map((a) => (
              <div className="card shadow-sm border-studio rounded-3 overflow-hidden bg-studio-card" key={a.id}>
                {/* Monochrome top strip */}
                <div style={{ height: '4px', background: '#444444' }} />
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-studio-light-black text-white border border-studio"
                        style={{ width: '36px', height: '36px' }}
                      >
                        <i className={`bi ${serviceIcon(a.service)}`} style={{ fontSize: '1rem' }}></i>
                      </span>
                      <div>
                        <span className="badge bg-studio-light-black text-white px-2 py-1 border border-studio" style={{ fontSize: '0.78rem' }}>
                          {a.service}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(a.status)}
                  </div>

                  <h6 className="mb-1 text-white fw-bold" style={{ fontSize: '1.05rem' }}>
                    {a.design || `${a.service} Appointment`}
                  </h6>

                  <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-studio">
                    <div className="small text-studio-muted">
                      <i className="bi bi-calendar-event me-1"></i>
                      {new Date(a.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-end">
                      <small className="text-studio-muted d-block" style={{ fontSize: '0.72rem' }}>Booked Price</small>
                      <span className="fw-bold text-white fs-6">
                        ₱{Number(a.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-top border-studio">
                    {a.status === 'pending' && (
                      <small className="text-studio-muted d-flex align-items-center gap-1">
                        <i className="bi bi-clock-history text-white"></i>
                        <span>Waiting for admin approval.</span>
                      </small>
                    )}
                    {(a.status === 'accepted' || a.status === 'confirmed') && (
                      <small className="text-white fw-semibold d-flex align-items-center gap-1">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Your appointment has been accepted by the admin!</span>
                      </small>
                    )}
                    {a.status === 'declined' && (
                      <small className="text-studio-muted fw-semibold d-flex align-items-center gap-1">
                        <i className="bi bi-x-circle-fill"></i>
                        <span>Your appointment request was declined by the admin.</span>
                      </small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default MyAppointments
