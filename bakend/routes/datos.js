import { Router } from 'express'
import supabase from '../config/supabase.js'
import { verificarToken } from '../middleware/auth.js'

const router = Router()

// ─────────────────────────────────────────
// DEPENDENCIAS (PÚBLICA - sin requiere token)
// ─────────────────────────────────────────

router.get('/dependencias', async (req, res) => {
  const { data, error } = await supabase
    .from('dependencias')
    .select('id, nombre, subdireccion')
    .order('nombre')

  if (error) {
    console.error('❌ GET /dependencias:', error.message)
    return res.status(500).json({ error: error.message })
  }
  return res.json(data)
})

router.get('/coordinadores', async (req, res) => {
  const { dependencia_id } = req.query

  if (!dependencia_id) {
    return res.status(400).json({ error: 'dependencia_id es requerido' })
  }

  const { data, error } = await supabase
    .from('coordinadores')
    .select('id, nombre')
    .eq('dependencia_id', dependencia_id)
    .eq('activo', true)
    .order('nombre')

  if (error) {
    console.error('❌ GET /coordinadores:', error.message)
    return res.status(500).json({ error: error.message })
  }
  return res.json(data)
})

// ─────────────────────────────────────────
// Todas las rutas siguientes requieren token
// ─────────────────────────────────────────
router.use(verificarToken)

// ─────────────────────────────────────────
// EMPLEADOS
// ─────────────────────────────────────────

router.get('/empleados', async (req, res) => {
  const { dependencia_id } = req.query

  const depId = req.usuario.rol === 'coordinador'
    ? req.usuario.dependencia_id
    : dependencia_id

  if (!depId) {
    return res.status(400).json({ error: 'dependencia_id es requerido' })
  }

  const { data: empleados, error: empError } = await supabase
    .from('empleados')
    .select('id, nombre, cargo, tipo_cargo, dependencia_id')
    .eq('dependencia_id', depId)
    .eq('activo', true)
    .order('nombre')

  if (empError) {
    console.error('❌ GET /empleados:', empError.message)
    return res.status(500).json({ error: empError.message })
  }

  if (!empleados || empleados.length === 0) {
    return res.json([])
  }

  const empIds = empleados.map(e => e.id)
  const { data: dotaciones, error: dotError } = await supabase
    .from('dotaciones')
    .select(`
      id,
      empleado_id,
      tipo_prenda_id,
      talla_camisa,
      talla_saco,
      talla_pantalon,
      talla_general,
      incluye_bono_calzado,
      actualizado_en,
      tipos_prenda (codigo, nombre, es_elegante, es_aseo, requiere_talla)
    `)
    .in('empleado_id', empIds)

  if (dotError) {
    console.error('❌ GET /empleados dotaciones:', dotError.message)
    return res.status(500).json({ error: dotError.message })
  }

  const data = empleados.map(emp => ({
    ...emp,
    dotaciones: (dotaciones || []).filter(d => d.empleado_id === emp.id)
  }))

  return res.json(data)
})

// ─────────────────────────────────────────
// TIPOS DE PRENDA
// ─────────────────────────────────────────

router.get('/prendas', async (req, res) => {
  const { data, error } = await supabase
    .from('tipos_prenda')
    .select('id, codigo, nombre, requiere_talla, es_elegante, es_aseo, incluye_bono_calzado')
    .order('codigo')

  if (error) {
    console.error('❌ GET /prendas:', error.message)
    return res.status(500).json({ error: error.message })
  }
  return res.json(data)
})

export default router
