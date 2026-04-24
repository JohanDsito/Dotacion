import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [coordinadores, setCoordinadores] = useState([])
  const [cargandoCoord, setCargandoCoord]  = useState(false)
  const [clave,        setClave]         = useState('')
  const [dependencias, setDependencias]  = useState([])
  const [depId,        setDepId]         = useState('')
  const [coordId,      setCoordId]       = useState('')
  const [error,        setError]         = useState('')
  const [cargando,     setCargando]      = useState(false)
  const [esAdmin,      setEsAdmin]       = useState(false)

  // Cargar dependencias al montar
  useEffect(() => {
    api.dependencias()
      .then(setDependencias)
      .catch((err) => {
        console.error('❌ Error cargando dependencias:', err)
        setError('No se pudieron cargar las dependencias. ¿El servidor está corriendo?')
      })
  }, [])

  // Cargar coordinadores cuando cambia la dependencia
  useEffect(() => {
    if (!depId || esAdmin) {
      setCoordinadores([])
      setCoordId('')
      setCargandoCoord(false)
      return
    }

    setCargandoCoord(true)
    api.coordinadores(depId)
      .then(setCoordinadores)
      .catch((err) => {
        console.error('❌ Error cargando coordinadores:', err)
        setCoordinadores([])
      })
      .finally(() => setCargandoCoord(false))
  }, [depId, esAdmin])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const data = await api.login({
        coordinador_id: esAdmin ? undefined : coordId,
        clave,
        dependencia_id: esAdmin ? undefined : depId
      })
      login(data)
      navigate(data.rol === 'admin' ? '/dashboard' : '/formulario')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      background: 'var(--azul-900)',
    }}>
      {/* Panel decorativo izquierdo — solo desktop */}
      <div className="hide-mobile" style={{
        width: '42%',
        background: `linear-gradient(160deg, var(--azul-800) 0%, var(--azul-900) 100%)`,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Patrón decorativo */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            var(--azul-400) 0px, var(--azul-400) 1px,
            transparent 1px, transparent 40px
          )`,
        }}/>
        {/* Círculos decorativos */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          border: '1.5px solid rgba(200,151,58,0.15)',
        }}/>
        <div style={{
          position: 'absolute', bottom: '60px', left: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          border: '1.5px solid rgba(74,124,196,0.2)',
        }}/>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '60px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9 12h6M9 16h4" stroke="rgba(200,151,58,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>
              Sistema de Dotación
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            color: 'white', lineHeight: 1.2,
            marginBottom: '16px',
          }}>
            Gestión de<br/>
            <em style={{ fontStyle: 'italic', color: 'var(--dorado-cl)' }}>dotación</em><br/>
            del personal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '320px' }}>
            Plataforma para el registro y seguimiento de prendas asignadas a cada trabajador por dependencia.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          {[
            { icon: '✓', text: 'Registro por dependencia' },
            { icon: '✓', text: 'Tallas independientes por prenda' },
            { icon: '✓', text: 'Exportación a Excel' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '10px', color: 'rgba(255,255,255,0.55)',
              fontSize: '0.875rem',
            }}>
              <span style={{ color: 'var(--dorado)', fontWeight: 600 }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Panel del formulario */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-app)',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }} className="anim-fade-up">

          {/* Header móvil */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '56px', height: '56px', borderRadius: '14px',
              background: 'var(--azul-900)', marginBottom: '16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.5rem', color: 'var(--azul-900)', marginBottom: '4px' }}>
              Bienvenido
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Ingresa tus datos para continuar
            </p>
          </div>

          {/* Toggle coordinador / admin */}
          <div style={{
            display: 'flex', background: 'var(--gris-100)',
            borderRadius: 'var(--r-lg)', padding: '4px',
            marginBottom: '24px', gap: '4px',
          }}>
            {[
              { label: 'Coordinador', val: false },
              { label: 'Administrador', val: true },
            ].map(({ label, val }) => (
              <button
                key={label}
                type="button"
                onClick={() => { setEsAdmin(val); setError('') }}
                style={{
                  flex: 1, padding: '9px', borderRadius: 'var(--r-md)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
                  transition: 'all 0.2s var(--ease)',
                  background: esAdmin === val ? 'var(--blanco)' : 'transparent',
                  color: esAdmin === val ? 'var(--azul-800)' : 'var(--gris-500)',
                  boxShadow: esAdmin === val ? 'var(--sombra-sm)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!esAdmin && (
              <div className="input-group">
                <label className="input-label">
                  Dependencia <span className="req">*</span>
                </label>
                <select
                  className="input" value={depId}
                  onChange={e => setDepId(e.target.value)} required={!esAdmin}
                >
                  <option value="">Selecciona tu dependencia</option>
                  {dependencias.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {!esAdmin && (
              <div className="input-group">
                <label className="input-label">
                  Coordinador <span className="req">*</span>
                </label>
                {cargandoCoord && depId ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', background: 'var(--gris-100)',
                    borderRadius: 'var(--r-md)', color: 'var(--gris-600)',
                    fontSize: '0.875rem',
                  }}>
                    <span className="spinner" style={{ width: '16px', height: '16px' }}/>
                    Cargando coordinadores...
                  </div>
                ) : (
                  <select
                    className="input" value={coordId}
                    onChange={e => setCoordId(e.target.value)} 
                    required={!esAdmin}
                    disabled={!depId || coordinadores.length === 0}
                  >
                    <option value="">
                      {!depId ? 'Selecciona dependencia primero' : coordinadores.length === 0 ? 'No hay coordinadores' : 'Selecciona coordinador'}
                    </option>
                    {coordinadores.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">
                Clave de acceso <span className="req">*</span>
              </label>
              <input
                className="input" type="password"
                placeholder={esAdmin ? 'Clave del administrador' : 'Clave de coordinadores'}
                value={clave} onChange={e => setClave(e.target.value)} required
              />
            </div>

            {error && (
              <div className="alerta alerta-error anim-fade-in">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={cargando}
              className="btn btn-primary btn-lg btn-full"
              style={{ marginTop: '4px' }}
            >
              {cargando
                ? <><span className="spinner" style={{ width: '18px', height: '18px' }}/> Ingresando…</>
                : 'Ingresar al sistema'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
