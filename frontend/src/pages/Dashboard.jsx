import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import { api } from '../services/api.js'

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
  const [toast,      setToast]      = useState(null)

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

  const handleToggleFormulario = async () => {
    try {
      if (resumen?.formulario_cerrado) {
        await api.abrirFormulario()
        mostrarToast('Formulario abierto — los coordinadores ya pueden registrar')
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
            ? 'El formulario está CERRADO. Los coordinadores no pueden registrar nuevas solicitudes.'
            : 'El formulario está ABIERTO. Los coordinadores pueden registrar y editar dotaciones.'}
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
                    <th className="hide-mobile">Coordinador</th>
                    <th className="hide-mobile">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((r, i) => {
                    const tallasTexto = () => {
                      if (r.talla_camisa)  return `C:${r.talla_camisa} / S:${r.talla_saco} / P:${r.talla_pantalon}`
                      if (r.talla_general) return r.talla_general
                      if (r.sin_talla)     return '—'
                      return '—'
                    }
                    return (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{r.empleado}</div>
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
                  ? 'Al cerrar el formulario, ningún coordinador podrá registrar ni editar dotaciones. Podrás volver a abrirlo cuando quieras.'
                  : 'Al abrir el formulario, los coordinadores podrán registrar y editar dotaciones nuevamente.'}
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
