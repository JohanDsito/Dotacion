import 'dotenv/config'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import supabase from '../config/supabase.js'

const router = Router()

// POST /api/auth/login
// Body: { coordinador_id, clave, dependencia_id } para coordinador
//       { nombre, clave } para admin
// El coordinador entra con su ID, la clave general y su dependencia
router.post('/login', async (req, res) => {
  const { coordinador_id, clave, dependencia_id, nombre } = req.body

  console.log('📡 POST /login - Intento:', { coordinador_id, clave: clave ? '***' : 'vacío', dependencia_id })

  if (!clave) {
    return res.status(400).json({ error: 'Clave es requerida' })
  }

  // --- Login administrador ---
  if (clave === process.env.CLAVE_ADMIN) {
    console.log('✅ Login ADMIN exitoso')
    const token = jwt.sign(
      { rol: 'admin', nombre: nombre || 'Administrador' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )
    return res.json({ token, rol: 'admin', nombre: nombre || 'Administrador' })
  }

  // --- Login coordinador ---
  if (clave !== process.env.CLAVE_COORDINADORES) {
    console.log('❌ Clave incorrecta')
    return res.status(401).json({ error: 'Clave incorrecta' })
  }

  if (!coordinador_id) {
    console.log('❌ No seleccionó coordinador')
    return res.status(400).json({ error: 'Selecciona tu coordinador' })
  }

  if (!dependencia_id) {
    console.log('❌ No seleccionó dependencia')
    return res.status(400).json({ error: 'Selecciona tu dependencia' })
  }

  // Obtener datos del coordinador
  const { data: coord, error: coordError } = await supabase
    .from('coordinadores')
    .select('id, nombre, dependencia_id')
    .eq('id', coordinador_id)
    .eq('dependencia_id', dependencia_id)
    .eq('activo', true)
    .single()

  if (coordError || !coord) {
    console.log('❌ Coordinador no encontrado:', coordError)
    return res.status(400).json({ error: 'Coordinador no encontrado' })
  }

  console.log('✅ Coordinador validado:', coord.nombre)

  const token = jwt.sign(
    {
      rol: 'coordinador',
      nombre: coord.nombre,
      coordinador_id: coord.id,
      dependencia_id
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  return res.json({
    token,
    rol: 'coordinador',
    nombre: coord.nombre,
    coordinador_id: coord.id,
    dependencia_id
  })
})

// GET /api/auth/estado-formulario
// Cualquiera puede consultar si el formulario está abierto o cerrado
router.get('/estado-formulario', async (req, res) => {
  const { data, error } = await supabase
    .from('formulario_estado')
    .select('cerrado, cerrado_en, cerrado_por, abierto_en')
    .eq('id', 'global')
    .single()

  if (error) return res.status(500).json({ error: 'Error consultando estado' })
  return res.json(data)
})

export default router
