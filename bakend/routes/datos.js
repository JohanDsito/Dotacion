import { Router } from 'express'
import supabase from '../config/supabase.js'
import { verificarToken } from '../middleware/auth.js'

const router = Router()

// ─────────────────────────────────────────
// DEPENDENCIAS (PÚBLICA - sin requiere token)
// ─────────────────────────────────────────

// GET /api/datos/dependencias
// Lista todas las dependencias (para el dropdown de login y filtros)
// ⚠️ Ruta pública: se necesita para el login
router.get('/dependencias', async (req, res) => {
  console.log('📡 Llamada a GET /dependencias')
  
  const { data, error } = await supabase
    .from('dependencias')
    .select('id, nombre, subdireccion')
    .order('nombre')

  console.log('Respuesta Supabase:', { data, error })
  
  if (error) {
    console.error('❌ Error Supabase:', error)
    return res.status(500).json({ error: error.message })
  }
  
  console.log(`✅ Se encontraron ${data?.length || 0} dependencias`)
  return res.json(data)
})

// GET /api/datos/coordinadores?dependencia_id=xxx
// Lista coordinadores de una dependencia específica (para login)
// ⚠️ Ruta pública: se necesita para el login
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

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

// ─────────────────────────────────────────
// Todas las rutas siguientes requieren token
// ─────────────────────────────────────────
router.use(verificarToken)

// ─────────────────────────────────────────
// EMPLEADOS
// ─────────────────────────────────────────

// GET /api/datos/empleados?dependencia_id=xxx
// Lista empleados de una dependencia específica
// El coordinador solo ve los de su dependencia
router.get('/empleados', async (req, res) => {
  const { dependencia_id } = req.query

  // Si es coordinador, solo puede ver su propia dependencia
  const depId = req.usuario.rol === 'coordinador'
    ? req.usuario.dependencia_id
    : dependencia_id

  if (!depId) {
    return res.status(400).json({ error: 'dependencia_id es requerido' })
  }

  const { data, error } = await supabase
    .from('empleados')
    .select(`
      id,
      nombre,
      cargo,
      tipo_cargo,
      dependencia_id,
      dotaciones (
        id,
        tipo_prenda_id,
        talla_camisa,
        talla_saco,
        talla_pantalon,
        talla_general,
        incluye_bono_calzado,
        actualizado_en,
        tipos_prenda (codigo, nombre, es_elegante, es_aseo, requiere_talla)
      )
    `)
    .eq('dependencia_id', depId)
    .eq('activo', true)
    .order('nombre')

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

// ─────────────────────────────────────────
// TIPOS DE PRENDA
// ─────────────────────────────────────────

// GET /api/datos/prendas
// Lista todas las prendas disponibles
router.get('/prendas', async (req, res) => {
  const { data, error } = await supabase
    .from('tipos_prenda')
    .select('id, codigo, nombre, requiere_talla, es_elegante, es_aseo, incluye_bono_calzado')
    .order('codigo')

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

export default router
