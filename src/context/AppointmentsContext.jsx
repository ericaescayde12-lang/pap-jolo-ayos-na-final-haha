import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_CATALOG } from '../data/catalog.js'

const AppointmentsContext = createContext(null)
const STORAGE_KEY = 'pap-jolo-appointments-fallback'
const CATALOG_STORAGE_KEY = 'pap-jolo-catalog-fallback'

export const SERVICES = [
  { name: 'Tattoo', icon: 'bi-pen', duration: '2-4 hrs' },
  { name: 'Piercing', icon: 'bi-gem', duration: '30 mins' },
  { name: 'Haircut', icon: 'bi-scissors', duration: '45 mins' },
]

const API = '/api'

function readLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch { return fallback }
}

function writeLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* best effort */ }
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${response.status})`)
  }
  return response.json()
}

export function AppointmentsProvider({ children }) {
  const [appointments, setAppointments] = useState(() => readLocal(STORAGE_KEY, []))
  const [catalog, setCatalog] = useState(() => readLocal(CATALOG_STORAGE_KEY, DEFAULT_CATALOG))
  const [dataReady, setDataReady] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [catalogData, appointmentData] = await Promise.all([
          request('/catalog'),
          request('/appointments'),
        ])
        if (cancelled) return
        setCatalog(Array.isArray(catalogData) ? catalogData : DEFAULT_CATALOG)
        setAppointments(Array.isArray(appointmentData) ? appointmentData : [])
        setBackendOnline(true)
      } catch (error) {
        console.warn('Backend unavailable; using browser fallback storage.', error.message)
        if (!cancelled) setBackendOnline(false)
      } finally {
        if (!cancelled) setDataReady(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => writeLocal(STORAGE_KEY, appointments), [appointments])
  useEffect(() => writeLocal(CATALOG_STORAGE_KEY, catalog), [catalog])

  async function addAppointment({ name, date, service, design, price, bookedBy, userId }) {
    const payload = {
      name: name.trim(), date, service, design: design || service,
      price: Number(price) || 0, bookedBy, userId: userId || '', status: 'pending',
    }
    try {
      const created = await request('/appointments', { method: 'POST', body: JSON.stringify(payload) })
      setAppointments((prev) => [...prev, created])
      setBackendOnline(true)
      return created
    } catch (error) {
      const local = { ...payload, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      setAppointments((prev) => [...prev, local])
      setBackendOnline(false)
      console.warn('Saved appointment locally:', error.message)
      return local
    }
  }

  async function updateAppointmentStatus(id, newStatus) {
    try {
      const updated = await request(`/appointments/${encodeURIComponent(id)}/status`, {
        method: 'PATCH', body: JSON.stringify({ status: newStatus }),
      })
      setAppointments((prev) => prev.map((a) => a.id === id ? updated : a))
      setBackendOnline(true)
    } catch (error) {
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a))
      setBackendOnline(false)
      console.warn('Updated appointment locally:', error.message)
    }
  }

  async function cancelAppointment(id) {
    try {
      await request(`/appointments/${encodeURIComponent(id)}`, { method: 'DELETE' })
      setAppointments((prev) => prev.filter((a) => a.id !== id))
      setBackendOnline(true)
    } catch (error) {
      setAppointments((prev) => prev.filter((a) => a.id !== id))
      setBackendOnline(false)
      console.warn('Cancelled appointment locally:', error.message)
    }
  }

  async function addCatalogItem({ category, title, price, image, description }) {
    const payload = {
      category, title: title.trim(), price: Number(price) || 0,
      image: image || DEFAULT_CATALOG[0].image, description: description?.trim() || '',
    }
    try {
      const created = await request('/catalog', { method: 'POST', body: JSON.stringify(payload) })
      setCatalog((prev) => [created, ...prev])
      setBackendOnline(true)
      return created
    } catch (error) {
      const local = { ...payload, id: `${category.toLowerCase().slice(0, 3)}-${Date.now()}` }
      setCatalog((prev) => [local, ...prev])
      setBackendOnline(false)
      console.warn('Saved catalog item locally:', error.message)
      return local
    }
  }

  async function updateCatalogItem(id, updatedFields) {
    const payload = { ...updatedFields, price: updatedFields.price !== undefined ? Number(updatedFields.price) || 0 : undefined }
    try {
      const updated = await request(`/catalog/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) })
      setCatalog((prev) => prev.map((item) => item.id === id ? updated : item))
      setBackendOnline(true)
    } catch (error) {
      setCatalog((prev) => prev.map((item) => item.id === id ? { ...item, ...payload } : item))
      setBackendOnline(false)
      console.warn('Updated catalog item locally:', error.message)
    }
  }

  async function deleteCatalogItem(id) {
    try {
      await request(`/catalog/${encodeURIComponent(id)}`, { method: 'DELETE' })
      setCatalog((prev) => prev.filter((item) => item.id !== id))
      setBackendOnline(true)
    } catch (error) {
      setCatalog((prev) => prev.filter((item) => item.id !== id))
      setBackendOnline(false)
      console.warn('Deleted catalog item locally:', error.message)
    }
  }

  async function resetCatalogToDefault() {
    try {
      const result = await request('/catalog/reset', { method: 'POST', body: JSON.stringify({ catalog: DEFAULT_CATALOG }) })
      setCatalog(result)
      setBackendOnline(true)
    } catch (error) {
      setCatalog(DEFAULT_CATALOG)
      setBackendOnline(false)
      console.warn('Reset catalog locally:', error.message)
    }
  }

  return (
    <AppointmentsContext.Provider value={{
      appointments, addAppointment, updateAppointmentStatus, cancelAppointment,
      catalog, addCatalogItem, updateCatalogItem, deleteCatalogItem, resetCatalogToDefault,
      dataReady, backendOnline,
    }}>
      {children}
    </AppointmentsContext.Provider>
  )
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext)
  if (!ctx) throw new Error('useAppointments must be used inside an AppointmentsProvider')
  return ctx
}
