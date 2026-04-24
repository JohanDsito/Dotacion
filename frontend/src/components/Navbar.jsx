import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.12)"/>
    <rect x="7" y="9" width="18" height="2.5" rx="1.25" fill="white"/>
    <rect x="7" y="14.5" width="12" height="2.5" rx="1.25" fill="rgba(255,255,255,0.7)"/>
    <rect x="7" y="20" width="15" height="2.5" rx="1.25" fill="rgba(255,255,255,0.5)"/>
    <circle cx="24" cy="22" r="5" fill="#C8973A"/>
    <path d="M22 22l1.5 1.5L26 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!usuario) return null

  return (
    <>
      <nav style={{
        background: 'var(--azul-900)',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 20px rgba(0,0,0,0.25)',
      }}>
        {/* Logo + Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LogoIcon />
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600, fontSize: '1rem',
              color: 'white', lineHeight: 1.1,
              letterSpacing: '-0.01em'
            }}>
              Dotación
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {usuario.rol === 'admin' ? 'Panel administrativo' : usuario.dependencia_nombre || 'Coordinador'}
            </div>
          </div>
        </div>

        {/* Info + Logout — desktop */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white' }}>{usuario.nombre}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
              {usuario.rol === 'admin' ? 'Administrador' : 'Coordinador'}
            </div>
          </div>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--azul-600)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 600, fontSize: '0.875rem',
            border: '2px solid rgba(255,255,255,0.15)'
          }}>
            {usuario.nombre?.charAt(0).toUpperCase()}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)' }}
            onClick={handleLogout}
          >
            Salir
          </button>
        </div>

        {/* Hamburger — móvil */}
        <button
          style={{
            display: 'none', background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px', color: 'white'
          }}
          className="menu-btn"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menú"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            ) : (
              <>
                <rect x="3" y="5" width="16" height="2" rx="1" fill="currentColor"/>
                <rect x="3" y="10" width="16" height="2" rx="1" fill="currentColor"/>
                <rect x="3" y="15" width="16" height="2" rx="1" fill="currentColor"/>
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div style={{
          background: 'var(--azul-800)', padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'none'
        }} className="mobile-menu">
          <div style={{ color: 'white', fontWeight: 500, marginBottom: '4px' }}>{usuario.nombre}</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginBottom: '16px' }}>
            {usuario.rol === 'admin' ? 'Administrador' : `Coordinador · ${usuario.dependencia_nombre}`}
          </div>
          <button className="btn btn-secondary btn-full" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .menu-btn { display: flex !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </>
  )
}
