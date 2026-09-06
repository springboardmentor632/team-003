const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
app.use(cors({ origin: 'http://localhost:8443' }))
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me_please_32_chars'

const users = new Map()

// seed admin user
;(async () => {
  const hashed = await bcrypt.hash('Admin123!', 10)
  users.set('admin@example.com', { id: 1, name: 'Admin', email: 'admin@example.com', password: hashed, role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() })
})()

let idCounter = 2
// decisions store
const decisions = new Map()
let decisionIdCounter = 1

function nowISO() { return new Date().toISOString() }

function generateToken(email, role) {
  return jwt.sign({ sub: email, role }, JWT_SECRET, { expiresIn: '1d' })
}

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
  if (users.has(email)) return res.status(409).json({ message: 'Email already in use' })
  const hashed = await bcrypt.hash(password, 10)
  const user = { id: idCounter++, name, email, password: hashed, role: 'USER', createdAt: new Date(), updatedAt: new Date() }
  users.set(email, user)
  return res.status(201).json({ token: '', name: user.name, email: user.email, role: user.role })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  const user = users.get(email)
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
  const token = generateToken(user.email, user.role)
  return res.json({ token, name: user.name, email: user.email, role: user.role })
})

function authMiddleware(req, res, next) {
  const h = req.headers['authorization'] || ''
  if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' })
  const token = h.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = { email: decoded.sub, role: decoded.role }
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

app.get('/api/users/profile', authMiddleware, (req, res) => {
  const user = users.get(req.user.email)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const { id, name, email, role, createdAt, updatedAt } = user
  res.json({ id, name, email, role, createdAt, updatedAt })
})

app.put('/api/users/profile', authMiddleware, async (req, res) => {
  const user = users.get(req.user.email)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const { name, email } = req.body || {}
  if (email && email !== user.email && users.has(email)) return res.status(409).json({ message: 'Email already in use' })
  if (email && email !== user.email) {
    users.delete(user.email)
    user.email = email
    users.set(email, user)
  }
  if (name) user.name = name
  user.updatedAt = new Date()
  const { id, role, createdAt, updatedAt } = user
  res.json({ id, name: user.name, email: user.email, role, createdAt, updatedAt })
})

app.get('/api/admin/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' })
  const list = Array.from(users.values()).map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
  res.json(list)
})

// Create decision
app.post('/api/decisions', authMiddleware, (req, res) => {
  const { title, description, category, visibility, votingType, options, deadline } = req.body || {}
  if (!title || !Array.isArray(options) || options.length < 2) return res.status(400).json({ message: 'Invalid payload' })
  const ownerEmail = req.user.email
  const id = String(decisionIdCounter++)
  const decision = {
    id,
    title,
    description: description || '',
    category: category || null,
    visibility: visibility || 'public',
    votingType: votingType || 'single',
    options: options.map((o, idx) => ({ id: `opt-${idx+1}`, label: o, votes: 0 })),
    deadline: deadline || null,
    owner: ownerEmail,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  decisions.set(id, decision)
  res.status(201).json(decision)
})

// Get decision by id
app.get('/api/decisions/:id', (req, res) => {
  const d = decisions.get(req.params.id)
  if (!d) return res.status(404).json({ message: 'Not found' })
  res.json(d)
})

// list decisions (public)
app.get('/api/decisions', (req, res) => {
  const list = Array.from(decisions.values()).map(d => ({ id: d.id, title: d.title, category: d.category, owner: d.owner, createdAt: d.createdAt }))
  res.json(list)
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Mock backend running on http://localhost:${port}`))
