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
  cerrarFormulario:  () => req('PATCH', '/admin/formulario/cerrar'),
  abrirFormulario:   () => req('PATCH', '/admin/formulario/abrir'),
}
