import { Router } from 'express'
import supabase from '../config/supabase.js'
import { verificarToken, soloAdmin } from '../middleware/auth.js'

const router = Router()

// Todas las rutas de gestión requieren token + rol admin
router.use(verificarToken, soloAdmin)

const TIPOS_CARGO = ['aseo', 'operativo', 'profesional', 'administrativo']

// Log uniforme de operaciones destructivas (timestamp + quién + qué)
function logDestructivo(req, accion, detalle) {
  console.log(
    `🗂️  [GESTIÓN] ${new Date().toISOString()} · admin="${req.usuario?.nombre || '?'}" · ${accion} · ${detalle}`
  )
}

// Comprueba que una dependencia exista; devuelve la fila o null
async function obtenerDependencia(id) {
  const { data } = await supabase
    .from('dependencias')
    .select('id, nombre, subdireccion')
    .eq('id', id)
    .single()
  return data || null
}

// ═══════════════════════════════════════════════════════════
// EMPLEADOS
// ═══════════════════════════════════════════════════════════

// GET /api/gestion/empleados?busqueda=&dependencia_id=&tipo_cargo=
// Lista empleados con su dependencia y si ya tienen dotación registrada
router.get('/empleados', async (req, res) => {
  try {
    const { busqueda, dependencia_id, tipo_cargo } = req.query

    let query = supabase
      .from('empleados')
      .select('id, nombre, cargo, tipo_cargo, dependencia_id, dependencias ( nombre, subdireccion )')
      .order('nombre')

    if (dependencia_id) query = query.eq('dependencia_id', dependencia_id)
    if (tipo_cargo)     query = query.eq('tipo_cargo', tipo_cargo)
    if (busqueda)       query = query.ilike('nombre', `%${busqueda}%`)

    const { data: empleados, error } = await query
    if (error) throw error

    // Marcar cuáles tienen dotación (para advertencias en el frontend)
    let conDotacion = new Set()
    if (empleados.length > 0) {
      const ids = empleados.map(e => e.id)
      const { data: dots } = await supabase
        .from('dotaciones')
        .select('empleado_id')
        .in('empleado_id', ids)
      conDotacion = new Set((dots || []).map(d => d.empleado_id))
    }

    const data = empleados.map(e => ({
      id: e.id,
      nombre: e.nombre,
      cargo: e.cargo,
      tipo_cargo: e.tipo_cargo,
      dependencia_id: e.dependencia_id,
      dependencia: e.dependencias?.nombre || '—',
      subdireccion: e.dependencias?.subdireccion || '—',
      tiene_dotacion: conDotacion.has(e.id),
    }))

    return res.json(data)
  } catch (err) {
    console.error('❌ GET /gestion/empleados:', err.message)
    return res.status(500).json({ error: 'No se pudieron cargar los empleados' })
  }
})

// POST /api/gestion/empleados
// Crea un empleado nuevo
router.post('/empleados', async (req, res) => {
  try {
    const nombre        = (req.body.nombre || '').trim()
    const cargo         = (req.body.cargo || '').trim()
    const tipo_cargo    = (req.body.tipo_cargo || '').trim()
    const dependencia_id = req.body.dependencia_id

    if (!nombre)         return res.status(400).json({ error: 'El nombre es requerido' })
    if (!cargo)          return res.status(400).json({ error: 'El cargo es requerido' })
    if (!tipo_cargo)     return res.status(400).json({ error: 'El tipo de cargo es requerido' })
    if (!dependencia_id) return res.status(400).json({ error: 'La dependencia es requerida' })
    if (!TIPOS_CARGO.includes(tipo_cargo)) {
      return res.status(400).json({ error: `Tipo de cargo inválido. Use: ${TIPOS_CARGO.join(', ')}` })
    }

    const dep = await obtenerDependencia(dependencia_id)
    if (!dep) return res.status(400).json({ error: 'La dependencia seleccionada no existe' })

    const { data, error } = await supabase
      .from('empleados')
      .insert({ nombre, cargo, tipo_cargo, dependencia_id, activo: true })
      .select('id, nombre, cargo, tipo_cargo, dependencia_id')
      .single()

    if (error) throw error

    return res.json({ mensaje: 'Empleado creado correctamente', empleado: data })
  } catch (err) {
    console.error('❌ POST /gestion/empleados:', err.message)
    return res.status(500).json({ error: 'No se pudo crear el empleado' })
  }
})

