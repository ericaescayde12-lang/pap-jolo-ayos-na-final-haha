const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const app = express()
const PORT = Number(process.env.PORT || 5000)
const DATA_FILE = path.join(__dirname, 'data.json')

app.use(cors())
app.use(express.json({ limit: '8mb' }))

const fallback = { catalog: [], appointments: [], users: [] }
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@papjolostudio.com').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { salt, hash }
}
function verifyPassword(password, salt, hash) {
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'))
}
function publicUser(user) {
  const { passwordHash, passwordSalt, ...safe } = user
  return safe
}
function roleForEmail(email) { return ADMIN_EMAILS.includes(String(email).toLowerCase()) ? 'admin' : 'user' }
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(fallback, null, 2))
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    return {
      catalog: Array.isArray(parsed.catalog) ? parsed.catalog : [],
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
      users: Array.isArray(parsed.users) ? parsed.users : [],
    }
  } catch (error) {
    console.error('Could not read data.json:', error.message)
    return { ...fallback }
  }
}
function writeData(data) {
  const temp = `${DATA_FILE}.tmp`
  fs.writeFileSync(temp, JSON.stringify(data, null, 2))
  fs.renameSync(temp, DATA_FILE)
}
function clean(value) { return typeof value === 'string' ? value.trim() : value }
function validService(value) { return ['Tattoo', 'Piercing', 'Haircut'].includes(value) }



