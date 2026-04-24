import jwt from 'jsonwebtoken'
import 'dotenv/config'

// Verifica que el request tiene un token JWT válido
export function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = payload // { rol: 'coordinador'|'admin', nombre, dependencia_id }
    next()
  } catch {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }
}

// Solo permite pasar al administrador
export function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo el administrador puede hacer esto' })
  }
  next()
}

// Verifica que el formulario esté abierto (para coordinadores)
export async function formularioAbierto(req, res, next) {
  // El admin siempre puede, sin importar el estado
  if (req.usuario?.rol === 'admin') return next()

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = (await import('../config/supabase.js')).default

    const { data, error } = await supabase
      .from('formulario_estado')
      .select('cerrado')
      .eq('id', 'global')
      .single()

    if (error) throw error

    if (data.cerrado) {
      return res.status(423).json({
        error: 'El formulario está cerrado. El administrador ha deshabilitado nuevos registros.'
      })
    }
    next()
  } catch (err) {
    return res.status(500).json({ error: 'Error verificando estado del formulario' })
  }
}
