import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import datosRoutes from './routes/datos.js'
import dotacionesRoutes from './routes/dotaciones.js'

const app  = express()
const PORT = process.env.PORT || 3001

// ── Cabeceras de seguridad HTTP ─────────────────────────────
app.use(helmet())

// ── Origins permitidos ───────────────────────────────────────
const originsPermitidos = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
    : [])
]

// ── Middlewares globales ────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (originsPermitidos.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: origin no permitido → ${origin}`))
  },
  credentials: true
}))
app.use(express.json({ limit: '50kb' }))

// ── Rate limiting: login ────────────────────────────────────
// Máx 10 intentos de login por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Espera 15 minutos.' },
  skipSuccessfulRequests: true,
})

// ── Rutas ───────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter)
app.use('/api/auth',       authRoutes)
app.use('/api/datos',      datosRoutes)
app.use('/api/dotaciones', dotacionesRoutes)
app.use('/api/admin',      adminRoutes)

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'Servidor de dotación funcionando',
    fecha: new Date().toISOString()
  })
})

// ── Manejo de rutas no encontradas ──────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` })
})

// ── Manejo de errores globales ───────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err)
  // Si es error de CORS, devolver 403 claro
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message })
  }
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ── Iniciar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ Servidor corriendo en puerto ${PORT}`)

  // Ping cada 10 min para evitar cold start en Railway
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    const url = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/health`
    setInterval(() => {
      fetch(url).catch(() => {})
    }, 10 * 60 * 1000)
  }
})