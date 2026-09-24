import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center px-3"
      style={{ minHeight: '100vh' }}
    >
      <i className="bi bi-signpost-2 text-secondary" style={{ fontSize: '3rem' }}></i>
      <h2 className="mt-3">Page not found</h2>
      <p className="text-secondary mb-4">That page doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-success">
        Back to login
      </Link>
    </div>
  )
}

export default NotFound
