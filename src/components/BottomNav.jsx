import { Link, useLocation } from 'react-router-dom'

function BottomNav() {
  const location = useLocation()

  const links = [
    { path: '/dashboard', icon: 'bi-house-door', activeIcon: 'bi-house-door-fill', label: 'Home' },
    { path: '/book', icon: 'bi-calendar-plus', activeIcon: 'bi-calendar-plus-fill', label: 'Book' },
    { path: '/appointments', icon: 'bi-calendar-check', activeIcon: 'bi-calendar-check-fill', label: 'Bookings' },
    { path: '/profile', icon: 'bi-person', activeIcon: 'bi-person-fill', label: 'Profile' },
  ]

  return (
    <nav className="navbar fixed-bottom bg-studio-light-black border-top border-studio d-flex justify-content-around py-2">
      {links.map((link) => {
        const isActive = location.pathname === link.path
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-pill text-center small text-decoration-none ${isActive ? 'text-white fw-bold' : 'text-secondary'}`}
          >
            <i className={`bi ${isActive ? link.activeIcon : link.icon} d-block fs-5`}></i>
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
