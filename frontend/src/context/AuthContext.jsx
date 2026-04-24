import { createContext, useContext, useState, useEffect } from 'react'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem('dotacion_usuario')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  const login = (data) => {
    localStorage.setItem('dotacion_usuario', JSON.stringify(data))
    setUsuario(data)
  }

  const logout = () => {
    localStorage.removeItem('dotacion_usuario')
    setUsuario(null)
  }

  return (
    <AuthCtx.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