// PATCH /api/gestion/empleados/:id/dependencia
// Mueve un empleado a otra dependencia
router.patch('/empleados/:id/dependencia', async (req, res) => {
  try {
    const { id } = req.params
    const { dependencia_id } = req.body

    if (!dependencia_id) return res.status(400).json({ error: 'La dependencia destino es requerida' })

    const dep = await obtenerDependencia(dependencia_id)
    if (!dep) return res.status(400).json({ error: 'La dependencia destino no existe' })

    const { data, error } = await supabase
      .from('empleados')
      .update({ dependencia_id })
      .eq('id', id)
      .select('id, nombre, cargo, tipo_cargo, dependencia_id')
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Empleado no encontrado' })

    logDestructivo(req, 'MOVER_EMPLEADO', `empleado="${data.nombre}" → dependencia="${dep.nombre}"`)
    return res.json({
      mensaje: `Empleado movido a ${dep.nombre}`,
      empleado: { ...data, dependencia: dep.nombre },
    })
  } catch (err) {
    console.error('❌ PATCH /gestion/empleados/:id/dependencia:', err.message)
    return res.status(500).json({ error: 'No se pudo mover el empleado' })
  }
})

// DELETE /api/gestion/empleados/:id
// Elimina un empleado. Si tiene dotación, la elimina primero (cascada manual)
router.delete('/empleados/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: emp } = await supabase
      .from('empleados')
      .select('id, nombre')
      .eq('id', id)
      .single()

    if (!emp) return res.status(404).json({ error: 'Empleado no encontrado' })

    // ¿Tiene dotación registrada?
    const { data: dot } = await supabase
      .from('dotaciones')
      .select('id')
      .eq('empleado_id', id)
      .maybeSingle()

    let eliminoDotacion = false
    if (dot) {
      const { error: delDotError } = await supabase
        .from('dotaciones')
        .delete()
        .eq('empleado_id', id)
      if (delDotError) throw delDotError
      eliminoDotacion = true
    }

    const { error } = await supabase
      .from('empleados')
      .delete()
      .eq('id', id)

    if (error) throw error

    logDestructivo(
      req,
      'ELIMINAR_EMPLEADO',
      `empleado="${emp.nombre}" · dotacion_eliminada=${eliminoDotacion}`
    )

    return res.json({
      mensaje: eliminoDotacion
        ? 'Empleado y su dotación eliminados correctamente'
        : 'Empleado eliminado correctamente',
      elimino_dotacion: eliminoDotacion,
    })
  } catch (err) {
    console.error('❌ DELETE /gestion/empleados/:id:', err.message)
    return res.status(500).json({ error: 'No se pudo eliminar el empleado' })
  }
})

// ═══════════════════════════════════════════════════════════
// DEPENDENCIAS
// ═══════════════════════════════════════════════════════════

// GET /api/gestion/dependencias
// Lista todas con conteo de empleados y coordinadores
router.get('/dependencias', async (req, res) => {
  try {
    const [{ data: deps, error: depError }, { data: emps }, { data: coords }] = await Promise.all([
      supabase.from('dependencias').select('id, nombre, subdireccion').order('nombre'),
      supabase.from('empleados').select('dependencia_id'),
      supabase.from('coordinadores').select('dependencia_id'),
    ])

    if (depError) throw depError

    const contar = (rows, depId) => (rows || []).filter(r => r.dependencia_id === depId).length

    const data = (deps || []).map(d => ({
      id: d.id,
      nombre: d.nombre,
      subdireccion: d.subdireccion,
      total_empleados: contar(emps, d.id),
      total_coordinadores: contar(coords, d.id),
    }))

    return res.json(data)
  } catch (err) {
    console.error('❌ GET /gestion/dependencias:', err.message)
    return res.status(500).json({ error: 'No se pudieron cargar las dependencias' })
  }
})

