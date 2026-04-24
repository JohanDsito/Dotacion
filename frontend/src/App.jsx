import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Formulario from './pages/Formulario.jsx'
import Dashboard from './pages/Dashboard.jsx'

function RutaProtegida({ children, soloAdmin }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (soloAdmin && usuario.rol !== 'admin') return <Navigate to="/formulario" replace />
  return children
}

function AppRoutes() {
  const { usuario } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={
        usuario ? <Navigate to={usuario.rol === 'admin' ? '/dashboard' : '/formulario'} replace /> : <Login />
      } />
      <Route path="/formulario" element={
        <RutaProtegida><Formulario /></RutaProtegida>
      } />
      <Route path="/dashboard" element={
        <RutaProtegida soloAdmin><Dashboard /></RutaProtegida>
      } />
      <Route path="*" element={
        <Navigate to={usuario ? (usuario.rol === 'admin' ? '/dashboard' : '/formulario') : '/login'} replace />
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
