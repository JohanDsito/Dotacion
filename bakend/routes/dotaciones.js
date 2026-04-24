import { Router } from 'express'
import supabase from '../config/supabase.js'
import { verificarToken, formularioAbierto } from '../middleware/auth.js'

const router = Router()

const TALLAS_VALIDAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

// Valida el body según el tipo de prenda
function validarDotacion(body, prenda) {
  const errores = []

  if (!body.empleado_id)    errores.push('empleado_id es requerido')
  if (!body.tipo_prenda_id) errores.push('tipo_prenda_id es requerido')

  if (prenda.es_elegante) {
    if (!TALLAS_VALIDAS.includes(body.talla_camisa))   errores.push('talla_camisa inválida')
    if (!TALLAS_VALIDAS.includes(body.talla_saco))     errores.push('talla_saco inválida')
    if (!TALLAS_VALIDAS.includes(body.talla_pantalon)) errores.push('talla_pantalon inválida')
  } else if (prenda.requiere_talla) {
    if (!TALLAS_VALIDAS.includes(body.talla_general))  errores.push('talla_general inválida')
  }
  // Si es aseo (no requiere talla), no se valida ninguna talla

  return errores
}

// ─────────────────────────────────────────
// GUARDAR O EDITAR DOTACIÓN
// ─────────────────────────────────────────

// POST /api/dotaciones
// Crea o actualiza la dotación de un empleado
// Si ya existe → actualiza (el coordinador puede editar)
router.post('/', verificarToken, formularioAbierto, async (req, res) => {
  const {
    empleado_id,
    tipo_prenda_id,
    talla_camisa,
    talla_saco,
    talla_pantalon,
    talla_general,
    incluye_bono_calzado = false
  } = req.body

  // Obtener datos de la prenda para validar
  const { data: prenda, error: prendaError } = await supabase
    .from('tipos_prenda')
    .select('id, es_elegante, es_aseo, requiere_talla')
    .eq('id', tipo_prenda_id)
    .single()

  if (prendaError || !prenda) {
    return res.status(400).json({ error: 'Tipo de prenda no encontrado' })
  }

  const errores = validarDotacion(req.body, prenda)
  if (errores.length > 0) {
    return res.status(400).json({ errores })
  }

  // Obtener coordinador_id del token
  const coordinador_id = req.usuario.coordinador_id

  // Verificar que el empleado pertenece a la dependencia del coordinador
  if (req.usuario.rol === 'coordinador') {
    const { data: emp } = await supabase
      .from('empleados')
      .select('dependencia_id')
      .eq('id', empleado_id)
      .single()

    if (emp?.dependencia_id !== req.usuario.dependencia_id) {
      return res.status(403).json({ error: 'Este empleado no pertenece a tu dependencia' })
    }
  }

  // Preparar datos limpios (nulls donde no aplica)
  const payload = {
    empleado_id,
    coordinador_id,
    tipo_prenda_id,
    talla_camisa:   prenda.es_elegante   ? talla_camisa   : null,
    talla_saco:     prenda.es_elegante   ? talla_saco     : null,
    talla_pantalon: prenda.es_elegante   ? talla_pantalon : null,
    talla_general:  prenda.requiere_talla && !prenda.es_elegante ? talla_general : null,
    incluye_bono_calzado
  }

  // UPSERT: inserta si no existe, actualiza si ya existe (por empleado_id)
  const { data, error } = await supabase
    .from('dotaciones')
    .upsert(payload, { onConflict: 'empleado_id' })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  return res.json({ mensaje: 'Dotación guardada correctamente', dotacion: data })
})

// DELETE /api/dotaciones/:empleado_id
// Elimina la dotación de un empleado (solo si formulario abierto)
router.delete('/:empleado_id', verificarToken, formularioAbierto, async (req, res) => {
  const { empleado_id } = req.params

  const { error } = await supabase
    .from('dotaciones')
    .delete()
    .eq('empleado_id', empleado_id)

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ mensaje: 'Dotación eliminada' })
})

export default router
