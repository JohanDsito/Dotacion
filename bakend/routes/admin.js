import { Router } from 'express'
import * as XLSX from 'xlsx'
import supabase from '../config/supabase.js'
import { verificarToken, soloAdmin } from '../middleware/auth.js'

const router = Router()

// Todas las rutas de admin requieren token + rol admin
router.use(verificarToken, soloAdmin)

// ─────────────────────────────────────────
// REPORTE
// ─────────────────────────────────────────

// GET /api/admin/reporte?dependencia_id=xxx&tipo_cargo=xxx
// Devuelve todos los registros con filtros opcionales
router.get('/reporte', async (req, res) => {
  const { dependencia_id, tipo_cargo } = req.query

  let query = supabase
    .from('reporte_completo')
    .select('*')

  if (dependencia_id) query = query.eq('dependencia', dependencia_id)
  if (tipo_cargo)     query = query.eq('cargo', tipo_cargo)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

// Empleados activos que aún no tienen dotación registrada.
// Se usa tanto para el conteo del resumen como para el listado,
// así la tarjeta "Pendientes" y la lista siempre coinciden.
async function obtenerPendientes() {
  const [empleados, dotaciones] = await Promise.all([
    supabase
      .from('empleados')
      .select('id, nombre, cargo, tipo_cargo, dependencia_id, dependencias ( nombre, subdireccion )')
      .eq('activo', true)
      .order('nombre'),
    supabase.from('dotaciones').select('empleado_id')
  ])

  if (empleados.error)  throw empleados.error
  if (dotaciones.error) throw dotaciones.error

  const conDotacion = new Set((dotaciones.data || []).map(d => d.empleado_id))
  return (empleados.data || []).filter(e => !conDotacion.has(e.id))
}

// GET /api/admin/resumen
// Conteos rápidos para el dashboard
router.get('/resumen', async (req, res) => {
  try {
    const [dotaciones, empleados, formulario, pendientes] = await Promise.all([
      supabase.from('dotaciones').select('id', { count: 'exact', head: true }),
      supabase.from('empleados').select('id', { count: 'exact', head: true }).eq('activo', true),
      supabase.from('formulario_estado').select('cerrado').eq('id', 'global').single(),
      obtenerPendientes()
    ])

    return res.json({
      total_dotaciones:  dotaciones.count  ?? 0,
      total_empleados:   empleados.count   ?? 0,
      pendientes:        pendientes.length,
      formulario_cerrado: formulario.data?.cerrado ?? false
    })
  } catch (err) {
    console.error('❌ GET /admin/resumen:', err.message)
    return res.status(500).json({ error: 'No se pudo cargar el resumen' })
  }
})

// GET /api/admin/pendientes
// Lista de empleados activos sin dotación, con los responsables de su dependencia
router.get('/pendientes', async (req, res) => {
  try {
    const pendientes = await obtenerPendientes()

    const depIds = [...new Set(pendientes.map(e => e.dependencia_id))]
    let responsablesPorDep = {}
    if (depIds.length > 0) {
      const { data: coords, error } = await supabase
        .from('coordinadores')
        .select('nombre, dependencia_id')
        .in('dependencia_id', depIds)
        .eq('activo', true)
        .order('nombre')
      if (error) throw error
      for (const c of coords || []) {
        (responsablesPorDep[c.dependencia_id] ||= []).push(c.nombre)
      }
    }

    const data = pendientes.map(e => ({
      id: e.id,
      nombre: e.nombre,
      cargo: e.cargo,
      tipo_cargo: e.tipo_cargo,
      dependencia_id: e.dependencia_id,
      dependencia: e.dependencias?.nombre || '—',
      subdireccion: e.dependencias?.subdireccion || '—',
      responsables: responsablesPorDep[e.dependencia_id] || [],
    }))

    return res.json(data)
  } catch (err) {
    console.error('❌ GET /admin/pendientes:', err.message)
    return res.status(500).json({ error: 'No se pudieron cargar los pendientes' })
  }
})

// ─────────────────────────────────────────
// EXPORTAR A EXCEL
// ─────────────────────────────────────────

// GET /api/admin/exportar
// Genera y descarga el Excel con todos los registros
router.get('/exportar', async (req, res) => {
  const { data, error } = await supabase
    .from('reporte_completo')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'No hay registros para exportar' })
  }

  // Mapear columnas a nombres legibles en español
  const filas = data.map(r => ({
    'Empleado':           r.empleado,
    'Cargo':              r.cargo,
    'Dependencia':        r.dependencia,
    'Subdirección':       r.subdireccion,
    'Cód. Prenda':        r.codigo_prenda,
    'Tipo de Prenda':     r.tipo_prenda,
    'Talla Camisa':       r.talla_camisa   || '—',
    'Talla Saco':         r.talla_saco     || '—',
    'Talla Pantalón':     r.talla_pantalon || '—',
    'Talla General':      r.talla_general  || '—',
    'Sin Talla':          r.sin_talla      || '—',
    'Bono Calzado':       r.bono_calzado   ? 'Sí' : 'No',
    'Coordinador':        r.coordinador,
    'Fecha Registro':     r.fecha_registro
      ? new Date(r.fecha_registro).toLocaleDateString('es-CO')
      : '',
    'Última Edición':     r.fecha_actualizacion
      ? new Date(r.fecha_actualizacion).toLocaleDateString('es-CO')
      : ''
  }))

  const workbook  = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(filas)

  // Ancho de columnas automático
  const colWidths = Object.keys(filas[0]).map(key => ({
    wch: Math.max(key.length, ...filas.map(r => String(r[key] || '').length)) + 2
  }))
  worksheet['!cols'] = colWidths

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dotaciones')

  // Segunda hoja: resumen por dependencia
  const porDependencia = {}
  data.forEach(r => {
    if (!porDependencia[r.dependencia]) porDependencia[r.dependencia] = 0
    porDependencia[r.dependencia]++
  })
  const resumenFilas = Object.entries(porDependencia).map(([dep, total]) => ({
    'Dependencia': dep,
    'Total Registros': total
  }))
  const wsResumen = XLSX.utils.json_to_sheet(resumenFilas)
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  const fecha = new Date().toISOString().split('T')[0]
  res.setHeader('Content-Disposition', `attachment; filename="dotaciones_${fecha}.xlsx"`)
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  return res.send(buffer)
})

// ─────────────────────────────────────────
// RESTABLECER — borra todas las dotaciones para nuevo período
// ─────────────────────────────────────────

// DELETE /api/admin/restablecer
router.delete('/restablecer', async (req, res) => {
  // Eliminar todas las dotaciones
  const { error: delError } = await supabase
    .from('dotaciones')
    .delete()
    .not('id', 'is', null)

  if (delError) {
    console.error('❌ Error al restablecer:', delError.message)
    return res.status(500).json({ error: delError.message })
  }

  // Cerrar el formulario automáticamente tras el restablecimiento
  await supabase
    .from('formulario_estado')
    .update({
      cerrado:     true,
      cerrado_en:  new Date().toISOString(),
      cerrado_por: req.usuario.nombre
    })
    .eq('id', 'global')

  return res.json({ mensaje: 'Formulario restablecido. Todos los registros han sido eliminados.' })
})

// ─────────────────────────────────────────
// ELIMINAR DOTACIÓN (admin override — sin requerir formulario abierto)
// ─────────────────────────────────────────

// DELETE /api/admin/dotacion/:empleado_id
router.delete('/dotacion/:empleado_id', async (req, res) => {
  const { empleado_id } = req.params

  const { error } = await supabase
    .from('dotaciones')
    .delete()
    .eq('empleado_id', empleado_id)

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ mensaje: 'Dotación eliminada' })
})

// ─────────────────────────────────────────
// CONTROL DEL FORMULARIO
// ─────────────────────────────────────────

// PATCH /api/admin/formulario/cerrar
router.patch('/formulario/cerrar', async (req, res) => {
  const { data, error } = await supabase
    .from('formulario_estado')
    .update({
      cerrado:    true,
      cerrado_en: new Date().toISOString(),
      cerrado_por: req.usuario.nombre
    })
    .eq('id', 'global')
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ mensaje: 'Formulario cerrado correctamente', estado: data })
})

// PATCH /api/admin/formulario/abrir
router.patch('/formulario/abrir', async (req, res) => {
  const { data, error } = await supabase
    .from('formulario_estado')
    .update({
      cerrado:    false,
      cerrado_en: null,
      cerrado_por: null,
      abierto_en:  new Date().toISOString(),
      abierto_por: req.usuario.nombre
    })
    .eq('id', 'global')
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ mensaje: 'Formulario abierto correctamente', estado: data })
})

export default router