app.post('/api/auth/register', (req, res) => {
  const email = clean(req.body?.email)?.toLowerCase()
  const name = clean(req.body?.name)
  const password = req.body?.password || ''
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' })
  if (!name) return res.status(400).json({ error: 'Name is required.' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  const data = readData()
  if (data.users.some((u) => u.email.toLowerCase() === email)) return res.status(409).json({ error: 'That email already has an account. Sign in instead.' })
  const { salt, hash } = hashPassword(password)
  const user = { uid: `local-${crypto.randomUUID()}`, email, name, role: roleForEmail(email), provider: 'local', photoURL: '', passwordSalt: salt, passwordHash: hash, createdAt: new Date().toISOString() }
  data.users.push(user)
  writeData(data)
  res.status(201).json({ user: publicUser(user) })
})

app.post('/api/auth/login', (req, res) => {
  const email = clean(req.body?.email)?.toLowerCase()
  const password = req.body?.password || ''
  const data = readData()
  const user = data.users.find((u) => u.email.toLowerCase() === email && u.provider === 'local')
  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) return res.status(401).json({ error: 'Incorrect email or password.' })
  user.role = roleForEmail(user.email)
  writeData(data)
  res.json({ user: publicUser(user) })
})

app.post('/api/auth/google', (req, res) => {
  const email = clean(req.body?.email)?.toLowerCase()
  const uid = clean(req.body?.uid)
  if (!email || !uid) return res.status(400).json({ error: 'Google account information is required.' })
  const data = readData()
  let user = data.users.find((u) => u.email.toLowerCase() === email)
  if (!user) {
    user = { uid, email, name: clean(req.body?.name) || email.split('@')[0], role: roleForEmail(email), provider: 'google', photoURL: clean(req.body?.photoURL) || '', createdAt: new Date().toISOString() }
    data.users.push(user)
  } else {
    user.uid = uid; user.name = clean(req.body?.name) || user.name; user.photoURL = clean(req.body?.photoURL) || user.photoURL; user.role = roleForEmail(email); user.provider = 'google'
  }
  writeData(data)
  res.json({ user: publicUser(user) })
})

app.get('/api/health', (_req, res) => res.json({ ok: true, service: "PAP's Jolo Studio API" }))

// Module/demo GET endpoint retained and made useful.
app.get('/api/studios', (_req, res) => {
  res.json([
    { name: "PAP's Jolo Studio", location: 'Philippines', specialty: 'Tattoo, Piercing & Haircut' },
    { name: 'Jolo Tattoo Room', location: 'Lucena', specialty: 'Tattoo Designs' },
    { name: 'Jolo Grooming Corner', location: 'Lucena', specialty: 'Haircut & Styling' },
  ])
})

app.get('/api/catalog', (_req, res) => res.json(readData().catalog))

app.post('/api/catalog', (req, res) => {
  const { category, title, price, image, description } = req.body || {}
  if (!validService(category) || !clean(title) || !Number.isFinite(Number(price))) {
    return res.status(400).json({ error: 'Category, title, and a valid price are required.' })
  }
  const data = readData()
  const item = {
    id: `${category.slice(0, 3).toLowerCase()}-${crypto.randomUUID()}`,
    category, title: clean(title), price: Number(price), image: clean(image) || '', description: clean(description) || '',
  }
  data.catalog.unshift(item)
  writeData(data)
  res.status(201).json(item)
})

app.put('/api/catalog/:id', (req, res) => {
  const data = readData()
  const index = data.catalog.findIndex((item) => item.id === req.params.id)
  if (index < 0) return res.status(404).json({ error: 'Catalog item not found.' })
  const current = data.catalog[index]
  const next = { ...current, ...req.body }
  if (next.category && !validService(next.category)) return res.status(400).json({ error: 'Invalid service category.' })
  if (!clean(next.title) || !Number.isFinite(Number(next.price))) return res.status(400).json({ error: 'Title and valid price are required.' })
  next.title = clean(next.title); next.price = Number(next.price); next.description = clean(next.description) || ''; next.image = clean(next.image) || ''
  data.catalog[index] = next
  writeData(data)
  res.json(next)
})

app.delete('/api/catalog/:id', (req, res) => {
  const data = readData()
  const before = data.catalog.length
  data.catalog = data.catalog.filter((item) => item.id !== req.params.id)
  if (before === data.catalog.length) return res.status(404).json({ error: 'Catalog item not found.' })
  writeData(data)
  res.status(204).end()
})

app.post('/api/catalog/reset', (req, res) => {
  if (!Array.isArray(req.body?.catalog)) return res.status(400).json({ error: 'Catalog array is required.' })
  const data = readData()
  data.catalog = req.body.catalog
  writeData(data)
  res.json(data.catalog)
})

app.get('/api/appointments', (req, res) => {
  const data = readData()
  const email = clean(req.query.email)
  const result = email ? data.appointments.filter((a) => a.bookedBy === email) : data.appointments
  res.json(result)
})

app.post('/api/appointments', (req, res) => {
  const { name, date, service, design, price, bookedBy, userId, status } = req.body || {}
  if (!clean(name) || !clean(date) || !validService(service) || !clean(bookedBy)) {
    return res.status(400).json({ error: 'Name, date, service, and bookedBy are required.' })
  }
  const data = readData()
  const appointment = {
    id: crypto.randomUUID(), name: clean(name), date: clean(date), service,
    design: clean(design) || service, price: Number(price) || 0, bookedBy: clean(bookedBy),
    userId: clean(userId) || '', status: ['pending', 'accepted', 'declined', 'cancelled'].includes(status) ? status : 'pending',
    createdAt: new Date().toISOString(),
  }
  data.appointments.push(appointment)
  writeData(data)
  res.status(201).json(appointment)
})

app.patch('/api/appointments/:id/status', (req, res) => {
  const data = readData()
  const appointment = data.appointments.find((item) => item.id === req.params.id)
  const allowed = ['pending', 'accepted', 'declined', 'cancelled']
  if (!appointment) return res.status(404).json({ error: 'Appointment not found.' })
  if (!allowed.includes(req.body?.status)) return res.status(400).json({ error: 'Invalid appointment status.' })
  appointment.status = req.body.status
  writeData(data)
  res.json(appointment)
})

app.delete('/api/appointments/:id', (req, res) => {
  const data = readData()
  const before = data.appointments.length
  data.appointments = data.appointments.filter((item) => item.id !== req.params.id)
  if (before === data.appointments.length) return res.status(404).json({ error: 'Appointment not found.' })
  writeData(data)
  res.status(204).end()
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error.' })
})

app.listen(PORT, () => 
    console.log(`PAP's Jolo Studio API running on http://localhost:${PORT}`))
