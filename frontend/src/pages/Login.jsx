import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import logoImg from '../imagenes/images.png'
import { api } from '../services/api.js'

/* ── Contenido informativo reutilizado en desktop y en el drawer mobile ── */
function InfoProcedimiento() {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(200,151,58,0.12)',
        border: '1px solid rgba(200,151,58,0.25)',
        borderRadius: '999px',
        padding: '5px 14px', marginBottom: '20px',
        width: 'fit-content',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--dorado-cl)', flexShrink: 0 }}/>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--dorado-cl)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          SEGUNDA ENTREGA DE DOTACION AÑO 2026
        </span>
      </div>

      {/* Título */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.45rem)', color: 'white', lineHeight: 1.25, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        CAJA DE COMPENSACION<br/>FAMILIAR DE NARIÑO
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        PERSONAL QUE DEVENGA HASTA 2SMMLV
      </p>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '24px' }}/>

      {/* Tarjeta procedimiento */}
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 18px', marginBottom: '24px' }}>
        <p style={{ fontSize: '0.75rem', color: 'white', lineHeight: 1.6, marginBottom: '10px' }}>
          PROCEDIMIENTO PARA DETERMINAR DERECHO, COMPRA, ENTREGA Y USO DE DOTACION DE LOS TRABAJADORES DE LA CAJA DE COMPENSACIÓN FAMILIAR DE NARIÑO
        </p>
        <p style={{ fontSize: '0.7rem', color: 'var(--dorado-cl)', marginBottom: '8px', letterSpacing: '0.02em' }}>
          Código: PGR-SGH-P-17 &nbsp;·&nbsp; Versión: 2 &nbsp;·&nbsp; Fecha de Aprobación: 12/05/2023
        </p>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>
          Pertenece al Subproceso de Gestión Talento Humano
        </p>
      </div>

      {/* Objetivo */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'var(--dorado)', flexShrink: 0 }}/>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Objetivo
          </p>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', lineHeight: 1.75, paddingLeft: '11px' }}>
          Establecer el procedimiento para determinar el derecho, compra, entrega y uso de la dotación para los trabajadores de la Caja de Compensación Familiar de Nariño que garantice el cumplimiento normativo establecido en el Código Sustantivo de Trabajo.
        </p>
      </div>

      {/* Alcance */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'var(--azul-400)', flexShrink: 0 }}/>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Alcance
          </p>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', lineHeight: 1.75, paddingLeft: '11px' }}>
          El procedimiento aplica a todos los trabajadores que les asista el derecho de dotación teniendo en cuenta lo establecido en el Código Sustantivo de Trabajo.
        </p>
      </div>

      {/* Pie legal */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '16px' }}/>
      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', lineHeight: 1.7 }}>
        De acuerdo con el cumplimiento de las normas previstas en el Código Penal, Ley 1474 de 2011, en la Ley de Comercio Electrónico (Ley 527 de 1999), en la Ley 1581 de 2012, Ia política de tratamiento de Ia información de la Caja de Compensación Familiar de Nariño y las demás normas que complementen, adicionen, modifiquen o sustituyan.
      </p>
    </div>
  )
}

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
  const [infoAbierta,  setInfoAbierta]   = useState(false)

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
    <div style={{ minHeight: '100dvh', display: 'flex', background: 'var(--azul-900)', flexWrap: 'wrap' }}>

      {/* ── Panel izquierdo — visible en desktop (>768px) ── */}
      <div className="hide-mobile" style={{
        width: '44%', minWidth: '320px',
        background: 'linear-gradient(160deg, var(--azul-800) 0%, var(--azul-900) 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '52px 48px',
        position: 'relative',
        overflowX: 'hidden', overflowY: 'auto',
      }}>
        {/* Decoración: cuadrícula */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.035, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(45deg, var(--azul-400) 0px, var(--azul-400) 1px, transparent 1px, transparent 40px)`,
        }}/>
        {/* Círculos decorativos */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '360px', height: '360px', borderRadius: '50%', border: '1.5px solid rgba(200,151,58,0.12)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '40px', left: '-80px', width: '280px', height: '280px', borderRadius: '50%', border: '1.5px solid rgba(74,124,196,0.15)', pointerEvents: 'none' }}/>

        {/* Contenido */}
        <div style={{ position: 'relative' }}>
          <InfoProcedimiento />
        </div>
      </div>

      {/* ── Panel del formulario ── */}
      <div style={{
        flex: 1, minWidth: '320px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-app)',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }} className="anim-fade-up">

          {/* Logo + título */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '140px', height: '88px', borderRadius: '16px',
              background: 'var(--azul-900)', marginBottom: '20px',
              overflow: 'hidden', padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(10,22,40,0.2)',
            }}>
              <img src={logoImg} alt="Logo Comfamiliar Nariño" style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.6rem', color: 'var(--azul-900)', marginBottom: '6px' }}>
              Bienvenido
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Ingresa tus datos para continuar
            </p>
          </div>

          {/* Botón "Ver información" — solo móvil */}
          <button
            type="button"
            className="show-mobile"
            onClick={() => setInfoAbierta(true)}
            style={{
              width: '100%', marginBottom: '20px',
              padding: '11px 16px',
              background: 'var(--azul-900)',
              border: '1px solid rgba(200,151,58,0.35)',
              borderRadius: 'var(--r-lg)',
              color: 'var(--dorado-cl)',
              fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 110 1.5A.75.75 0 018 4zm-.75 3h1.5v4.5h-1.5V7z"/>
            </svg>
            Ver información del procedimiento
          </button>

          {/* Toggle responsable / admin */}
          <div style={{
            display: 'flex', background: 'var(--gris-100)',
            borderRadius: 'var(--r-lg)', padding: '4px',
            marginBottom: '24px', gap: '4px',
          }}>
            {[
              { label: 'Responsable de proceso', val: false },
              { label: 'Administrador', val: true },
            ].map(({ label, val }) => (
              <button
                key={label} type="button"
                onClick={() => { setEsAdmin(val); setError('') }}
                style={{
                  flex: 1, padding: '9px', borderRadius: 'var(--r-md)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 500,
                  transition: 'all 0.2s var(--ease)',
                  background: esAdmin === val ? 'var(--blanco)' : 'transparent',
                  color: esAdmin === val ? 'var(--azul-800)' : 'var(--gris-500)',
                  boxShadow: esAdmin === val ? 'var(--sombra-sm)' : 'none',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
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
                <select className="input" value={depId} onChange={e => setDepId(e.target.value)} required={!esAdmin}>
                  <option value="">Selecciona tu dependencia</option>
                  {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
            )}

            {!esAdmin && (
              <div className="input-group">
                <label className="input-label">Responsable de proceso <span className="req">*</span></label>
                {cargandoCoord && depId ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--gris-100)', borderRadius: 'var(--r-md)', color: 'var(--gris-600)', fontSize: '0.875rem' }}>
                    <span className="spinner" style={{ width: '16px', height: '16px' }}/>
                    Cargando responsables…
                  </div>
                ) : (
                  <select className="input" value={coordId} onChange={e => setCoordId(e.target.value)} required={!esAdmin} disabled={!depId || coordinadores.length === 0}>
                    <option value="">
                      {!depId ? 'Selecciona dependencia primero' : coordinadores.length === 0 ? 'No hay responsables registrados' : 'Selecciona responsable de proceso'}
                    </option>
                    {coordinadores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                )}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Clave de acceso <span className="req">*</span></label>
              <input
                className="input" type="password"
                placeholder={esAdmin ? 'Clave del administrador' : 'Clave del responsable de proceso'}
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

            <button type="submit" disabled={cargando} className="btn btn-primary btn-lg btn-full" style={{ marginTop: '4px' }}>
              {cargando
                ? <><span className="spinner" style={{ width: '18px', height: '18px' }}/> Ingresando…</>
                : 'Ingresar al sistema'
              }
            </button>
          </form>
        </div>
      </div>

      {/* ── Drawer de información — solo móvil ── */}
      {infoAbierta && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setInfoAbierta(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(10,22,40,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{
            width: '100%', maxHeight: '90dvh',
            background: 'linear-gradient(160deg, var(--azul-800) 0%, var(--azul-900) 100%)',
            borderRadius: '20px 20px 0 0',
            padding: '24px 24px 40px',
            overflowY: 'auto',
            animation: 'fadeUp 0.3s var(--ease)',
          }}>
            {/* Handle + cabecera */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 0 0' }}/>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                Información del procedimiento
              </p>
              <button
                type="button"
                onClick={() => setInfoAbierta(false)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <InfoProcedimiento />
          </div>
        </div>
      )}
    </div>
  )
}
