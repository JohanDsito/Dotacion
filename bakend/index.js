import cors from 'cors'
import 'dotenv/config'
import express from 'express'

import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import datosRoutes from './routes/datos.js'
import dotacionesRoutes from './routes/dotaciones.js'

const app  = express()
const PORT = process.env.PORT || 3001

// ── Origins permitidos ───────────────────────────────────────
// En producción, define FRONTEND_URL en tu .env (ej: https://tu-app.vercel.app)
// Puedes agregar varios separados por coma: https://a.vercel.app,https://b.vercel.app
const originsPermitidos = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
    : [])
]

console.log('🌐 Origins CORS permitidos:', originsPermitidos)

// ── Middlewares globales ────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej: Postman, curl, mobile apps)
    if (!origin) return callback(null, true)
    if (originsPermitidos.includes(origin)) return callback(null, true)
    console.warn('⚠️  CORS bloqueado para origin:', origin)
    callback(new Error(`CORS: origin no permitido → ${origin}`))
  },
  credentials: true
}))
app.use(express.json())

// ── Rutas ───────────────────────────────────────────────────
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
  console.log(`\n✓ Servidor corriendo en http://localhost:${PORT}`)
  console.log(`✓ Health check: http://localhost:${PORT}/api/health\n`)
})