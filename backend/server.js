const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 8080;

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('PAP Jolo backend is running.'));

const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

const defaultStudios = [
  { id: 1, name: "PAP's Jolo Studio", location: 'Roxas', specialty: 'Tattoo, Piercing & Haircut' },
  { id: 2, name: 'Jolo Tattoo Room', location: 'Palayan', specialty: 'Tattoo Designs' },
  { id: 3, name: 'Jolo Grooming Corner', location: 'Paclasan', specialty: 'Haircut & Styling' },
];

const log = (action, data) => {
  console.log('\n[' + new Date().toLocaleString() + '] ' + action);
  if (data !== undefined) console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
};

const short = (v) => (typeof v === 'string' && v.length > 120 ? v.slice(0, 60) + '... [' + v.length + ' chars]' : v);
const clean = (o) => JSON.parse(JSON.stringify(o || {}, (k, v) => (k === 'password' ? '***' : short(v))));

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    res.on('finish', () => {
      log(req.method + ' ' + req.originalUrl + ' -> ' + res.statusCode, clean(req.body));
    });
  }
  next();
});

function storeImage(image) {
  if (!image) return '';
  const m = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/s.exec(image);
  if (!m) return image.replace(/^https?:\/\/[^/]+(?=\/uploads\/)/, '');
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const name = 'img-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(m[2], 'base64'));
  return '/uploads/' + name;
}

function removeImage(image) {
  if (image && image.startsWith('/uploads/')) {
    try { fs.unlinkSync(path.join(UPLOAD_DIR, path.basename(image))); } catch {}
  }
}

const withUrl = (req, item) =>
  item.image && item.image.startsWith('/uploads/')
    ? { ...item, image: req.protocol + '://' + req.get('host') + item.image }
    : item;

function loadData() {
  const base = { catalog: [], appointments: [], users: [], studios: defaultStudios };
  if (!fs.existsSync(DATA_FILE)) return base;
  try {
    return { ...base, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) };
  } catch (err) {
    console.error('data.json is corrupted, trying the .bak file:', err.message);
    fs.copyFileSync(DATA_FILE, DATA_FILE + '.corrupt-' + Date.now());
    try {
      return { ...base, ...JSON.parse(fs.readFileSync(DATA_FILE + '.bak', 'utf-8')) };
    } catch {
      return base;
    }
  }
}

function save() {
  try {
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8');
    if (fs.existsSync(DATA_FILE)) fs.copyFileSync(DATA_FILE, DATA_FILE + '.bak');
    fs.renameSync(tmp, DATA_FILE);
  } catch (err) {
    console.error('Error saving data.json:', err);
  }
}

const db = loadData();
const safe = ({ password, ...rest }) => rest;

let migrated = false;
db.catalog.forEach((c) => {
  if (c.image && c.image.startsWith('data:image/')) {
    c.image = storeImage(c.image);
    migrated = true;
  }
});
if (migrated) {
  save();
  console.log('Old images were moved to the uploads/ folder.');
}

app.get('/api/catalog', (req, res) => res.json(db.catalog.map((c) => withUrl(req, c))));

app.post('/api/catalog', (req, res) => {
  const { category, title, price, image, description } = req.body;
  const item = {
    id: (category || 'item').toLowerCase().slice(0, 3) + '-' + Date.now(),
    category: category || 'Tattoo',
    title: (title || '').trim(),
    price: Number(price) || 0,
    image: storeImage(image),
    description: (description || '').trim(),
    createdAt: new Date().toISOString(),
  };
  db.catalog.unshift(item);
  save();
  log('NEW display added: "' + item.title + '" (' + item.id + ')', { price: item.price, image: item.image });
  res.status(201).json(withUrl(req, item));
});

