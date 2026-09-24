import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppointments } from '../context/AppointmentsContext.jsx'

function Dashboard() {
  const { catalog } = useAppointments()
  const navigate = useNavigate()

  const [selectedCategory, setSelectedCategory] = useState('Tattoo')

  const categoryTabs = [
    {
      key: 'Tattoo',
      label: 'Tattoo',
      icon: 'bi-pen',
      desc: 'Exclusive Tattoo Designs & Custom Artwork',
    },
    {
      key: 'Piercing',
      label: 'Piercing',
      icon: 'bi-gem',
      desc: 'Body & Ear Piercing Styles & Jewelry',
    },
    {
      key: 'Haircut',
      label: 'Haircut',
      icon: 'bi-scissors',
      desc: 'Modern Haircuts & Professional Grooming',
    },
  ]

  const activeTab = categoryTabs.find((t) => t.key === selectedCategory)
  const filteredCatalog = catalog.filter(
    (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
  )

  function handleBookItem(item) {
    navigate('/book', {
      state: {
        service: item.category,
        design: item.title,
        price: item.price,
      },
    })
  }

  return (
    <div className="bg-studio-black" style={{ minHeight: '100vh' }}>

      <div className="container mb-5 pb-5" style={{ maxWidth: '760px' }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold text-white mb-1">Studio Display Catalog</h4>
          <p className="text-studio-muted small">Select a category below to explore available design pictures and prices</p>
        </div>

        <div className="row g-2 mb-4">
          {categoryTabs.map((tab) => {
            const isActive = selectedCategory === tab.key
            const count = catalog.filter(
              (item) => item.category.toLowerCase() === tab.key.toLowerCase()
            ).length

            return (
              <div className="col-4" key={tab.key}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(tab.key)}
                  className="btn w-100 rounded-3 shadow-sm d-flex flex-column align-items-center justify-content-center py-3 px-2"
                  style={{
                    background: isActive ? '#403636de' : '#121212',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                    border: isActive ? '2px solid #ffffff' : '1px solid #333333',
                    minHeight: '95px',
                  }}
                >
                  <i
                    className={`bi ${tab.icon} mb-1 text-white`}
                    style={{ fontSize: '1.6rem' }}
                  ></i>
                  <span className="fw-bold" style={{ fontSize: '0.9rem' }}>
                    {tab.label}
                  </span>
                  <span
                    className="mt-1 rounded-pill px-2 py-0"
                    style={{
                      fontSize: '0.68rem',
                      background: isActive ? '#403636de' : '#484040',
                      color: '#e0e0e0',
                      fontWeight: 600,
                    }}
                  >
                    {count} Posted
                  </span>
                </button>
              </div>
            )
          })}
        </div>

        <div
          className="rounded-3 mb-4 d-flex align-items-center gap-3 px-3 py-3 shadow-sm bg-studio-card"
          style={{ borderLeft: '4px solid #ffffff' }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-studio-light-black text-white flex-shrink-0"
            style={{ width: '42px', height: '42px', border: '1px solid #333' }}
          >
            <i className={`bi ${activeTab.icon} fs-5`}></i>
          </div>
          <div className="flex-grow-1">
            <h6 className="fw-bold mb-0 text-white">
              {activeTab.label} Display Gallery
            </h6>
            <small className="text-studio-muted">{activeTab.desc}</small>
          </div>
          <span className="badge bg-studio-light-black text-white fs-6 px-3 py-2 rounded-pill border border-studio">
            {filteredCatalog.length} Pictures
          </span>
        </div>

        <div className="row g-3">
          {filteredCatalog.length === 0 ? (
            <div className="col-12 text-center py-5 bg-studio-card rounded-3 shadow-sm p-4">
              <i className="bi bi-camera text-secondary fs-1 d-block mb-2"></i>
              <h6 className="fw-bold text-white mb-1">
                No {selectedCategory} pictures posted yet
              </h6>
              <p className="text-studio-muted small mb-0">
                Check back soon or ask the studio admin to upload {selectedCategory} designs.
              </p>
            </div>
          ) : (
            filteredCatalog.map((item) => (
              <div className="col-12 col-sm-6" key={item.id}>
                <div className="card h-100 bg-studio-card rounded-3 overflow-hidden">
                  <div
                    className="position-relative overflow-hidden"
                    style={{ height: '220px', backgroundColor: '#0a0a0a' }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src =
                          'https://placehold.co/600x400/121212/ffffff?text=' +
                          encodeURIComponent(item.title)
                      }}
                    />

                    <span
                      className="position-absolute top-0 start-0 m-2 px-3 py-1 rounded-pill shadow-sm"
                      style={{
                        background: '#0d0d0d',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: '1px solid #333333',
                      }}
                    >
                      ₱{Number(item.price).toLocaleString()}
                    </span>

                    <span
                      className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded-3 shadow-sm"
                      style={{
                        background: '#1a1a1a',
                        color: '#b0b0b0',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        border: '1px solid #333333',
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div className="card-body d-flex flex-column p-3">
                    <h6 className="card-title fw-bold text-white mb-1">{item.title}</h6>
                    <p
                      className="card-text text-studio-muted small flex-grow-1 mb-3"
                      style={{ minHeight: '38px', fontSize: '0.82rem' }}
                    >
                      {item.description ||
                        `Specialized ${item.category} design crafted with precision.`}
                    </p>

                    <div className="pt-2 border-top border-studio">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-studio-muted fw-semibold">Service Price:</small>
                        <span className="fw-bold text-white fs-6">
                          ₱{Number(item.price).toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn w-100 btn-sm btn-outline-dark fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 text-white shadow-sm"
                        style={{ backgroundColor: '#1f1f1f', borderColor: '#3a3a3a' }}
                        onClick={() => handleBookItem(item)}
                      >
                        <i className="bi bi-calendar-plus text-white"></i>
                        <span>Book This {selectedCategory}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}

export default Dashboard