// PATCH /api/gestion/dependencias/:id/fusionar
// Mueve todos los empleados y coordinadores de :id a la dependencia destino y elimina :id
// Nota: el cliente de Supabase no soporta transacciones multi-tabla; las operaciones
// se ejecutan en orden seguro (primero mover, luego eliminar el origen).
router.patch('/dependencias/:id/fusionar', async (req, res) => {
  try {
    const { id } = req.params
    const { dependencia_destino_id } = req.body

    if (!dependencia_destino_id) {
      return res.status(400).json({ error: 'La dependencia destino es requerida' })
    }
    if (String(id) === String(dependencia_destino_id)) {
      return res.status(400).json({ error: 'El origen y el destino deben ser diferentes' })
    }

    const origen  = await obtenerDependencia(id)
    if (!origen)  return res.status(404).json({ error: 'La dependencia origen no existe' })
    const destino = await obtenerDependencia(dependencia_destino_id)
    if (!destino) return res.status(400).json({ error: 'La dependencia destino no existe' })

    // 1) Mover empleados
    const { data: empsMovidos, error: empError } = await supabase
      .from('empleados')
      .update({ dependencia_id: dependencia_destino_id })
      .eq('dependencia_id', id)
      .select('id')
    if (empError) throw empError

    // 2) Mover coordinadores
    const { data: coordsMovidos, error: coordError } = await supabase
      .from('coordinadores')
      .update({ dependencia_id: dependencia_destino_id })
      .eq('dependencia_id', id)
      .select('id')
    if (coordError) throw coordError

    // 3) Eliminar la dependencia origen (ya vacía)
    const { error: delError } = await supabase
      .from('dependencias')
      .delete()
      .eq('id', id)
    if (delError) throw delError

    const nEmp = empsMovidos?.length || 0
    const nCoord = coordsMovidos?.length || 0

    logDestructivo(
      req,
      'FUSIONAR_DEPENDENCIA',
      `origen="${origen.nombre}" → destino="${destino.nombre}" · empleados=${nEmp} · coordinadores=${nCoord}`
    )

    return res.json({
      mensaje: `Dependencia "${origen.nombre}" fusionada en "${destino.nombre}"`,
      empleados_migrados: nEmp,
      coordinadores_migrados: nCoord,
    })
  } catch (err) {
    console.error('❌ PATCH /gestion/dependencias/:id/fusionar:', err.message)
    return res.status(500).json({ error: 'No se pudo fusionar la dependencia' })
  }
})

// DELETE /api/gestion/dependencias/:id
// Solo elimina si no tiene empleados NI coordinadores
router.delete('/dependencias/:id', async (req, res) => {
  try {
    const { id } = req.params

    const dep = await obtenerDependencia(id)
    if (!dep) return res.status(404).json({ error: 'Dependencia no encontrada' })

    const [{ count: nEmp }, { count: nCoord }] = await Promise.all([
      supabase.from('empleados').select('id', { count: 'exact', head: true }).eq('dependencia_id', id),
      supabase.from('coordinadores').select('id', { count: 'exact', head: true }).eq('dependencia_id', id),
    ])

    if ((nEmp || 0) > 0 || (nCoord || 0) > 0) {
      return res.status(409).json({
        error: `No se puede eliminar: la dependencia tiene ${nEmp || 0} empleado(s) y ${nCoord || 0} coordinador(es). Muévelos o fusiona la dependencia primero.`,
        total_empleados: nEmp || 0,
        total_coordinadores: nCoord || 0,
      })
    }

    const { error } = await supabase.from('dependencias').delete().eq('id', id)
    if (error) throw error

    logDestructivo(req, 'ELIMINAR_DEPENDENCIA', `dependencia="${dep.nombre}"`)
    return res.json({ mensaje: `Dependencia "${dep.nombre}" eliminada correctamente` })
  } catch (err) {
    console.error('❌ DELETE /gestion/dependencias/:id:', err.message)
    return res.status(500).json({ error: 'No se pudo eliminar la dependencia' })
  }
})

// ═══════════════════════════════════════════════════════════
// COORDINADORES
// ═══════════════════════════════════════════════════════════

// GET /api/gestion/coordinadores
// Lista todos los coordinadores con su dependencia
router.get('/coordinadores', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coordinadores')
      .select('id, nombre, activo, dependencia_id, dependencias ( nombre )')
      .order('nombre')

    if (error) throw error

    const lista = (data || []).map(c => ({
      id: c.id,
      nombre: c.nombre,
      activo: c.activo,
      dependencia_id: c.dependencia_id,
      dependencia: c.dependencias?.nombre || '—',
    }))

    return res.json(lista)
  } catch (err) {
    console.error('❌ GET /gestion/coordinadores:', err.message)
    return res.status(500).json({ error: 'No se pudieron cargar los coordinadores' })
  }
})

