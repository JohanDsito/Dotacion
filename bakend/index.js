import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes      from './routes/auth.js'
import datosRoutes     from './routes/datos.js'
import dotacionesRoutes from './routes/dotaciones.js'
import adminRoutes     from './routes/admin.js'

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middlewares globales ────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',   // React en desarrollo (Vite)
    'http://localhost:3000',
    // Cuando hagas deploy, agrega aquí la URL de Vercel:
    // 'https://tu-app.vercel.app'
  ],
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
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ── Iniciar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✓ Servidor corriendo en http://localhost:${PORT}`)
  console.log(`✓ Health check: http://localhost:${PORT}/api/health\n`)
})
