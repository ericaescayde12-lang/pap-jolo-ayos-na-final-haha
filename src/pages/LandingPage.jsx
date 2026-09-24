import { useState } from 'react'
import { useAppointments } from '../context/AppointmentsContext.jsx'
import Login from './Login.jsx'

function LandingPage({ onLogin, onRegister, onGoogleLogin }) {
  const { catalog } = useAppointments()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [catalogFilter, setCatalogFilter] = useState('All')

  const filteredCatalog = catalogFilter === 'All'
    ? catalog.slice(0, 8)
    : catalog.filter((item) => item.category.toLowerCase() === catalogFilter.toLowerCase()).slice(0, 8)

  const services = [
    {
      title: 'Tattoo Artistry',
      category: 'Tattoo',
      icon: 'bi-pen',
      startingPrice: '₱1,800',
      description: 'Custom fine line, blackwork, traditional oriental, portraits, and full sleeves crafted by experienced tattoo artists.',
      features: ['Single-use sterile needles', 'Premium imported pigments', 'Custom flash or personalized art', 'Detailed aftercare support'],
    },
    {
      title: 'Body Piercing',
      category: 'Piercing',
      icon: 'bi-gem',
      startingPrice: '₱300',
      description: 'Professional body and facial piercing with medical-grade titanium and surgical steel jewelry for painless, hygienic results.',
      features: ['Hospital-grade sterilization', 'Ear, nose, lip & industrial', 'Hypoallergenic starter studs', 'Safe healing instructions'],
    },
    {
      title: 'Modern Haircut & Grooming',
      category: 'Haircut',
      icon: 'bi-scissors',
      startingPrice: '₱150',
      description: 'Precision fades, two-block cuts, taper fades, and classic gentleman styling tailored to your facial structure.',
      features: ['Clean razor detailing', 'Trending Asian & Western styles', 'Hair wash & blow dry', 'Pomade & styling finish'],
    },
  ]

  function openLogin() {
    setShowLoginModal(true)
  }

  function closeLogin() {
    setShowLoginModal(false)
  }

  return (
    <div className="landing-page bg-studio-black text-white" style={{ minHeight: '100vh' }}>
      {/* 1. TOP NAVIGATION */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-studio-light-black border-bottom border-studio sticky-top py-3 px-3 px-md-4">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center gap-2 text-white fw-bold fs-4" href="#home">
            <span className="brand-mark bg-studio-card border border-studio">
              <i className="bi bi-droplet-half text-white"></i>
            </span>
            <span>PAP's Jolo Studio</span>
          </a>

          <button
            className="navbar-toggler border-studio"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#landingNavbar"
            aria-controls="landingNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="landingNavbar">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-md-3">
              <li className="nav-item">
                <a className="nav-link text-white-50 hover-white" href="#services">Services</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white-50 hover-white" href="#catalog">Catalog & Pricing</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white-50 hover-white" href="#features">Why Choose Us</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white-50 hover-white" href="#about">Studio Info</a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
              <button
                onClick={openLogin}
                className="btn btn-outline-light d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-semibold"
                style={{ fontSize: '0.9rem' }}
              >
                <i className="bi bi-box-arrow-in-right text-info"></i>
                <span>Login</span>
              </button>

              <button
                onClick={openLogin}
                className="btn btn-light text-dark fw-bold d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm"
                style={{ fontSize: '0.9rem' }}
              >
                <i className="bi bi-calendar2-plus"></i>
                <span>Book Now</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section id="home" className="hero-section py-5 py-md-6 position-relative text-center border-bottom border-studio" style={{ overflow: 'hidden' }}>
        <div className="container py-4">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill bg-studio-light-black border border-studio small text-studio-muted">
            <span>Tattoo · Body Piercing · Haircut Appointments in Roxas, Oriental Mindoro</span>
          </div>

          <h1 className="display-4 display-md-3 fw-bolder text-white mb-3" style={{ letterSpacing: '-0.5px' }}>
            Art on Skin. <span className="text-white-50">Precision in Style.</span>
          </h1>

          <p className="lead text-studio-muted mx-auto mb-4" style={{ maxWidth: '680px', fontSize: '1.15rem' }}>
            Welcome to <strong>PAP's Jolo Studio</strong>. Explore tattoo designs, custom piercings, and modern haircuts.
            Book appointments online with instant confirmation and automatic account recognition for clients and administrators.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <button
              onClick={openLogin}
              className="btn btn-light btn-lg px-4 py-3 fw-bold rounded-pill d-inline-flex align-items-center gap-2 shadow"
            >
              <i className="bi bi-shield-lock-fill text-dark"></i>
              <span>Login (Admin & User)</span>
            </button>
            <a
              href="#catalog"
              className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold rounded-pill d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-images"></i>
              <span>View Design Catalog</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="row g-3 justify-content-center text-center mt-2">
            <div className="col-6 col-md-3">
              <div className="p-3 bg-studio-card rounded-4 border border-studio">
                <i className="bi bi-patch-check-fill text-warning fs-3 mb-1 d-block"></i>
                <div className="fs-5 fw-bold text-white">100% Sterile</div>
                <div className="text-studio-muted small">Medical Grade Equipment</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-studio-card rounded-4 border border-studio">
                <i className="bi bi-brush-fill text-info fs-3 mb-1 d-block"></i>
                <div className="fs-5 fw-bold text-white">Custom Designs</div>
                <div className="text-studio-muted small">Tattoo & Artwork</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-studio-card rounded-4 border border-studio">
                <i className="bi bi-lightning-charge-fill text-success fs-3 mb-1 d-block"></i>
                <div className="fs-5 fw-bold text-white">Instant Booking</div>
                <div className="text-studio-muted small">Real-time Schedule</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section id="services" className="py-5 border-bottom border-studio">
        <div className="container py-3">
          <div className="text-center mb-5">
            <h6 className="text-uppercase text-info fw-bold small tracking-wider mb-2">Our Craft & Services</h6>
            <h2 className="fw-bold text-white mb-2">Signature Studio Experiences</h2>
            <p className="text-studio-muted mx-auto" style={{ maxWidth: '580px' }}>
              Every service at PAP's Jolo Studio is delivered with passion, safety, and modern precision.
            </p>
          </div>

          <div className="row g-4">
            {services.map((service) => (
              <div key={service.title} className="col-md-4">
                <div className="card h-100 bg-studio-card border border-studio rounded-4 p-4 d-flex flex-column justify-content-between shadow-sm hover-elevate">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className="brand-mark bg-studio-light-black border border-studio fs-4">
                        <i className={`bi ${service.icon} text-white`}></i>
                      </span>
                      <span className="badge bg-dark border border-secondary text-light px-3 py-2 rounded-pill">
                        From {service.startingPrice}
                      </span>
                    </div>

                    <h4 className="fw-bold text-white mb-2">{service.title}</h4>
                    <p className="text-studio-muted small mb-4">{service.description}</p>

                    <ul className="list-unstyled mb-4">
                      {service.features.map((feat) => (
                        <li key={feat} className="small text-white-50 mb-2 d-flex align-items-center gap-2">
                          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '0.85rem' }}></i>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={openLogin}
                    className="btn btn-outline-light w-100 py-2 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-2"
                  >
                    <span>Book {service.category}</span>
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CATALOG PREVIEW */}
      <section id="catalog" className="py-5 border-bottom border-studio">
        <div className="container py-3">
          <div className="text-center mb-4">
            <h6 className="text-uppercase text-info fw-bold small tracking-wider mb-2">Live Studio Portfolio</h6>
            <h2 className="fw-bold text-white mb-2">Design Catalog & Pricing</h2>
            <p className="text-studio-muted mx-auto" style={{ maxWidth: '600px' }}>
              Browse through our authentic tattoo flash designs, piercing styles, and barber cuts with transparent pricing.
            </p>

            {/* Filter Tabs */}
            <div className="d-inline-flex p-1 rounded-pill bg-studio-light-black border border-studio mt-3">
              {['All', 'Tattoo', 'Piercing', 'Haircut'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatalogFilter(cat)}
                  className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                    catalogFilter === cat ? 'btn-light text-dark shadow-sm' : 'text-studio-muted border-0'
                  }`}
                  style={{ fontSize: '0.85rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="row g-4">
            {filteredCatalog.map((item) => (
              <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 bg-studio-card border border-studio rounded-4 overflow-hidden shadow-sm d-flex flex-column">
                  <div style={{ height: '200px', overflow: 'hidden', backgroundColor: '#111' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=500&auto=format&fit=crop&q=60'
                      }}
                    />
                  </div>
                  <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="badge bg-studio-light-black text-white-50 border border-studio small">
                          {item.category}
                        </span>
                        <span className="fw-bold text-white fs-6">
                          ₱{item.price?.toLocaleString()}
                        </span>
                      </div>
                      <h6 className="fw-bold text-white mb-1 text-truncate" title={item.title}>
                        {item.title}
                      </h6>
                      <p className="text-studio-muted small mb-3 text-truncate-2" style={{ fontSize: '0.8rem', minHeight: '38px' }}>
                        {item.description || 'Professional craftsmanship with high-grade studio care.'}
                      </p>
                    </div>

                    <button
                      onClick={openLogin}
                      className="btn btn-dark text-white border border-studio btn-sm w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-1"
                    >
                      <i className="bi bi-calendar-plus"></i>
                      <span>Sign in to Book</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <button
              onClick={openLogin}
              className="btn btn-outline-light px-4 py-2 rounded-pill fw-semibold"
            >
              <i className="bi bi-box-arrow-in-right me-2 text-info"></i>
              Log in to view complete catalog and manage bookings
            </button>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section id="features" className="py-5 border-bottom border-studio bg-studio-light-black">
        <div className="container py-3">
          <div className="text-center mb-5">
            <h6 className="text-uppercase text-info fw-bold small tracking-wider mb-2">Studio Quality Standards</h6>
            <h2 className="fw-bold text-white mb-2">Why Clients Trust PAP's Jolo</h2>
          </div>

          <div className="row g-4 text-start">
            <div className="col-md-6 col-lg-3">
              <div className="p-4 bg-studio-card border border-studio rounded-4 h-100">
                <div className="brand-mark bg-studio-light-black border border-studio mb-3">
                  <i className="bi bi-shield-check text-success"></i>
                </div>
                <h5 className="fw-bold text-white mb-2">100% Hygiene & Safety</h5>
                <p className="text-studio-muted small mb-0">
                  New single-use needles, autoclaved piercing clamps, sanitized barber tools, and premium skin barrier protection.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="p-4 bg-studio-card border border-studio rounded-4 h-100">
                <div className="brand-mark bg-studio-light-black border border-studio mb-3">
                  <i className="bi bi-palette text-warning"></i>
                </div>
                <h5 className="fw-bold text-white mb-2">Custom Artistry</h5>
                <p className="text-studio-muted small mb-0">
                  Collaborate directly with our resident tattoo artists for one of a kind flash, cover-ups, and realism pieces.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="p-4 bg-studio-card border border-studio rounded-4 h-100">
                <div className="brand-mark bg-studio-light-black border border-studio mb-3">
                  <i className="bi bi-calendar-event text-info"></i>
                </div>
                <h5 className="fw-bold text-white mb-2">Easy Online Booking</h5>
                <p className="text-studio-muted small mb-0">
                  Book from any phone or computer, pick your preferred design and date, and get instant status updates on your appointments.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="p-4 bg-studio-card border border-studio rounded-4 h-100">
                <div className="brand-mark bg-studio-light-black border border-studio mb-3">
                  <i className="bi bi-person-check text-danger"></i>
                </div>
                <h5 className="fw-bold text-white mb-2">Admin & Client Hub</h5>
                <p className="text-studio-muted small mb-0">
                  Universal login automatically routes administrators to catalog and appointment management, and clients to their bookings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STUDIO INFO & LOCATION */}
      <section id="about" className="py-5 border-bottom border-studio">
        <div className="container py-3">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="p-4 p-md-5 bg-studio-card border border-studio rounded-4">
                <h3 className="fw-bold text-white mb-3">About PAP's Jolo Studio</h3>
                <p className="text-studio-muted mb-4">
                  Located in the heart of Roxas, Oriental Mindoro, PAP's Jolo Studio is a premier multi-service destination dedicated
                  to modern self-expression. Whether you are getting your first tattoo, adding a titanium piercing, or refreshing
                  your hairstyle with a modern fade, our studio provides a welcoming, clean, and artistic atmosphere.
                </p>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <i className="bi bi-geo-alt-fill text-danger fs-5 mt-1"></i>
                    <div>
                      <div className="fw-bold text-white">Location</div>
                      <div className="text-studio-muted small">Paclasan, Roxas, Oriental Mindoro, Philippines</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <i className="bi bi-clock-fill text-info fs-5 mt-1"></i>
                    <div>
                      <div className="fw-bold text-white">Operating Hours</div>
                      <div className="text-studio-muted small">Monday – Sunday: 9:00 AM – 8:00 PM</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <i className="bi bi-envelope-fill text-warning fs-5 mt-1"></i>
                    <div>
                      <div className="fw-bold text-white">Contact & Inquiries</div>
                      <div className="text-studio-muted small">admin@papjolostudio.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 p-md-5 bg-studio-card border border-studio rounded-4 text-center">
                <div className="text-center mb-3">
                  <span className="brand-mark bg-studio-light-black border border-studio fs-3" style={{ width: '56px', height: '56px' }}>
                    <i className="bi bi-shield-lock text-white"></i>
                  </span>
                </div>
                <h4 className="fw-bold text-white mb-2">Sign In to Your Account</h4>
                <p className="text-studio-muted small mb-4">
                  Clients can view their appointment history, select custom designs, and schedule new sessions.
                  Studio administrators can manage live appointments, catalog pricing, and design uploads.
                </p>

                <div className="d-grid gap-2 col-md-10 mx-auto">
                  <button
                    onClick={openLogin}
                    className="btn btn-light text-dark fw-bold py-3 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-box-arrow-in-right fs-5"></i>
                    <span>Login (Client & Admin Access)</span>
                  </button>

                  <button
                    onClick={openLogin}
                    className="btn btn-outline-light py-2 rounded-pill small"
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Don't have an account? Create one here
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-4 bg-studio-black text-center text-studio-muted border-top border-studio small">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="brand-mark bg-studio-card border border-studio" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
              <i className="bi bi-droplet-half text-white"></i>
            </span>
            <span className="text-white fw-bold">PAP's Jolo Studio</span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <a href="#home" className="text-studio-muted text-decoration-none hover-white">Home</a>
            <a href="#services" className="text-studio-muted text-decoration-none hover-white">Services</a>
            <a href="#catalog" className="text-studio-muted text-decoration-none hover-white">Catalog</a>
            <button
              onClick={openLogin}
              className="btn btn-link text-info text-decoration-none p-0 small"
            >
              Admin & User Login
            </button>
          </div>
        </div>
      </footer>

      {/* 8. POPUP LOGIN MODAL */}
      {showLoginModal && (
        <Login
          isModal={true}
          onClose={closeLogin}
          onLogin={onLogin}
          onRegister={onRegister}
          onGoogleLogin={onGoogleLogin}
        />
      )}
    </div>
  )
}

export default LandingPage
