import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import { api } from '../services/api.js'

const CODIGOS_MANTENIMIENTO = [6, 8]
const CODIGOS_SUDADERA = [7]

function ModalDetalle({ fila, onCerrar, onEliminar }) {
  const [confirmando, setConfirmando] = useState(false)
  const [eliminando,  setEliminando]  = useState(false)

  const handleEliminar = async () => {
    setEliminando(true)
    try {
      await onEliminar()
    } finally {
      setEliminando(false)
    }
  }

  const cod = Number(fila.codigo_prenda)
  const esMantenimiento = CODIGOS_MANTENIMIENTO.includes(cod)
  const esSudadera      = CODIGOS_SUDADERA.includes(cod)

  const tallas = () => {
    if (esMantenimiento) return [
      { label: 'Chaqueta',  valor: fila.talla_saco },
      { label: 'Camibuso',  valor: fila.talla_camisa },
      { label: 'Pantalón',  valor: fila.talla_pantalon },
      { label: 'Calzado',   valor: fila.talla_general },
    ]
    if (esSudadera) return [
      { label: 'Chaqueta',  valor: fila.talla_saco },
      { label: 'Pantalón',  valor: fila.talla_pantalon },
      { label: 'Camiseta',  valor: fila.talla_camisa },
    ]
    if (fila.talla_camisa) return [
      { label: 'Camisa',    valor: fila.talla_camisa },
      { label: 'Saco',      valor: fila.talla_saco },
      { label: 'Pantalón',  valor: fila.talla_pantalon },
    ]
    if (fila.talla_general) return [{ label: 'Talla', valor: fila.talla_general }]
    return []
  }

  const tallasList = tallas()

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--azul-900)' }}>
              Detalle de dotación
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{fila.empleado}</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onCerrar} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Datos del empleado */}
          <div style={{ background: 'var(--azul-50)', borderRadius: 'var(--r-md)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--azul-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Empleado</p>
            {[
              { label: 'Nombre',       valor: fila.empleado },
              { label: 'Cargo',        valor: fila.cargo },
              { label: 'Dependencia',  valor: fila.dependencia },
              { label: 'Subdirección', valor: fila.subdireccion },
            ].map(({ label, valor }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
                <span style={{ color: 'var(--azul-900)', fontWeight: 500, textAlign: 'right' }}>{valor || '—'}</span>
              </div>
            ))}
          </div>

          {/* Dotación */}
          <div style={{ background: 'var(--azul-50)', borderRadius: 'var(--r-md)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--azul-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Dotación</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tipo de prenda</span>
              <span style={{ color: 'var(--azul-900)', fontWeight: 500 }}>
                <span className="badge badge-blue" style={{ fontSize: '0.78rem' }}>Tipo {fila.codigo_prenda}</span>
                {' '}{fila.tipo_prenda}
              </span>
            </div>
            {fila.bono_calzado && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bono calzado</span>
                <span className="badge badge-gold" style={{ fontSize: '0.78rem' }}>Incluido</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Responsable de proceso</span>
              <span style={{ color: 'var(--azul-900)', fontWeight: 500, textAlign: 'right' }}>{fila.coordinador || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fecha de registro</span>
              <span style={{ color: 'var(--azul-900)', fontWeight: 500 }}>
                {fila.fecha_registro ? new Date(fila.fecha_registro).toLocaleDateString('es-CO') : '—'}
              </span>
            </div>
          </div>

          {/* Tallas */}
          {tallasList.length > 0 && (
            <div style={{ background: 'var(--azul-50)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--azul-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Tallas</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {tallasList.map(({ label, valor }) => (
                  <div key={label} style={{ background: 'var(--blanco)', borderRadius: 'var(--r-md)', padding: '10px 12px', border: '1px solid var(--azul-100)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--azul-700)', fontFamily: 'var(--font-display)' }}>{valor || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fila.sin_talla && (
            <div className="alerta alerta-info" style={{ fontSize: '0.875rem' }}>
              Personal de aseo — no requiere talla para esta prenda.
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          {!confirmando ? (
            <>
              {fila.empleado_id && (
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmando(true)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 3.5h10M5.5 3.5V2.5h3v1M6 6v4M8 6v4M3 3.5l.5 8h7l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Eliminar registro
                </button>
              )}
              <button className="btn btn-secondary" onClick={onCerrar} style={{ marginLeft: 'auto' }}>Cerrar</button>
            </>
          ) : (
            <>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--rojo)">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', color: 'var(--rojo)', fontWeight: 500 }}>
                  ¿Confirmar eliminación?
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setConfirmando(false)} disabled={eliminando}>
                  Cancelar
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleEliminar} disabled={eliminando}>
                  {eliminando
                    ? <><span className="spinner" style={{ width: '14px', height: '14px' }}/> Eliminando…</>
                    : 'Sí, eliminar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, valor, sub, color, icono }) {
  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--r-xl)',
      padding: '20px 22px',
      border: '1px solid rgba(10,22,40,0.06)',
      boxShadow: 'var(--sombra-sm)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
    }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 600, color: color || 'var(--azul-900)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{valor}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{sub}</div>}
      </div>
      <div style={{
        width: '42px', height: '42px', borderRadius: 'var(--r-md)', flexShrink: 0,
        background: 'var(--azul-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color || 'var(--azul-600)',
      }}>
        {icono}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [reporte,    setReporte]    = useState([])
  const [resumen,    setResumen]    = useState(null)
  const [cargando,   setCargando]   = useState(true)
  const [exportando, setExportando] = useState(false)
  const [accion,     setAccion]     = useState(null) // 'cerrar' | 'abrir'
  const [filtroDep,  setFiltroDep]  = useState('')
  const [filtroCargo,setFiltroCargo]= useState('')
  const [busqueda,   setBusqueda]   = useState('')
  const [toast,         setToast]         = useState(null)
  const [detalleRow,    setDetalleRow]    = useState(null)
  const [modalReset,    setModalReset]    = useState(false)
  const [confirmText,   setConfirmText]   = useState('')
  const [restableciendo,setRestableciendo]= useState(false)

  const mostrarToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [rep, res] = await Promise.all([api.reporte(), api.resumen()])
      setReporte(rep)
      setResumen(res)
    } catch (err) {
      mostrarToast(err.message, 'error')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleExportar = async () => {
    setExportando(true)
    try {
      await api.exportar()
      mostrarToast('Excel descargado correctamente')
    } catch (err) {
      mostrarToast(err.message, 'error')
    } finally {
      setExportando(false)
    }
  }

  const handleRestablecer = async () => {
    setRestableciendo(true)
    try {
      await api.restablecerFormulario()
      setModalReset(false)
      setConfirmText('')
      mostrarToast('Formulario restablecido — todos los registros eliminados')
      cargar()
    } catch (err) {
      mostrarToast(err.message, 'error')
    } finally {
      setRestableciendo(false)
    }
  }

  const handleToggleFormulario = async () => {
    try {
      if (resumen?.formulario_cerrado) {
        await api.abrirFormulario()
        mostrarToast('Formulario abierto — los responsables de proceso ya pueden registrar')
      } else {
        await api.cerrarFormulario()
        mostrarToast('Formulario cerrado — no se aceptan nuevos registros')
      }
      setAccion(null)
      cargar()
    } catch (err) {
      mostrarToast(err.message, 'error')
    }
  }

  // Opciones únicas de filtros
  const dependencias = [...new Set(reporte.map(r => r.dependencia))].sort()
  const cargos       = [...new Set(reporte.map(r => r.cargo))].sort()

  // Filtrado
  const filas = reporte.filter(r => {
    const matchDep   = !filtroDep   || r.dependencia === filtroDep
    const matchCargo = !filtroCargo || r.cargo       === filtroCargo
    const matchBusq  = !busqueda    || r.empleado.toLowerCase().includes(busqueda.toLowerCase())
    return matchDep && matchCargo && matchBusq
  })

  const progreso = resumen
    ? resumen.total_empleados > 0
      ? Math.round((resumen.total_dotaciones / resumen.total_empleados) * 100)
      : 0
    : 0

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-app)' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 16px 60px' }}>

        {/* Header */}
        <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', color: 'var(--azul-900)', marginBottom: '4px' }}>
              Panel de administración
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Resumen global de dotaciones registradas
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Botón restablecer */}
            <button
              className="btn btn-secondary"
              onClick={() => setModalReset(true)}
              title="Elimina todos los registros para iniciar un nuevo período"
              style={{ borderColor: 'var(--rojo)', color: 'var(--rojo)' }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M1.5 7.5a6 6 0 1 0 6-6 6 6 0 0 0-4.243 1.757M1.5 1.5v3.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Restablecer
            </button>

            {/* Botón abrir/cerrar formulario */}
            <button
              className={`btn ${resumen?.formulario_cerrado ? 'btn-secondary' : 'btn-danger'}`}
              onClick={() => setAccion(resumen?.formulario_cerrado ? 'abrir' : 'cerrar')}
              disabled={!resumen}
            >
              {resumen?.formulario_cerrado ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 1.5a3 3 0 00-3 3V6H3.5A1.5 1.5 0 002 7.5v5A1.5 1.5 0 003.5 14h8a1.5 1.5 0 001.5-1.5v-5A1.5 1.5 0 0011.5 6h-1V4.5a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <circle cx="7.5" cy="10" r="1.25" fill="currentColor"/>
                  </svg>
                  Abrir formulario
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M5.5 6V4.5a2 2 0 014 0V6M3.5 6h8A1.5 1.5 0 0113 7.5v5A1.5 1.5 0 0111.5 14h-8A1.5 1.5 0 012 12.5v-5A1.5 1.5 0 013.5 6z" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="7.5" cy="10" r="1.25" fill="currentColor"/>
                  </svg>
                  Cerrar formulario
                </>
              )}
            </button>

            {/* Exportar Excel */}
            <button
              className="btn btn-primary"
              onClick={handleExportar}
              disabled={exportando || reporte.length === 0}
            >
              {exportando ? (
                <><span className="spinner" style={{ width: '16px', height: '16px' }}/> Exportando…</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 1v9m0 0L4.5 7M7.5 10l3-3M2 12.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Exportar Excel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Estado del formulario */}
        <div className={`alerta ${resumen?.formulario_cerrado ? 'alerta-warning' : 'alerta-success'} anim-fade-up delay-1`} style={{ marginBottom: '20px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
          {resumen?.formulario_cerrado
            ? 'El formulario está CERRADO. Los responsables de proceso no pueden registrar nuevas solicitudes.'
            : 'El formulario está ABIERTO. Los responsables de proceso pueden registrar y editar dotaciones.'}
        </div>

        {/* Stats */}
        <div className="anim-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <StatCard
            label="Total empleados" valor={resumen?.total_empleados ?? '—'}
            color="var(--azul-600)"
            icono={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 9a3 3 0 010 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M18 17c0-2.21-1.343-4-3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Registrados" valor={resumen?.total_dotaciones ?? '—'}
            color="var(--verde)"
            sub={resumen ? `${progreso}% completado` : ''}
            icono={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
          <StatCard
            label="Pendientes" valor={resumen?.pendientes ?? '—'}
            color={resumen?.pendientes > 0 ? 'var(--rojo)' : 'var(--verde)'}
            icono={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
        </div>

        {/* Barra de progreso */}
        <div className="anim-fade-up delay-2" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', padding: '18px 22px', marginBottom: '24px', boxShadow: 'var(--sombra-sm)', border: '1px solid rgba(10,22,40,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--azul-800)' }}>Progreso global de registro</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: progreso === 100 ? 'var(--verde)' : 'var(--azul-600)' }}>{progreso}%</span>
          </div>
          <div style={{ height: '10px', background: 'var(--gris-100)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '99px',
              width: `${progreso}%`,
              background: progreso === 100
                ? 'var(--verde)'
                : `linear-gradient(90deg, var(--azul-500), var(--azul-400))`,
              transition: 'width 0.8s var(--ease)',
            }}/>
          </div>
        </div>

        {/* Filtros */}
        <div className="anim-fade-up delay-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gris-500)' }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9 9l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              className="input" type="text" placeholder="Buscar empleado…"
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <select className="input" value={filtroDep} onChange={e => setFiltroDep(e.target.value)}>
            <option value="">Todas las dependencias</option>
            {dependencias.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select className="input" value={filtroCargo} onChange={e => setFiltroCargo(e.target.value)}>
            <option value="">Todos los cargos</option>
            {cargos.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
          </select>

          {(filtroDep || filtroCargo || busqueda) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setFiltroDep(''); setFiltroCargo(''); setBusqueda('') }}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="anim-fade-up delay-4 card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--azul-900)' }}>Registros de dotación</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {filas.length} resultado{filas.length !== 1 ? 's' : ''}
                {(filtroDep || filtroCargo || busqueda) ? ' (filtrado)' : ''}
              </p>
            </div>
          </div>

          {cargando ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-secondary)' }}>
              <span className="spinner spinner-dark"/> Cargando datos…
            </div>
          ) : filas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.3, marginBottom: '12px' }}>
                <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 16h16M16 22h12M16 28h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>No hay registros con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="tabla-wrapper" style={{ borderRadius: 0, border: 'none' }}>
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Dependencia</th>
                    <th className="hide-mobile">Cargo</th>
                    <th>Prenda</th>
                    <th className="hide-mobile">Tallas</th>
                    <th className="hide-mobile">Responsable de proceso</th>
                    <th className="hide-mobile">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((r, i) => {
                    const tallasTexto = () => {
                      const cod = Number(r.codigo_prenda)
                      if (CODIGOS_MANTENIMIENTO.includes(cod)) return `Chq:${r.talla_saco} / Cmb:${r.talla_camisa} / P:${r.talla_pantalon} / Calz:${r.talla_general}`
                      if (CODIGOS_SUDADERA.includes(cod))      return `Chq:${r.talla_saco} / Pant:${r.talla_pantalon} / Cam:${r.talla_camisa}`
                      if (r.talla_camisa)  return `C:${r.talla_camisa} / S:${r.talla_saco} / P:${r.talla_pantalon}`
                      if (r.talla_general) return r.talla_general
                      if (r.sin_talla)     return '—'
                      return '—'
                    }
                    return (
                      <tr key={i} onClick={() => setDetalleRow(r)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--azul-600)', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration-color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.textDecorationColor = 'var(--azul-400)'}
                            onMouseLeave={e => e.currentTarget.style.textDecorationColor = 'transparent'}
                          >{r.empleado}</div>
                          <div className="hide-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.subdireccion}</div>
                        </td>
                        <td style={{ fontSize: '0.875rem' }}>{r.dependencia}</td>
                        <td className="hide-mobile">
                          <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{r.cargo}</span>
                        </td>
                        <td>
                          <span className="badge badge-blue">Tipo {r.codigo_prenda}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{r.tipo_prenda}</div>
                          {r.bono_calzado && <span className="badge badge-gold" style={{ fontSize: '0.68rem', marginTop: '3px' }}>+ Bono calzado</span>}
                        </td>
                        <td className="hide-mobile" style={{ fontSize: '0.875rem', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                          {tallasTexto()}
                        </td>
                        <td className="hide-mobile" style={{ fontSize: '0.8125rem' }}>{r.coordinador}</td>
                        <td className="hide-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {r.fecha_registro ? new Date(r.fecha_registro).toLocaleDateString('es-CO') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal detalle empleado */}
      {detalleRow && (
        <ModalDetalle
          fila={detalleRow}
          onCerrar={() => setDetalleRow(null)}
          onEliminar={async () => {
            await api.eliminarDotacionAdmin(detalleRow.empleado_id)
            setDetalleRow(null)
            mostrarToast('Registro eliminado — el responsable puede volver a ingresarlo')
            cargar()
          }}
        />
      )}

      {/* Modal restablecer formulario */}
      {modalReset && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--r-md)', background: 'var(--rojo-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2a7 7 0 100 14A7 7 0 009 2zm0 4v4m0 2v.5" stroke="var(--rojo)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--rojo)' }}>
                  Restablecer formulario
                </h3>
              </div>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="alerta alerta-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
                <div>
                  <strong>Esta acción eliminará TODOS los registros de dotación</strong> y no se puede deshacer. El formulario quedará cerrado listo para un nuevo período.
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Asegúrate de haber exportado el Excel con los datos del período actual antes de continuar.
              </p>
              <div className="input-group">
                <label className="input-label">
                  Escribe <strong style={{ color: 'var(--rojo)' }}>RESTABLECER</strong> para confirmar
                </label>
                <input
                  className="input"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="RESTABLECER"
                  autoComplete="off"
                  style={{ borderColor: confirmText === 'RESTABLECER' ? 'var(--verde)' : undefined }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => { setModalReset(false); setConfirmText('') }}
                disabled={restableciendo}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleRestablecer}
                disabled={confirmText !== 'RESTABLECER' || restableciendo}
              >
                {restableciendo
                  ? <><span className="spinner" style={{ width: '15px', height: '15px' }}/> Restableciendo…</>
                  : 'Confirmar restablecimiento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación abrir/cerrar */}
      {accion && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--azul-900)' }}>
                {accion === 'cerrar' ? '¿Cerrar el formulario?' : '¿Abrir el formulario?'}
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                {accion === 'cerrar'
                  ? 'Al cerrar el formulario, ningún responsable de proceso podrá registrar ni editar dotaciones. Podrás volver a abrirlo cuando quieras.'
                  : 'Al abrir el formulario, los responsables de proceso podrán registrar y editar dotaciones nuevamente.'}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAccion(null)}>Cancelar</button>
              <button
                className={`btn ${accion === 'cerrar' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleToggleFormulario}
              >
                {accion === 'cerrar' ? 'Sí, cerrar formulario' : 'Sí, abrir formulario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: toast.tipo === 'error' ? 'var(--rojo)' : 'var(--azul-900)',
          color: 'white', padding: '12px 22px',
          borderRadius: 'var(--r-lg)', fontSize: '0.875rem', fontWeight: 500,
          boxShadow: 'var(--sombra-lg)', zIndex: 200,
          animation: 'fadeUp 0.3s var(--ease)',
          whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
