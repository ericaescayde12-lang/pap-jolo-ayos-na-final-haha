import { useAuth } from '../context/AuthContext.jsx'
import { useAppointments } from '../context/AppointmentsContext.jsx'

function Profile() {
  const { user } = useAuth()
  const { appointments } = useAppointments()

  const myAppointments = appointments.filter((a) => a.bookedBy === user.email)
  const total = myAppointments.length
  const tattooCount = myAppointments.filter((a) => a.service === 'Tattoo').length
  const piercingCount = myAppointments.filter((a) => a.service === 'Piercing').length
  const haircutCount = myAppointments.filter((a) => a.service === 'Haircut').length

  const confirmedCount = myAppointments.filter((a) => a.status === 'accepted' || a.status === 'confirmed').length
  const pendingCount = myAppointments.filter((a) => a.status === 'pending').length
  const declinedCount = myAppointments.filter((a) => a.status === 'declined').length

  return (
    <div className="bg-studio-black" style={{ minHeight: '100vh' }}>

      <div className="container mb-5 pb-5" style={{ maxWidth: '540px' }}>
        {/* User Profile Info Card */}
        <div className="card shadow-sm mb-3 border-studio bg-studio-card rounded-3">
          <div className="card-body text-center py-4">
            <div
              className="brand-mark mb-3 shadow-sm mx-auto bg-studio-light-black text-white border border-studio"
              style={{ width: 72, height: 72, fontSize: '2rem' }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h5 className="mt-2 mb-0 fw-bold text-white">{user.name}</h5>
            <p className="text-studio-muted small mb-2">{user.email}</p>
            <span className="badge bg-studio-light-black text-white border border-studio px-3 py-1 rounded-pill">
              Client Account
            </span>
          </div>
        </div>

        {/* Separate Book Numbers (4 Overview Cards grid) */}
        <div className="card shadow-sm mb-3 border-studio bg-studio-card rounded-3">
          <div className="card-header bg-studio-light-black text-white fw-semibold small py-3 d-flex align-items-center justify-content-between border-studio">
            <span>
              <i className="bi bi-bookmark-check me-2 text-white"></i>
              Separate Book Numbers by Service
            </span>
            <span className="badge bg-studio-black text-white border border-studio fw-bold">{total} Total</span>
          </div>
          <div className="card-body p-3">
            <div className="row g-2 text-center" style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Total Card */}
              <div className="col-3" style={{ display: 'flex' }}>
                <div
                  className="rounded-3 d-flex flex-column justify-content-center align-items-center border border-studio w-100 bg-studio-light-black"
                  style={{ padding: '12px 6px' }}
                >
                  <i className="bi bi-calendar2-check text-white mb-1" style={{ fontSize: '1.3rem' }}></i>
                  <small
                    className="text-studio-muted fw-bold w-100 mb-1 text-center text-truncate"
                    style={{ fontSize: '0.63rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}
                  >
                    Total
                  </small>
                  <span className="fw-bold text-white" style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                    {total}
                  </span>
                </div>
              </div>
              {/* Tattoo Card */}
              <div className="col-3" style={{ display: 'flex' }}>
                <div
                  className="rounded-3 d-flex flex-column justify-content-center align-items-center border border-studio w-100 bg-studio-light-black"
                  style={{ padding: '12px 6px' }}
                >
                  <i className="bi bi-pen text-white mb-1" style={{ fontSize: '1.3rem' }}></i>
                  <small
                    className="text-studio-muted fw-bold w-100 mb-1 text-center text-truncate"
                    style={{ fontSize: '0.63rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}
                  >
                    Tattoo
                  </small>
                  <span className="fw-bold text-white" style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                    {tattooCount}
                  </span>
                </div>
              </div>
              {/* Piercing Card */}
              <div className="col-3" style={{ display: 'flex' }}>
                <div
                  className="rounded-3 d-flex flex-column justify-content-center align-items-center border border-studio w-100 bg-studio-light-black"
                  style={{ padding: '12px 6px' }}
                >
                  <i className="bi bi-gem text-white mb-1" style={{ fontSize: '1.3rem' }}></i>
                  <small
                    className="text-studio-muted fw-bold w-100 mb-1 text-center text-truncate"
                    style={{ fontSize: '0.63rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}
                  >
                    Piercing
                  </small>
                  <span className="fw-bold text-white" style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                    {piercingCount}
                  </span>
                </div>
              </div>
              {/* Haircut Card */}
              <div className="col-3" style={{ display: 'flex' }}>
                <div
                  className="rounded-3 d-flex flex-column justify-content-center align-items-center border border-studio w-100 bg-studio-light-black"
                  style={{ padding: '12px 6px' }}
                >
                  <i className="bi bi-scissors text-white mb-1" style={{ fontSize: '1.3rem' }}></i>
                  <small
                    className="text-studio-muted fw-bold w-100 mb-1 text-center text-truncate"
                    style={{ fontSize: '0.63rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}
                  >
                    Haircut
                  </small>
                  <span className="fw-bold text-white" style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                    {haircutCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Service Booking Breakdown List */}
        <div className="card shadow-sm mb-3 border-studio bg-studio-card rounded-3">
          <div className="card-header bg-studio-light-black border-studio fw-bold small py-3 text-white">
            <i className="bi bi-list-ol me-2 text-white"></i>Service Booking Breakdown
          </div>
          <div className="card-body p-0">
            <ul className="list-group list-group-flush bg-transparent">
              <li className="list-group-item d-flex justify-content-between align-items-center py-3 bg-studio-light-black text-white border-studio">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-studio-black text-white p-2 rounded-circle border border-studio">
                    <i className="bi bi-calendar2-check fs-6"></i>
                  </span>
                  <div>
                    <h6 className="mb-0 fw-bold text-white">Total All Bookings</h6>
                    <small className="text-studio-muted">Overall booked appointment slots</small>
                  </div>
                </div>
                <span className="badge bg-studio-card text-white border border-studio rounded-pill fs-6 px-3 py-2">{total}</span>
              </li>

              <li className="list-group-item d-flex justify-content-between align-items-center py-3 bg-studio-card text-white border-studio">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-studio-light-black text-white p-2 rounded-circle border border-studio">
                    <i className="bi bi-pen fs-6"></i>
                  </span>
                  <div>
                    <h6 className="mb-0 fw-semibold text-white">Tattoo Bookings</h6>
                    <small className="text-studio-muted">Booked Tattoo appointment slots</small>
                  </div>
                </div>
                <span className="badge bg-studio-light-black text-white border border-studio rounded-pill fs-6 px-3 py-2">{tattooCount}</span>
              </li>

              <li className="list-group-item d-flex justify-content-between align-items-center py-3 bg-studio-card text-white border-studio">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-studio-light-black text-white p-2 rounded-circle border border-studio">
                    <i className="bi bi-gem fs-6"></i>
                  </span>
                  <div>
                    <h6 className="mb-0 fw-semibold text-white">Piercing Bookings</h6>
                    <small className="text-studio-muted">Booked Piercing appointment slots</small>
                  </div>
                </div>
                <span className="badge bg-studio-light-black text-white border border-studio rounded-pill fs-6 px-3 py-2">{piercingCount}</span>
              </li>

              <li className="list-group-item d-flex justify-content-between align-items-center py-3 bg-studio-card text-white border-studio">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-studio-light-black text-white p-2 rounded-circle border border-studio">
                    <i className="bi bi-scissors fs-6"></i>
                  </span>
                  <div>
                    <h6 className="mb-0 fw-semibold text-white">Haircut Bookings</h6>
                    <small className="text-studio-muted">Booked Haircut appointment slots</small>
                  </div>
                </div>
                <span className="badge bg-studio-light-black text-white border border-studio rounded-pill fs-6 px-3 py-2">{haircutCount}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Booking Status Summary */}
        <div className="card shadow-sm border-studio mb-4 bg-studio-card rounded-3">
          <div className="card-body">
            <h6 className="card-subtitle mb-3 text-studio-muted small fw-bold text-uppercase">
              Booking Status Summary
            </h6>
            <div className="row g-2 text-center">
              <div className="col-4">
                <div className="p-2 border border-studio rounded-3 bg-studio-light-black">
                  <small className="text-studio-muted d-block">Pending</small>
                  <span className="fw-bold text-white fs-5">{pendingCount}</span>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 border border-studio rounded-3 bg-studio-light-black">
                  <small className="text-studio-muted d-block">Accepted</small>
                  <span className="fw-bold text-white fs-5">{confirmedCount}</span>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 border border-studio rounded-3 bg-studio-light-black">
                  <small className="text-studio-muted d-block">Declined</small>
                  <span className="fw-bold text-white fs-5">{declinedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Profile