app.put('/api/catalog/:id', (req, res) => {
  const i = db.catalog.findIndex((c) => c.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Catalog item not found.' });
  const old = db.catalog[i];
  const updated = {
    ...old,
    ...req.body,
    id: old.id,
    price: req.body.price !== undefined ? Number(req.body.price) || 0 : old.price,
    updatedAt: new Date().toISOString(),
  };

  if (!req.body.image) {
    updated.image = old.image;
  } else {
    updated.image = storeImage(req.body.image);
    if (updated.image !== old.image) removeImage(old.image);
  }

  db.catalog[i] = updated;
  save();

  const changes = {};
  ['category', 'title', 'price', 'image', 'description'].forEach((k) => {
    if (old[k] !== updated[k]) changes[k] = { before: short(old[k]), after: short(updated[k]) };
  });
  log(
    'EDITED display "' + old.title + '" (' + old.id + ')',
    Object.keys(changes).length ? changes : 'No changes'
  );

  res.json(withUrl(req, updated));
});

app.delete('/api/catalog/:id', (req, res) => {
  const i = db.catalog.findIndex((c) => c.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Catalog item not found.' });
  log('DELETED display "' + db.catalog[i].title + '" (' + db.catalog[i].id + ')');
  removeImage(db.catalog[i].image);
  db.catalog.splice(i, 1);
  save();
  res.json({ message: 'Catalog item deleted.' });
});

app.post('/api/catalog/reset', (req, res) => {
  if (db.catalog.length && req.query.force !== 'true') {
    log('RESET was NOT applied because the catalog already has items (' + db.catalog.length + ' items)');
    return res.json(db.catalog.map((c) => withUrl(req, c)));
  }
  const incoming = Array.isArray(req.body.catalog) ? req.body.catalog : [];
  db.catalog = incoming.map((c) => ({ ...c, image: storeImage(c.image) }));
  save();
  log('RESET: catalog filled with ' + db.catalog.length + ' items');
  res.json(db.catalog.map((c) => withUrl(req, c)));
});

app.get('/api/appointments', (req, res) => res.json(db.appointments));

app.post('/api/appointments', (req, res) => {
  const appt = {
    id: 'appt-' + Date.now(),
    ...req.body,
    status: req.body.status || 'pending',
    createdAt: new Date().toISOString(),
  };
  db.appointments.push(appt);
  save();
  res.status(201).json(appt);
});

app.patch('/api/appointments/:id/status', (req, res) => {
  const i = db.appointments.findIndex((a) => a.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Appointment not found.' });
  const oldStatus = db.appointments[i].status;
  db.appointments[i] = { ...db.appointments[i], status: req.body.status, updatedAt: new Date().toISOString() };
  save();
  log('CHANGED status of appointment ' + db.appointments[i].id, { before: oldStatus, after: req.body.status });
  res.json(db.appointments[i]);
});

app.delete('/api/appointments/:id', (req, res) => {
  db.appointments = db.appointments.filter((a) => a.id !== req.params.id);
  save();
  res.json({ message: 'Appointment deleted.' });
});

app.get('/api/auth/users', (req, res) => res.json({ users: db.users.map(safe) }));

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email === (email || '').toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
  res.json({ user: safe(user) });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  const cleanEmail = (email || '').toLowerCase();
  if (db.users.find((u) => u.email === cleanEmail)) return res.status(409).json({ error: 'Email already registered.' });
  const user = {
    uid: 'local-' + Date.now(),
    email: cleanEmail,
    name: (name || '').trim() || cleanEmail.split('@')[0],
    password,
    role: 'user',
    provider: 'local',
    photoURL: '',
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save();
  res.status(201).json({ user: safe(user) });
});

app.post('/api/auth/google', (req, res) => {
  const { uid, email, name, photoURL } = req.body;
  const cleanEmail = (email || '').toLowerCase();
  let user = db.users.find((u) => u.uid === uid || u.email === cleanEmail);
  if (user) {
    Object.assign(user, {
      uid: uid || user.uid,
      name: name || user.name,
      photoURL: photoURL || user.photoURL,
      lastLogin: new Date().toISOString(),
    });
  } else {
    user = {
      uid: uid || 'google-' + Date.now(),
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0] || 'User',
      role: 'user',
      provider: 'google',
      photoURL: photoURL || '',
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
  }
  save();
  res.json({ user: safe(user) });
});

app.get('/api/studios', (req, res) => res.json(db.studios));

app.post('/api/studios', (req, res) => {
  const { name, location, specialty } = req.body;
  const studio = { id: db.studios.length ? Math.max(...db.studios.map((s) => s.id)) + 1 : 1, name, location, specialty };
  db.studios.push(studio);
  save();
  res.status(201).json(studio);
});

app.put('/api/studios/:id', (req, res) => {
  const i = db.studios.findIndex((s) => s.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Studio not found.' });
  db.studios[i] = { id: Number(req.params.id), ...req.body };
  save();
  res.json(db.studios[i]);
});

app.delete('/api/studios/:id', (req, res) => {
  const i = db.studios.findIndex((s) => s.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Studio not found.' });
  db.studios.splice(i, 1);
  save();
  res.json({ message: 'Studio deleted successfully.' });
});

app.listen(PORT, () => {
  console.log('\nBackend server running on port ' + PORT);
  console.log('Data file: ' + DATA_FILE);
  console.log('Images folder: ' + UPLOAD_DIR + '\n');
});