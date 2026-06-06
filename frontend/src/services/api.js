const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function token() {
  try {
    const u = JSON.parse(localStorage.getItem('dotacion_usuario') || '{}')
    return u.token || ''
  } catch { return '' }
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.errores?.join(', ') || 'Error del servidor')
  return data
}

export const api = {
  // Auth
  login:             (body)    => req('POST', '/auth/login', body),
  estadoFormulario:  ()        => req('GET',  '/auth/estado-formulario'),

  // Datos
  dependencias:      ()        => req('GET',  '/datos/dependencias'),
  coordinadores:     (depId)   => req('GET',  `/datos/coordinadores?dependencia_id=${depId}`),
  empleados:         (depId)   => req('GET',  `/datos/empleados?dependencia_id=${depId}`),
  prendas:           ()        => req('GET',  '/datos/prendas'),

  // Dotaciones
  guardarDotacion:   (body)    => req('POST', '/dotaciones', body),
  eliminarDotacion:  (empId)   => req('DELETE', `/dotaciones/${empId}`),

  // Admin
  reporte:           (params)  => req('GET',  `/admin/reporte?${new URLSearchParams(params || {})}`),
  resumen:           ()        => req('GET',  '/admin/resumen'),
  exportar:          async ()  => {
    const res = await fetch(`${BASE}/admin/exportar`, {
      headers: { 'Authorization': `Bearer ${token()}` }
    })
    if (!res.ok) throw new Error('Error al exportar')
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `dotaciones_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  },
  cerrarFormulario:       () => req('PATCH', '/admin/formulario/cerrar'),
  abrirFormulario:        () => req('PATCH', '/admin/formulario/abrir'),
  eliminarDotacionAdmin:  (empId) => req('DELETE', `/admin/dotacion/${empId}`),
  restablecerFormulario:  ()     => req('DELETE', '/admin/restablecer'),

  // Gestión administrativa (CRUD)
  gestion: {
    // Empleados
    empleados:        (params) => req('GET',  `/gestion/empleados?${new URLSearchParams(params || {})}`),
    crearEmpleado:    (body)   => req('POST', '/gestion/empleados', body),
    moverEmpleado:    (id, dependencia_id) => req('PATCH', `/gestion/empleados/${id}/dependencia`, { dependencia_id }),
    eliminarEmpleado: (id)     => req('DELETE', `/gestion/empleados/${id}`),

    // Dependencias
    dependencias:        ()    => req('GET',  '/gestion/dependencias'),
    fusionarDependencia: (id, dependencia_destino_id) => req('PATCH', `/gestion/dependencias/${id}/fusionar`, { dependencia_destino_id }),
    eliminarDependencia: (id)  => req('DELETE', `/gestion/dependencias/${id}`),

    // Coordinadores
    coordinadores:       ()    => req('GET',  '/gestion/coordinadores'),
    crearCoordinador:    (body) => req('POST', '/gestion/coordinadores', body),
    moverCoordinador:    (id, dependencia_id) => req('PATCH', `/gestion/coordinadores/${id}/dependencia`, { dependencia_id }),
    eliminarCoordinador: (id, forzar = false) => req('DELETE', `/gestion/coordinadores/${id}`, { forzar }),
  },
}