// POST /api/gestion/coordinadores
// Crea un coordinador. NOTA: el login usa una clave compartida (CLAVE_COORDINADORES),
// no claves individuales; por eso aquí no se genera ni almacena contraseña.
router.post('/coordinadores', async (req, res) => {
  try {
    const nombre = (req.body.nombre || '').trim()
    const dependencia_id = req.body.dependencia_id

    if (!nombre)         return res.status(400).json({ error: 'El nombre es requerido' })
    if (!dependencia_id) return res.status(400).json({ error: 'La dependencia es requerida' })

    const dep = await obtenerDependencia(dependencia_id)
    if (!dep) return res.status(400).json({ error: 'La dependencia seleccionada no existe' })

    const { data, error } = await supabase
      .from('coordinadores')
      .insert({ nombre, dependencia_id, activo: true })
      .select('id, nombre, dependencia_id')
      .single()

    if (error) throw error

    return res.json({
      mensaje: 'Coordinador creado correctamente. Inicia sesión con la clave general de coordinadores.',
      coordinador: { ...data, dependencia: dep.nombre },
    })
  } catch (err) {
    console.error('❌ POST /gestion/coordinadores:', err.message)
    return res.status(500).json({ error: 'No se pudo crear el coordinador' })
  }
})

// PATCH /api/gestion/coordinadores/:id/dependencia
// Mueve un coordinador a otra dependencia
router.patch('/coordinadores/:id/dependencia', async (req, res) => {
  try {
    const { id } = req.params
    const { dependencia_id } = req.body

    if (!dependencia_id) return res.status(400).json({ error: 'La dependencia destino es requerida' })

    const dep = await obtenerDependencia(dependencia_id)
    if (!dep) return res.status(400).json({ error: 'La dependencia destino no existe' })

    const { data, error } = await supabase
      .from('coordinadores')
      .update({ dependencia_id })
      .eq('id', id)
      .select('id, nombre, dependencia_id')
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Coordinador no encontrado' })

    logDestructivo(req, 'MOVER_COORDINADOR', `coordinador="${data.nombre}" → dependencia="${dep.nombre}"`)
    return res.json({
      mensaje: `Coordinador movido a ${dep.nombre}`,
      coordinador: { ...data, dependencia: dep.nombre },
    })
  } catch (err) {
    console.error('❌ PATCH /gestion/coordinadores/:id/dependencia:', err.message)
    return res.status(500).json({ error: 'No se pudo mover el coordinador' })
  }
})

// DELETE /api/gestion/coordinadores/:id
// Body opcional: { forzar: true }
// - Bloquea si el coordinador tiene dotaciones registradas a su nombre (integridad)
// - Advierte si es el único coordinador de su dependencia (requiere forzar)
router.delete('/coordinadores/:id', async (req, res) => {
  try {
    const { id } = req.params
    const forzar = req.body?.forzar === true

    const { data: coord } = await supabase
      .from('coordinadores')
      .select('id, nombre, dependencia_id')
      .eq('id', id)
      .single()

    if (!coord) return res.status(404).json({ error: 'Coordinador no encontrado' })

    // Integridad: si registró dotaciones, no se puede borrar (rompería el reporte)
    const { count: nDot } = await supabase
      .from('dotaciones')
      .select('id', { count: 'exact', head: true })
      .eq('coordinador_id', id)

    if ((nDot || 0) > 0) {
      return res.status(409).json({
        error: `No se puede eliminar: este coordinador tiene ${nDot} dotación(es) registrada(s) a su nombre. Reasigna o elimina esos registros primero.`,
      })
    }

    // ¿Es el único coordinador de su dependencia?
    const { count: nCoord } = await supabase
      .from('coordinadores')
      .select('id', { count: 'exact', head: true })
      .eq('dependencia_id', coord.dependencia_id)

    const esUnico = (nCoord || 0) <= 1
    if (esUnico && !forzar) {
      return res.status(409).json({
        error: 'Este es el único coordinador de su dependencia. Confirma para eliminarlo de todos modos.',
        requiere_confirmacion: true,
        es_unico: true,
      })
    }

    const { error } = await supabase.from('coordinadores').delete().eq('id', id)
    if (error) throw error

    logDestructivo(
      req,
      'ELIMINAR_COORDINADOR',
      `coordinador="${coord.nombre}" · era_unico=${esUnico} · forzado=${forzar}`
    )
    return res.json({ mensaje: `Coordinador "${coord.nombre}" eliminado correctamente` })
  } catch (err) {
    console.error('❌ DELETE /gestion/coordinadores/:id:', err.message)
    return res.status(500).json({ error: 'No se pudo eliminar el coordinador' })
  }
})

export default router
