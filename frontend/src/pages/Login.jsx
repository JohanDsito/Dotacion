import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import logoImg from '../imagenes/images.png'

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

  useEffect(() => {
    api.dependencias()
      .then(setDependencias)
      .catch((err) => {
        console.error('❌ Error cargando dependencias:', err)
        setError('No se pudieron cargar las dependencias. ¿El servidor está corriendo?')
      })
  }, [])

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
      .catch(() => setCoordinadores([]))
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
    <div style={{ minHeight: '100dvh', display: 'flex', background: 'var(--azul-900)' }}>

      {/* ── Panel izquierdo ────────────────────────────────── */}
      <div className="hide-mobile" style={{
        width: '44%',
        background: 'linear-gradient(160deg, var(--azul-800) 0%, var(--azul-900) 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '52px 48px',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Decoración: cuadrícula sutil */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.035,
          backgroundImage: `repeating-linear-gradient(45deg, var(--azul-400) 0px, var(--azul-400) 1px, transparent 1px, transparent 40px)`,
        }}/>
        {/* Círculo dorado top-right */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '360px', height: '360px', borderRadius: '50%',
          border: '1.5px solid rgba(200,151,58,0.12)',
        }}/>
        {/* Círculo azul bottom-left */}
        <div style={{
          position: 'absolute', bottom: '40px', left: '-80px',
          width: '280px', height: '280px', borderRadius: '50%',
          border: '1.5px solid rgba(74,124,196,0.15)',
        }}/>

        {/* ── Contenido principal ── */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Badge de evento */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(200,151,58,0.12)',
            border: '1px solid rgba(200,151,58,0.25)',
            borderRadius: '999px',
            padding: '5px 14px', marginBottom: '20px',
            width: 'fit-content',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--dorado-cl)', flexShrink: 0,
            }}/>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 700,
              color: 'var(--dorado-cl)', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              PRIMERA ENTREGA DE DOTACION AÑO 2026
            </span>
          </div>

          {/* Título grande */}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'clamp(1.1rem, 2vw, 1.45rem)',
            color: 'white', lineHeight: 1.25, marginBottom: '6px',
            textTransform: 'uppercase', letterSpacing: '0.02em',
          }}>
            CAJA DE COMPENSACION<br/>FAMILIAR DE NARIÑO
          </h1>
          <p style={{
            fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.5, marginBottom: '28px', textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            PERSONAL QUE DEVENGA HASTA 2SMMLV
          </p>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '28px' }}/>

          {/* Info del procedimiento */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '16px 18px', marginBottom: '28px',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '10px' }}>
              PROCEDIMIENTO PARA DETERMINAR DERECHO, COMPRA, ENTREGA Y USO DE DOTACION DE LOS TRABAJADORES DE LA CAJA DE COMPENSACIÓN FAMILIAR DE NARIÑO
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--dorado-cl)', marginBottom: '8px', letterSpacing: '0.02em' }}>
              Código: PGR-SGH-P-17 &nbsp;·&nbsp; Versión: 2 &nbsp;·&nbsp; Fecha de Aprobación: 12/05/2023
            </p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
              Pertenece al Subproceso de Gestión Talento Humano
            </p>
          </div>

          {/* Objetivo */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'var(--dorado)', flexShrink: 0 }}/>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Objetivo
              </p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.75, paddingLeft: '11px' }}>
              Establecer el procedimiento para determinar el derecho, compra, entrega y uso de la dotación para los trabajadores de la Caja de Compensación Familiar de Nariño que garantice el cumplimiento normativo establecido en el Código Sustantivo de Trabajo.
            </p>
          </div>

          {/* Alcance */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'var(--azul-400)', flexShrink: 0 }}/>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Alcance
              </p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.75, paddingLeft: '11px' }}>
              El procedimiento aplica a todos los trabajadores que les asista el derecho de dotación teniendo en cuenta lo establecido en el Código Sustantivo de Trabajo.
            </p>
          </div>
        </div>

        {/* ── Pie legal ── */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '18px' }}/>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.72rem', lineHeight: 1.7 }}>
            De acuerdo con el cumplimiento de las normas previstas en el Código Penal, Ley 1474 de 2011, en la Ley de Comercio Electrónico (Ley 527 de 1999), en la Ley 1581 de 2012, Ia política de tratamiento de Ia información de la Caja de Compensación Familiar de Nariño y las demás normas que complementen, adicionen, modifiquen o sustituyan.
          </p>
        </div>
      </div>

      {/* ── Panel del formulario ───────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-app)',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }} className="anim-fade-up">

          {/* Logo + título */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '140px', height: '88px',
              borderRadius: '16px',
              background: 'var(--azul-900)',
              marginBottom: '20px',
              overflow: 'hidden',
              padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(10,22,40,0.2)',
            }}>
              <img
                src={logoImg}
                alt="Logo Comfamiliar Nariño"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600, fontSize: '1.6rem',
              color: 'var(--azul-900)', marginBottom: '6px',
            }}>
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

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!esAdmin && (
              <div className="input-group">
                <label className="input-label">Dependencia <span className="req">*</span></label>
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
                <label className="input-label">Coordinador <span className="req">*</span></label>
                {cargandoCoord && depId ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', background: 'var(--gris-100)',
                    borderRadius: 'var(--r-md)', color: 'var(--gris-600)',
                    fontSize: '0.875rem',
                  }}>
                    <span className="spinner" style={{ width: '16px', height: '16px' }}/>
                    Cargando coordinadores…
                  </div>
                ) : (
                  <select
                    className="input" value={coordId}
                    onChange={e => setCoordId(e.target.value)}
                    required={!esAdmin}
                    disabled={!depId || coordinadores.length === 0}
                  >
                    <option value="">
                      {!depId
                        ? 'Selecciona dependencia primero'
                        : coordinadores.length === 0
                          ? 'No hay coordinadores'
                          : 'Selecciona coordinador'}
                    </option>
                    {coordinadores.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Clave de acceso <span className="req">*</span></label>
              <input
                className="input" type="password"
                placeholder={esAdmin ? 'Clave del administrador' : 'Clave del coordinador'}
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
