import { useState, useEffect, useCallback, useMemo } from 'react'
import Navbar from '../components/Navbar.jsx'
import { api } from '../services/api.js'

const TIPOS_CARGO = ['aseo', 'operativo', 'profesional', 'administrativo']

// ═══════════════════════════════════════════════════════════
// Componentes reutilizables
// ═══════════════════════════════════════════════════════════

function CabeceraModal({ titulo, subtitulo, color, onCerrar }) {
  return (
    <div className="modal-header">
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', color: color || 'var(--azul-900)' }}>
          {titulo}
        </h3>
        {subtitulo && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{subtitulo}</p>
        )}
      </div>
      <button className="btn btn-ghost btn-icon" onClick={onCerrar} aria-label="Cerrar">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

function Spinner({ size = 15 }) {
  return <span className="spinner" style={{ width: `${size}px`, height: `${size}px` }} />
}

// ═══════════════════════════════════════════════════════════
// Modales — EMPLEADOS
// ═══════════════════════════════════════════════════════════

function ModalAgregarEmpleado({ dependencias, onGuardar, onCerrar }) {
  const [nombre, setNombre]               = useState('')
  const [cargo, setCargo]                 = useState('')
  const [tipoCargo, setTipoCargo]         = useState('')
  const [dependenciaId, setDependenciaId] = useState('')
  const [error, setError]                 = useState('')
  const [guardando, setGuardando]         = useState(false)

  const handleGuardar = async () => {
    setError('')
    if (!nombre.trim() || !cargo.trim() || !tipoCargo || !dependenciaId) {
      setError('Completa todos los campos')
      return
    }
    setGuardando(true)
    try {
      await onGuardar({ nombre: nombre.trim(), cargo: cargo.trim(), tipo_cargo: tipoCargo, dependencia_id: dependenciaId })
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" style={{ maxWidth: '460px' }}>
        <CabeceraModal titulo="Agregar empleado" subtitulo="Crea un nuevo empleado en una dependencia" onCerrar={onCerrar} />
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Nombre completo <span className="req">*</span></label>
            <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: María González" autoComplete="off" />
          </div>
          <div className="input-group">
            <label className="input-label">Cargo <span className="req">*</span></label>
            <input className="input" value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ej: Auxiliar administrativo" autoComplete="off" />
          </div>
          <div className="input-group">
            <label className="input-label">Tipo de cargo <span className="req">*</span></label>
            <select className="input" value={tipoCargo} onChange={e => setTipoCargo(e.target.value)} style={{ textTransform: 'capitalize' }}>
              <option value="">Selecciona…</option>
              {TIPOS_CARGO.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Dependencia <span className="req">*</span></label>
            <select className="input" value={dependenciaId} onChange={e => setDependenciaId(e.target.value)}>
              <option value="">Selecciona…</option>
              {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          {error && <div className="alerta alerta-error anim-fade-in">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar} disabled={guardando}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
            {guardando ? <><Spinner size={16} /> Guardando…</> : 'Crear empleado'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalMover({ titulo, nombre, dependenciaActualId, dependenciaActualNombre, dependencias, onGuardar, onCerrar }) {
  const [destino, setDestino]     = useState('')
  const [error, setError]         = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleGuardar = async () => {
    setError('')
    if (!destino) { setError('Selecciona una dependencia destino'); return }
    setGuardando(true)
    try {
      await onGuardar(destino)
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" style={{ maxWidth: '440px' }}>
        <CabeceraModal titulo={titulo} subtitulo={nombre} onCerrar={onCerrar} />
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.875rem', background: 'var(--azul-50)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Dependencia actual</span>
            <span style={{ color: 'var(--azul-900)', fontWeight: 500, textAlign: 'right' }}>{dependenciaActualNombre || '—'}</span>
          </div>
          <div className="input-group">
            <label className="input-label">Nueva dependencia <span className="req">*</span></label>
            <select className="input" value={destino} onChange={e => setDestino(e.target.value)}>
              <option value="">Selecciona…</option>
              {dependencias
                .filter(d => String(d.id) !== String(dependenciaActualId))
                .map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          <div className="alerta alerta-info">
            Esta acción moverá el registro a la nueva dependencia.
          </div>
          {error && <div className="alerta alerta-error anim-fade-in">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar} disabled={guardando}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando || !destino}>
            {guardando ? <><Spinner size={16} /> Moviendo…</> : 'Mover'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalEliminarEmpleado({ empleado, onConfirmar, onCerrar }) {
  const [texto, setTexto]         = useState('')
  const [eliminando, setEliminando] = useState(false)
  const [error, setError]         = useState('')
  const coincide = texto.trim() === empleado.nombre.trim()

  const handleEliminar = async () => {
    setError('')
    setEliminando(true)
    try {
      await onConfirmar()
    } catch (err) {
      setError(err.message)
      setEliminando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" style={{ maxWidth: '460px' }}>
        <CabeceraModal titulo="Eliminar empleado" color="var(--rojo)" onCerrar={onCerrar} />
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            Vas a eliminar permanentemente a <strong>{empleado.nombre}</strong>.
          </p>

          {empleado.tiene_dotacion && (
            <div className="alerta alerta-warning">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
              <div>Este empleado tiene una dotación registrada que también será eliminada.</div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">
              Escribe el nombre <strong style={{ color: 'var(--rojo)' }}>{empleado.nombre}</strong> para confirmar
            </label>
            <input
              className="input" value={texto} onChange={e => setTexto(e.target.value)}
              placeholder={empleado.nombre} autoComplete="off"
              style={{ borderColor: coincide ? 'var(--verde)' : undefined }}
            />
          </div>
          {error && <div className="alerta alerta-error anim-fade-in">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar} disabled={eliminando}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleEliminar} disabled={!coincide || eliminando}>
            {eliminando ? <><Spinner size={15} /> Eliminando…</> : 'Sí, eliminar permanentemente'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Modales — DEPENDENCIAS
// ═══════════════════════════════════════════════════════════

function ModalFusionar({ dependencia, dependencias, onConfirmar, onCerrar }) {
  const [destino, setDestino]     = useState('')
  const [texto, setTexto]         = useState('')
  const [procesando, setProcesando] = useState(false)
  const [error, setError]         = useState('')
  const coincide = texto.trim() === dependencia.nombre.trim()
  const destinoNombre = dependencias.find(d => String(d.id) === String(destino))?.nombre

  const handleConfirmar = async () => {
    setError('')
    if (!destino) { setError('Selecciona la dependencia destino'); return }
    setProcesando(true)
    try {
      await onConfirmar(destino)
    } catch (err) {
      setError(err.message)
      setProcesando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <CabeceraModal titulo="Fusionar dependencia" subtitulo={dependencia.nombre} color="var(--dorado)" onCerrar={onCerrar} />
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Mover todo a <span className="req">*</span></label>
            <select className="input" value={destino} onChange={e => setDestino(e.target.value)}>
              <option value="">Selecciona la dependencia destino…</option>
              {dependencias
                .filter(d => String(d.id) !== String(dependencia.id))
                .map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>

          <div className="alerta alerta-warning">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
            <div>
              Todos los empleados y coordinadores de <strong>{dependencia.nombre}</strong>
              {destinoNombre ? <> serán movidos a <strong>{destinoNombre}</strong></> : ' serán movidos al destino'} y la
              dependencia <strong>{dependencia.nombre}</strong> será eliminada. Esta acción no se puede deshacer.
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              Escribe <strong style={{ color: 'var(--dorado)' }}>{dependencia.nombre}</strong> para confirmar
            </label>
            <input
              className="input" value={texto} onChange={e => setTexto(e.target.value)}
              placeholder={dependencia.nombre} autoComplete="off"
              style={{ borderColor: coincide ? 'var(--verde)' : undefined }}
            />
          </div>
          {error && <div className="alerta alerta-error anim-fade-in">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar} disabled={procesando}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleConfirmar} disabled={!coincide || !destino || procesando}>
            {procesando ? <><Spinner size={15} /> Fusionando…</> : 'Fusionar y eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Modales — COORDINADORES
// ═══════════════════════════════════════════════════════════

function ModalAgregarCoordinador({ dependencias, onGuardar, onCerrar }) {
  const [nombre, setNombre]               = useState('')
  const [dependenciaId, setDependenciaId] = useState('')
  const [error, setError]                 = useState('')
  const [guardando, setGuardando]         = useState(false)

  const handleGuardar = async () => {
    setError('')
    if (!nombre.trim() || !dependenciaId) { setError('Completa todos los campos'); return }
    setGuardando(true)
    try {
      await onGuardar({ nombre: nombre.trim(), dependencia_id: dependenciaId })
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" style={{ maxWidth: '440px' }}>
        <CabeceraModal titulo="Agregar coordinador" subtitulo="Responsable de proceso de una dependencia" onCerrar={onCerrar} />
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Nombre completo <span className="req">*</span></label>
            <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Carlos Ramírez" autoComplete="off" />
          </div>
          <div className="input-group">
            <label className="input-label">Dependencia <span className="req">*</span></label>
            <select className="input" value={dependenciaId} onChange={e => setDependenciaId(e.target.value)}>
              <option value="">Selecciona…</option>
              {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          <div className="alerta alerta-info">
            El coordinador iniciará sesión seleccionando su nombre y su dependencia, con la <strong>clave general de coordinadores</strong>. No se genera una clave individual.
          </div>
          {error && <div className="alerta alerta-error anim-fade-in">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar} disabled={guardando}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
            {guardando ? <><Spinner size={16} /> Guardando…</> : 'Crear coordinador'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalEliminarCoordinador({ coordinador, onConfirmar, onCerrar }) {
  const [eliminando, setEliminando] = useState(false)
  const [error, setError]           = useState('')
  const [requiereForzar, setRequiereForzar] = useState(false)

  const handleEliminar = async (forzar) => {
    setError('')
    setEliminando(true)
    try {
      await onConfirmar(forzar)
    } catch (err) {
      // El backend pide confirmación extra si es el único coordinador
      if (err.message?.includes('único coordinador')) {
        setRequiereForzar(true)
        setError(err.message)
      } else {
        setError(err.message)
      }
      setEliminando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" style={{ maxWidth: '440px' }}>
        <CabeceraModal titulo="Eliminar coordinador" color="var(--rojo)" onCerrar={onCerrar} />
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            Vas a eliminar permanentemente al coordinador <strong>{coordinador.nombre}</strong>
            {' '}de <strong>{coordinador.dependencia}</strong>.
          </p>

          {requiereForzar && (
            <div className="alerta alerta-warning">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
              <div>Es el <strong>único coordinador</strong> de su dependencia. Si lo eliminas, esa dependencia quedará sin responsable de proceso.</div>
            </div>
          )}

          {error && !requiereForzar && <div className="alerta alerta-error anim-fade-in">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar} disabled={eliminando}>Cancelar</button>
          {requiereForzar ? (
            <button className="btn btn-danger" onClick={() => handleEliminar(true)} disabled={eliminando}>
              {eliminando ? <><Spinner size={15} /> Eliminando…</> : 'Eliminar de todos modos'}
            </button>
          ) : (
            <button className="btn btn-danger" onClick={() => handleEliminar(false)} disabled={eliminando}>
              {eliminando ? <><Spinner size={15} /> Eliminando…</> : 'Sí, eliminar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PESTAÑAS
// ═══════════════════════════════════════════════════════════

function PestanaEmpleados({ empleados, dependencias, cargando, onAgregar, onMover, onEliminar }) {
  const [busqueda, setBusqueda]       = useState('')
  const [filtroDep, setFiltroDep]     = useState('')
  const [filtroCargo, setFiltroCargo] = useState('')
  const [filtroDot, setFiltroDot]     = useState('') // '' | 'pendiente' | 'registrada'

  const filas = useMemo(() => empleados.filter(e => {
    const matchBusq  = !busqueda    || e.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchDep   = !filtroDep   || String(e.dependencia_id) === String(filtroDep)
    const matchCargo = !filtroCargo || e.tipo_cargo === filtroCargo
    const matchDot   = !filtroDot
      || (filtroDot === 'pendiente'  && !e.tiene_dotacion)
      || (filtroDot === 'registrada' &&  e.tiene_dotacion)
    return matchBusq && matchDep && matchCargo && matchDot
  }), [empleados, busqueda, filtroDep, filtroCargo, filtroDot])

  const totalPendientes = empleados.filter(e => !e.tiene_dotacion).length

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {filas.length} empleado{filas.length !== 1 ? 's' : ''}{(busqueda || filtroDep || filtroCargo || filtroDot) ? ' (filtrado)' : ''}
          </p>
          {totalPendientes > 0 && !filtroDot && (
            <button
              className="badge badge-red"
              onClick={() => setFiltroDot('pendiente')}
              style={{ cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)' }}
              title="Ver solo pendientes"
            >
              {totalPendientes} sin dotación
            </button>
          )}
        </div>
        <button className="btn btn-primary btn-sm" onClick={onAgregar}>+ Agregar empleado</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <input className="input" placeholder="Buscar por nombre…" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <select className="input" value={filtroDep} onChange={e => setFiltroDep(e.target.value)}>
          <option value="">Todas las dependencias</option>
          {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
        </select>
        <select className="input" value={filtroCargo} onChange={e => setFiltroCargo(e.target.value)} style={{ textTransform: 'capitalize' }}>
          <option value="">Todos los cargos</option>
          {TIPOS_CARGO.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
        </select>
        <select className="input" value={filtroDot} onChange={e => setFiltroDot(e.target.value)}>
          <option value="">Todos (dotación)</option>
          <option value="pendiente">Sin dotación</option>
          <option value="registrada">Con dotación</option>
        </select>
        {(busqueda || filtroDep || filtroCargo || filtroDot) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setBusqueda(''); setFiltroDep(''); setFiltroCargo(''); setFiltroDot('') }}>
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="card">
        {cargando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-secondary)' }}>
            <span className="spinner spinner-dark" /> Cargando empleados…
          </div>
        ) : filas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>No hay empleados con esos filtros</div>
        ) : (
          <div className="tabla-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th className="hide-mobile">Dependencia</th>
                  <th className="hide-mobile">Cargo</th>
                  <th>Dotación</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500, color: 'var(--azul-900)' }}>{e.nombre}</td>
                    <td className="hide-mobile" style={{ fontSize: '0.875rem' }}>{e.dependencia}</td>
                    <td className="hide-mobile">
                      <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{e.tipo_cargo}</span>
                    </td>
                    <td>
                      {e.tiene_dotacion
                        ? <span className="badge badge-green">Registrada</span>
                        : <span className="badge badge-red">Pendiente</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="gestion-acciones">
                        <button className="btn btn-ghost btn-sm" onClick={() => onMover(e)}>Mover</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rojo)' }} onClick={() => onEliminar(e)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

function PestanaDependencias({ dependencias, cargando, onFusionar, onEliminar }) {
  const [busqueda, setBusqueda] = useState('')
  const filas = busqueda
    ? dependencias.filter(d => d.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (d.subdireccion || '').toLowerCase().includes(busqueda.toLowerCase()))
    : dependencias

  return (
    <>
      <div className="gestion-search-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
          {filas.length} dependencia{filas.length !== 1 ? 's' : ''}{busqueda ? ' (filtrado)' : ''}
        </p>
        <input
          className="input gestion-search-input" placeholder="Buscar dependencia o subdirección…"
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
        />
      </div>
      <div className="card">
        {cargando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-secondary)' }}>
            <span className="spinner spinner-dark" /> Cargando dependencias…
          </div>
        ) : filas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>No hay dependencias con ese criterio</div>
        ) : (
          <div className="tabla-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th className="hide-mobile">Subdirección</th>
                  <th>Empleados</th>
                  <th>Coordinadores</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(d => {
                  const vacia = d.total_empleados === 0 && d.total_coordinadores === 0
                  return (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 500, color: 'var(--azul-900)' }}>{d.nombre}</td>
                      <td className="hide-mobile" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{d.subdireccion || '—'}</td>
                      <td><span className="badge badge-blue">{d.total_empleados}</span></td>
                      <td><span className="badge badge-gold">{d.total_coordinadores}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="gestion-acciones">
                          <button className="btn btn-ghost btn-sm" onClick={() => onFusionar(d)}>Fusionar</button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: vacia ? 'var(--rojo)' : 'var(--gris-300)' }}
                            onClick={() => vacia && onEliminar(d)}
                            disabled={!vacia}
                            title={vacia ? 'Eliminar dependencia vacía' : 'Solo se puede eliminar si no tiene empleados ni coordinadores'}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

function PestanaCoordinadores({ coordinadores, cargando, onAgregar, onMover, onEliminar }) {
  const [busqueda, setBusqueda] = useState('')
  const filas = busqueda
    ? coordinadores.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.dependencia.toLowerCase().includes(busqueda.toLowerCase()))
    : coordinadores

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {filas.length} coordinador{filas.length !== 1 ? 'es' : ''}{busqueda ? ' (filtrado)' : ''}
        </p>
        <div className="gestion-coord-controls">
          <input
            className="input" placeholder="Buscar nombre o dependencia…"
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={onAgregar}>+ Agregar coordinador</button>
        </div>
      </div>
      <div className="card">
        {cargando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-secondary)' }}>
            <span className="spinner spinner-dark" /> Cargando coordinadores…
          </div>
        ) : filas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>No hay coordinadores con ese criterio</div>
        ) : (
          <div className="tabla-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Dependencia</th>
                  <th className="hide-mobile">Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500, color: 'var(--azul-900)' }}>{c.nombre}</td>
                    <td style={{ fontSize: '0.875rem' }}>{c.dependencia}</td>
                    <td className="hide-mobile">
                      {c.activo
                        ? <span className="badge badge-green">Activo</span>
                        : <span className="badge badge-gray">Inactivo</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="gestion-acciones">
                        <button className="btn btn-ghost btn-sm" onClick={() => onMover(c)}>Mover</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rojo)' }} onClick={() => onEliminar(c)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

export default function Gestion() {
  const [tab, setTab] = useState('empleados') // 'empleados' | 'dependencias' | 'coordinadores'

  const [empleados, setEmpleados]       = useState([])
  const [dependencias, setDependencias] = useState([])
  const [coordinadores, setCoordinadores] = useState([])
  const [cargando, setCargando]         = useState(true)
  const [toast, setToast]               = useState(null)

  // Estado de modales (guardan el registro objetivo o flags)
  const [modalAgregarEmp, setModalAgregarEmp]   = useState(false)
  const [modalMoverEmp, setModalMoverEmp]       = useState(null)
  const [modalEliminarEmp, setModalEliminarEmp] = useState(null)
  const [modalFusionar, setModalFusionar]       = useState(null)
  const [modalEliminarDep, setModalEliminarDep] = useState(null)
  const [modalAgregarCoord, setModalAgregarCoord]   = useState(false)
  const [modalMoverCoord, setModalMoverCoord]       = useState(null)
  const [modalEliminarCoord, setModalEliminarCoord] = useState(null)

  const mostrarToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [emps, deps, coords] = await Promise.all([
        api.gestion.empleados(),
        api.gestion.dependencias(),
        api.gestion.coordinadores(),
      ])
      setEmpleados(emps)
      setDependencias(deps)
      setCoordinadores(coords)
    } catch (err) {
      mostrarToast(err.message, 'error')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // ── Handlers EMPLEADOS ──────────────────────────────────
  const crearEmpleado = async (body) => {
    const r = await api.gestion.crearEmpleado(body)
    setModalAgregarEmp(false)
    mostrarToast(r.mensaje)
    cargar()
  }
  const moverEmpleado = async (id, destino) => {
    const r = await api.gestion.moverEmpleado(id, destino)
    setModalMoverEmp(null)
    mostrarToast(r.mensaje)
    cargar()
  }
  const eliminarEmpleado = async (id) => {
    const r = await api.gestion.eliminarEmpleado(id)
    setModalEliminarEmp(null)
    mostrarToast(r.mensaje)
    cargar()
  }

  // ── Handlers DEPENDENCIAS ───────────────────────────────
  const fusionarDependencia = async (id, destino) => {
    const r = await api.gestion.fusionarDependencia(id, destino)
    setModalFusionar(null)
    mostrarToast(`${r.mensaje} · ${r.empleados_migrados} empleados, ${r.coordinadores_migrados} coordinadores`)
    cargar()
  }
  const eliminarDependencia = async (id) => {
    const r = await api.gestion.eliminarDependencia(id)
    setModalEliminarDep(null)
    mostrarToast(r.mensaje)
    cargar()
  }

  // ── Handlers COORDINADORES ──────────────────────────────
  const crearCoordinador = async (body) => {
    const r = await api.gestion.crearCoordinador(body)
    setModalAgregarCoord(false)
    mostrarToast(r.mensaje)
    cargar()
  }
  const moverCoordinador = async (id, destino) => {
    const r = await api.gestion.moverCoordinador(id, destino)
    setModalMoverCoord(null)
    mostrarToast(r.mensaje)
    cargar()
  }
  const eliminarCoordinador = async (id, forzar) => {
    const r = await api.gestion.eliminarCoordinador(id, forzar)
    setModalEliminarCoord(null)
    mostrarToast(r.mensaje)
    cargar()
  }

  const tabs = [
    { id: 'empleados',     label: 'Empleados' },
    { id: 'dependencias',  label: 'Dependencias' },
    { id: 'coordinadores', label: 'Coordinadores' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-app)' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 16px 60px' }}>
        {/* Header */}
        <div className="anim-fade-up" style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', color: 'var(--azul-900)', marginBottom: '4px' }}>
            Gestión administrativa
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Administra empleados, dependencias y coordinadores del sistema
          </p>
        </div>

        {/* Pestañas */}
        <div className="anim-fade-up delay-1" style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1.5px solid var(--gris-100)', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500,
                color: tab === t.id ? 'var(--azul-600)' : 'var(--text-secondary)',
                borderBottom: `2.5px solid ${tab === t.id ? 'var(--azul-600)' : 'transparent'}`,
                marginBottom: '-1.5px', transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido por pestaña */}
        <div className="anim-fade-up delay-2">
          {tab === 'empleados' && (
            <PestanaEmpleados
              empleados={empleados}
              dependencias={dependencias}
              cargando={cargando}
              onAgregar={() => setModalAgregarEmp(true)}
              onMover={setModalMoverEmp}
              onEliminar={setModalEliminarEmp}
            />
          )}
          {tab === 'dependencias' && (
            <PestanaDependencias
              dependencias={dependencias}
              cargando={cargando}
              onFusionar={setModalFusionar}
              onEliminar={setModalEliminarDep}
            />
          )}
          {tab === 'coordinadores' && (
            <PestanaCoordinadores
              coordinadores={coordinadores}
              cargando={cargando}
              onAgregar={() => setModalAgregarCoord(true)}
              onMover={setModalMoverCoord}
              onEliminar={setModalEliminarCoord}
            />
          )}
        </div>
      </main>

      {/* ── Modales EMPLEADOS ── */}
      {modalAgregarEmp && (
        <ModalAgregarEmpleado
          dependencias={dependencias}
          onGuardar={crearEmpleado}
          onCerrar={() => setModalAgregarEmp(false)}
        />
      )}
      {modalMoverEmp && (
        <ModalMover
          titulo="Mover empleado"
          nombre={modalMoverEmp.nombre}
          dependenciaActualId={modalMoverEmp.dependencia_id}
          dependenciaActualNombre={modalMoverEmp.dependencia}
          dependencias={dependencias}
          onGuardar={(destino) => moverEmpleado(modalMoverEmp.id, destino)}
          onCerrar={() => setModalMoverEmp(null)}
        />
      )}
      {modalEliminarEmp && (
        <ModalEliminarEmpleado
          empleado={modalEliminarEmp}
          onConfirmar={() => eliminarEmpleado(modalEliminarEmp.id)}
          onCerrar={() => setModalEliminarEmp(null)}
        />
      )}

      {/* ── Modales DEPENDENCIAS ── */}
      {modalFusionar && (
        <ModalFusionar
          dependencia={modalFusionar}
          dependencias={dependencias}
          onConfirmar={(destino) => fusionarDependencia(modalFusionar.id, destino)}
          onCerrar={() => setModalFusionar(null)}
        />
      )}
      {modalEliminarDep && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalEliminarDep(null)}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <CabeceraModal titulo="Eliminar dependencia" color="var(--rojo)" onCerrar={() => setModalEliminarDep(null)} />
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                Vas a eliminar la dependencia <strong>{modalEliminarDep.nombre}</strong>. Está vacía (sin empleados ni coordinadores), así que es seguro eliminarla.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalEliminarDep(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => eliminarDependencia(modalEliminarDep.id)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modales COORDINADORES ── */}
      {modalAgregarCoord && (
        <ModalAgregarCoordinador
          dependencias={dependencias}
          onGuardar={crearCoordinador}
          onCerrar={() => setModalAgregarCoord(false)}
        />
      )}
      {modalMoverCoord && (
        <ModalMover
          titulo="Mover coordinador"
          nombre={modalMoverCoord.nombre}
          dependenciaActualId={modalMoverCoord.dependencia_id}
          dependenciaActualNombre={modalMoverCoord.dependencia}
          dependencias={dependencias}
          onGuardar={(destino) => moverCoordinador(modalMoverCoord.id, destino)}
          onCerrar={() => setModalMoverCoord(null)}
        />
      )}
      {modalEliminarCoord && (
        <ModalEliminarCoordinador
          coordinador={modalEliminarCoord}
          onConfirmar={(forzar) => eliminarCoordinador(modalEliminarCoord.id, forzar)}
          onCerrar={() => setModalEliminarCoord(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: toast.tipo === 'error' ? 'var(--rojo)' : 'var(--azul-900)',
          color: 'white', padding: '12px 22px',
          borderRadius: 'var(--r-lg)', fontSize: '0.875rem', fontWeight: 500,
          boxShadow: 'var(--sombra-lg)', zIndex: 200,
          animation: 'fadeUp 0.3s var(--ease)', maxWidth: '90vw', textAlign: 'center',
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        /* Botones de acción en tablas: lado a lado en desktop, columna en móvil */
        .gestion-acciones {
          display: flex;
          gap: 4px;
          justify-content: flex-end;
        }

        /* Buscador de dependencias: input flexible junto al contador */
        .gestion-search-input {
          max-width: 280px;
        }

        /* Buscador + botón de coordinadores */
        .gestion-coord-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .gestion-coord-controls .input {
          max-width: 240px;
        }

        @media (max-width: 640px) {
          /* En móvil los botones de acción se apilan verticalmente */
          .gestion-acciones {
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
          }

          /* El buscador de dependencias ocupa todo el ancho */
          .gestion-search-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .gestion-search-input {
            max-width: none;
          }

          /* El buscador + botón de coordinadores se apilan */
          .gestion-coord-controls {
            flex-direction: column;
            align-items: stretch;
          }
          .gestion-coord-controls .input {
            max-width: none;
          }
          .gestion-coord-controls .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
