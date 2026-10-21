import { useState, useRef, useCallback, useEffect } from 'react'
import { useAppointments, SERVICES } from '../context/AppointmentsContext.jsx'

function AdminDashboard() {
  const {
    appointments,
    updateAppointmentStatus,
    cancelAppointment,
    catalog,
    addCatalogItem,
    updateCatalogItem,
    deleteCatalogItem,
  } = useAppointments()

  const [activeTab, setActiveTab] = useState('appointments')
  const [filter, setFilter] = useState('All')

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const toastTimer = useRef(null)

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ show: true, message, type })
    toastTimer.current = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }, [])

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [])
  const [catalogFilter, setCatalogFilter] = useState('All')

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState('Tattoo')
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newImage, setNewImage] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  // Edit form state
  const [editingItem, setEditingItem] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editImage, setEditImage] = useState('')
  const [editDescription, setEditDescription] = useState('')

  function handleImageFileUpload(e, isEdit = false) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (isEdit) {
        setEditImage(reader.result)
      } else {
        setNewImage(reader.result)
        setImagePreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Paste a copied photo (screenshot / "Copy Image") straight into the Image URL field.
  // If the clipboard only has text (a link), the normal paste still works.
  function handlePasteImage(e, isEdit = false) {
    const items = e.clipboardData && e.clipboardData.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (!file) continue

        e.preventDefault()
        const reader = new FileReader()
        reader.onloadend = () => {
          if (isEdit) {
            setEditImage(reader.result)
          } else {
            setNewImage(reader.result)
            setImagePreview(reader.result)
          }
        }
        reader.readAsDataURL(file)
        return
      }
    }
    // No image in clipboard -> let the browser paste the text/link normally
  }

  function handleCreateCatalogItem(e) {
    e.preventDefault()
    if (!newTitle.trim() || !newPrice) {
      alert('Please provide a title and price.')
      return
    }

    addCatalogItem({
      category: newCategory,
      title: newTitle.trim(),
      price: Number(newPrice),
      image: newImage || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=500&auto=format&fit=crop&q=80',
      description: newDescription.trim(),
    })

    setNewTitle('')
    setNewPrice('')
    setNewImage('')
    setNewDescription('')
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setShowAddForm(false)
    showToast('Done! New display has been posted successfully.')
  }

  function startEditing(item) {
    setEditingItem(item.id)
    setEditTitle(item.title)
    setEditPrice(item.price)
    setEditImage(item.image)
    setEditDescription(item.description)
  }

  function handleSaveEdit(id) {
    if (!editTitle.trim() || !editPrice) {
      alert('Title and price cannot be empty.')
      return
    }

    updateCatalogItem(id, {
      title: editTitle.trim(),
      price: Number(editPrice),
      image: editImage,
      description: editDescription.trim(),
    })

    setEditingItem(null)
    showToast('Done! Display has been updated successfully.')
  }

  const filteredAppointments =
    filter === 'All' ? appointments : appointments.filter((a) => a.service === filter)

  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  const filteredCatalog =
    catalogFilter === 'All'
      ? catalog
      : catalog.filter((c) => c.category.toLowerCase() === catalogFilter.toLowerCase())

  // 4 Horizontally Aligned Equal-Height Stat Cards (Monochrome Black Theme)
  const overviewCards = [
    {
      label: 'Total',
      count: appointments.length,
      icon: 'bi-calendar2-range',
    },
    {
      label: 'Tattoo',
      count: appointments.filter((a) => a.service === 'Tattoo').length,
      icon: 'bi-pen',
    },
    {
      label: 'Piercing',
      count: appointments.filter((a) => a.service === 'Piercing').length,
      icon: 'bi-gem',
    },
    {
      label: 'Haircut',
      count: appointments.filter((a) => a.service === 'Haircut').length,
      icon: 'bi-scissors',
    },
  ]

  return (
    <div className="bg-studio-black" style={{ minHeight: '100vh' }}>

      {/* SUCCESS TOAST NOTIFICATION */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: '320px',
            maxWidth: '500px',
            animation: 'fadeInDown 0.35s ease',
          }}
        >
          <div
            className="d-flex align-items-center gap-2 px-4 py-3 rounded-3 shadow-lg"
            style={{
              background: toast.type === 'success' ? '#1a3a1a' : '#3a1a1a',
              border: toast.type === 'success' ? '1px solid #2d6b2d' : '1px solid #6b2d2d',
              color: '#ffffff',
            }}
          >
            <i
              className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle-fill text-danger'}`}
              style={{ fontSize: '1.3rem' }}
            ></i>
            <span className="fw-semibold" style={{ fontSize: '0.95rem' }}>{toast.message}</span>
            <button
              className="btn-close btn-close-white ms-auto"
              style={{ fontSize: '0.65rem' }}
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
            ></button>
          </div>
        </div>
      )}

      <div className="container-fluid responsive-content page-content-admin mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h4 className="fw-bold text-white mb-0">Admin Control Panel</h4>
            <p className="text-studio-muted small mb-0">Manage client bookings, update prices, and post category displays</p>
          </div>
        </div>

        {/* 4 Horizontally Aligned Stat Cards in Black & Light Black */}
        <div className="row g-2 g-md-3 mb-4 responsive-stat-grid" style={{ display: 'flex', alignItems: 'stretch' }}>
          {overviewCards.map((c) => (
            <div className="col-3 responsive-stat-card" key={c.label} style={{ display: 'flex' }}>
              <div
                className="card text-center bg-studio-card rounded-3 w-100"
                style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div
                  className="card-body d-flex flex-column align-items-center justify-content-center"
                  style={{ padding: '16px 8px' }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mb-2 flex-shrink-0 bg-studio-light-black text-white border border-studio stat-icon"
                    style={{ width: '44px', height: '44px', minWidth: '44px' }}
                  >
                    <i className={`bi ${c.icon}`} style={{ fontSize: '1.15rem' }}></i>
                  </div>
                  <p
                    className="text-studio-muted fw-bold text-uppercase text-truncate w-100 mb-1 stat-label"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.6px', lineHeight: 1.2 }}
                  >
                    {c.label}
                  </p>
                  <p className="fw-bold mb-0 lh-1 text-white stat-number" style={{ fontSize: '1.75rem' }}>
                    {c.count}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Navigation Tabs */}
        <div className="d-flex gap-2 mb-4 border-bottom border-studio pb-2 admin-tabs">
          <button
            className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold ${
              activeTab === 'appointments' ? 'btn-dark text-white border border-light' : 'btn-outline-dark text-studio-muted'
            }`}
            onClick={() => setActiveTab('appointments')}
          >
            <i className="bi bi-calendar-check me-2"></i>
            Client Appointments ({appointments.length})
          </button>
          <button
            className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold ${
              activeTab === 'catalog' ? 'btn-dark text-white border border-light' : 'btn-outline-dark text-studio-muted'
            }`}
            onClick={() => setActiveTab('catalog')}
          >
            <i className="bi bi-images me-2"></i>
            Posted Displays &amp; Prices ({catalog.length})
          </button>
        </div>

        {/* TAB 1: APPOINTMENTS MANAGEMENT */}
        {activeTab === 'appointments' && (
          <div className="card bg-studio-card border-studio rounded-3 overflow-hidden">
            <div className="card-header bg-studio-light-black text-white d-flex flex-wrap justify-content-between align-items-center gap-2 py-3 border-studio">
              <span className="fw-semibold">
                <i className="bi bi-list-task me-2"></i>All Booked Appointments
              </span>
              <div className="d-flex align-items-center gap-2">
                <label className="small text-studio-muted">Filter Category:</label>
                <select
                  className="form-select form-select-sm w-auto"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All">All Services</option>
                  {SERVICES.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card-body p-0">
              {sortedAppointments.length === 0 ? (
                <p className="text-studio-muted mb-0 text-center py-5">
                  No client appointments match this filter.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                    <thead className="small text-uppercase fw-bold" style={{ backgroundColor: '#141414' }}>
                      <tr>
                        <th>Client</th>
                        <th>Service / Design</th>
                        <th>Price</th>
                        <th>Date</th>
                        <th>Booked By</th>
                        <th>Status</th>
                        <th className="text-end" style={{ minWidth: '170px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAppointments.map((a) => {
                        const isAccepted = a.status === 'accepted' || a.status === 'confirmed'
                        const isDeclined = a.status === 'declined'

                        const statusBadge = isAccepted ? (
                          <span className="badge bg-studio-light-black text-white border border-studio px-2 py-1">Accepted</span>
                        ) : isDeclined ? (
                          <span className="badge bg-studio-black text-white border border-studio px-2 py-1">Declined</span>
                        ) : (
                          <span className="badge bg-studio-card text-white border border-secondary px-2 py-1">Pending</span>
                        )

                        return (
                          <tr key={a.id} style={{ borderColor: '#2d2d2d' }}>
                            <td className="fw-semibold text-white">{a.name}</td>
                            <td>
                              <span className="badge bg-studio-light-black text-white me-1 border border-studio">
                                {a.service}
                              </span>
                              <small className="text-studio-muted d-block">{a.design || a.service}</small>
                            </td>
                            <td className="fw-bold text-white">
                              ₱{Number(a.price || 0).toLocaleString()}
                            </td>
                            <td className="small text-studio-muted">
                              {new Date(a.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>
                            <td className="text-studio-muted small">{a.bookedBy}</td>
                            <td>{statusBadge}</td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                {!isAccepted && (
                                  <button
                                    className="btn btn-outline-light"
                                    onClick={() => { updateAppointmentStatus(a.id, 'accepted'); showToast('Done! Appointment accepted successfully.') }}
                                    title="Accept Appointment"
                                  >
                                    <i className="bi bi-check-lg me-1"></i>Accept
                                  </button>
                                )}
                                {!isDeclined && (
                                  <button
                                    className="btn btn-outline-secondary text-white"
                                    onClick={() => { updateAppointmentStatus(a.id, 'declined'); showToast('Done! Appointment declined.', 'error') }}
                                    title="Decline Appointment"
                                  >
                                    <i className="bi bi-x-lg me-1"></i>Decline
                                  </button>
                                )}
                                <button
                                  className="btn btn-outline-dark text-white border-studio"
                                  onClick={() => {
                                    if (window.confirm(`Delete appointment for "${a.name}"?`)) {
                                      cancelAppointment(a.id)
                                      showToast('Done! Appointment deleted successfully.')
                                    }
                                  }}
                                  title="Delete Finished Appointment"
                                >
                                  <i className="bi bi-trash me-1"></i>Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: POSTED DISPLAYS & PRICES MANAGEMENT */}
        {activeTab === 'catalog' && (
          <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div className="d-flex gap-2 align-items-center">
                <span className="small text-studio-muted fw-semibold">Filter Category:</span>
                {['All', 'Tattoo', 'Piercing', 'Haircut'].map((cat) => (
                  <button
                    key={cat}
                    className={`btn btn-sm rounded-pill ${
                      catalogFilter === cat ? 'btn-dark text-white border border-light' : 'btn-outline-dark text-studio-muted'
                    }`}
                    onClick={() => setCatalogFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-dark text-white d-flex align-items-center gap-1 border border-studio shadow-sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <i className={`bi ${showAddForm ? 'bi-dash-lg' : 'bi-plus-lg'} text-white`}></i>
                  <span>{showAddForm ? 'Close Add Form' : 'Add New Display Picture'}</span>
                </button>
              </div>
            </div>

            {/* ADD NEW DISPLAY FORM */}
            {showAddForm && (
              <div className="card bg-studio-card border-studio mb-4 rounded-3">
                <div className="card-header bg-studio-light-black text-white fw-semibold small py-3 border-studio">
                  <i className="bi bi-plus-circle me-1"></i> Add New Posted Display Picture &amp; Price
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleCreateCatalogItem}>
                    <div className="row g-3">
                      <div className="col-12 col-md-4">
                        <label className="form-label small text-studio-muted fw-semibold">
                          Service Category
                        </label>
                        <select
                          className="form-select"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                        >
                          <option value="Tattoo">Tattoo</option>
                          <option value="Piercing">Piercing</option>
                          <option value="Haircut">Haircut</option>
                        </select>
                      </div>

                      <div className="col-12 col-md-5">
                        <label className="form-label small text-studio-muted fw-semibold">
                          Design / Style Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Japanese Dragon Sleeve, Fade Haircut"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-12 col-md-3">
                        <label className="form-label small text-studio-muted fw-semibold">
                          Price (₱)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="e.g. 1500"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          required
                          min="0"
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small text-studio-muted fw-semibold">
                          Upload Picture from Device
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          ref={fileInputRef}
                          onChange={(e) => handleImageFileUpload(e, false)}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small text-studio-muted fw-semibold">
<<<<<<< HEAD
                          Or Paste Image URL / Photo
=======
                          Or Paste Image URL
>>>>>>> f3da9b1 (ready to deploy)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Paste link or press Ctrl+V to paste a copied photo"
                          value={newImage.startsWith('data:') ? '' : newImage}
                          onChange={(e) => {
                            setNewImage(e.target.value)
                            setImagePreview(e.target.value)
                          }}
                          onPaste={(e) => handlePasteImage(e, false)}
                        />
                        {newImage.startsWith('data:') && (
                          <small className="text-studio-muted d-block mt-1">
                            <i className="bi bi-check-circle me-1"></i>Photo pasted/uploaded
                          </small>
                        )}
                      </div>

                      {imagePreview && (
                        <div className="col-12 text-center my-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="rounded shadow-sm border border-studio"
                            style={{ height: '140px', objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      <div className="col-12">
                        <label className="form-label small text-studio-muted fw-semibold">
                          Design Description
                        </label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Provide details about this style design..."
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                        ></textarea>
                      </div>

                      <div className="col-12 d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setShowAddForm(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-dark btn-sm px-4 border border-light">
                          Post Display to Client Catalog
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* DISPLAY CARDS GRID */}
            <div className="row g-3">
              {filteredCatalog.length === 0 ? (
                <div className="col-12 text-center py-5 bg-studio-card rounded-3 shadow-sm">
                  <p className="text-studio-muted mb-0">No display pictures posted in this category.</p>
                </div>
              ) : (
                filteredCatalog.map((item) => {
                  const isEditing = editingItem === item.id

                  return (
                    <div className="col-12 col-sm-6 col-lg-4" key={item.id}>
                      <div className="card h-100 bg-studio-card rounded-3 overflow-hidden border-studio">
                        {isEditing ? (
                          <div className="card-body p-3">
                            <h6 className="fw-bold mb-3 text-white">Edit Display &amp; Price</h6>

                            <div className="mb-2">
                              <label className="form-label small text-studio-muted">Title / Name</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                              />
                            </div>

                            <div className="mb-2">
                              <label className="form-label small text-studio-muted">Price (₱)</label>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                              />
                            </div>

                            <div className="mb-2">
                              <label className="form-label small text-studio-muted">Upload New Picture (File)</label>
                              <input
                                type="file"
                                accept="image/*"
                                className="form-control form-control-sm"
                                onChange={(e) => handleImageFileUpload(e, true)}
                              />
                            </div>

                            <div className="mb-2">
<<<<<<< HEAD
                              <label className="form-label small text-studio-muted">Image URL / Paste Photo</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Paste link or press Ctrl+V to paste a copied photo"
=======
                              <label className="form-label small text-studio-muted">Image URL</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Paste image URL here"
>>>>>>> f3da9b1 (ready to deploy)
                                value={editImage.startsWith('data:') ? '' : editImage}
                                onChange={(e) => setEditImage(e.target.value)}
                                onPaste={(e) => handlePasteImage(e, true)}
                              />
                              {editImage.startsWith('data:') && (
                                <small className="text-studio-muted d-block mt-1">
                                  <i className="bi bi-check-circle me-1"></i>Photo pasted/uploaded
                                </small>
                              )}
                            </div>

                            {editImage && (
                              <div className="mb-2 text-center">
                                <img
                                  src={editImage}
                                  alt="Preview"
                                  className="rounded border border-studio"
                                  style={{ height: '100px', objectFit: 'cover' }}
                                />
                              </div>
                            )}

                            <div className="mb-3">
                              <label className="form-label small text-studio-muted">Short Description</label>
                              <textarea
                                className="form-control form-control-sm"
                                rows="2"
                                placeholder="say something..."
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                              ></textarea>
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setEditingItem(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn btn-sm btn-dark border border-light"
                                onClick={() => handleSaveEdit(item.id)}
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              className="position-relative overflow-hidden"
                              style={{ height: '180px', backgroundColor: '#0a0a0a' }}
                            >
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-100 h-100"
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  e.currentTarget.onerror = null
                                  e.currentTarget.src =
                                    'https://placehold.co/600x400/121212/ffffff?text=' +
                                    encodeURIComponent(item.title)
                                }}
                              />
                              <span className="badge bg-studio-light-black text-white position-absolute top-0 start-0 m-2 px-2 py-1 small border border-studio">
                                {item.category}
                              </span>
                              <span className="badge bg-studio-black text-white position-absolute bottom-0 end-0 m-2 px-2 py-1 fs-6 border border-studio">
                                ₱{Number(item.price).toLocaleString()}
                              </span>
                            </div>

                            <div className="card-body p-3 d-flex flex-column">
                              <h6 className="card-title fw-bold text-white mb-1">{item.title}</h6>
                              <p
                                className="card-text text-studio-muted small flex-grow-1 mb-3"
                                style={{ minHeight: '36px', fontSize: '0.8rem' }}
                              >
                                {item.description || ''}
                              </p>

                              <div className="d-flex justify-content-between gap-2 pt-2 border-top border-studio">
                                <button
                                  className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
                                  onClick={() => startEditing(item)}
                                >
                                  <i className="bi bi-pencil-square"></i>
                                  Edit / Price
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary text-white d-flex align-items-center gap-1"
                                  onClick={() => {
                                    if (window.confirm(`Do you want to delete "${item.title}" from posted displays?`)) {
                                      deleteCatalogItem(item.id)
                                      showToast('Done! Display has been deleted successfully.')
                                    }
                                  }}
                                >
                                  <i className="bi bi-trash"></i>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard