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

// GET /api/admin/resumen
// Conteos rápidos para el dashboard
router.get('/resumen', async (req, res) => {
  const [dotaciones, empleados, formulario] = await Promise.all([
    supabase.from('dotaciones').select('id', { count: 'exact', head: true }),
    supabase.from('empleados').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('formulario_estado').select('cerrado').eq('id', 'global').single()
  ])

  return res.json({
    total_dotaciones:  dotaciones.count  ?? 0,
    total_empleados:   empleados.count   ?? 0,
    pendientes:        (empleados.count ?? 0) - (dotaciones.count ?? 0),
    formulario_cerrado: formulario.data?.cerrado ?? false
  })
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
