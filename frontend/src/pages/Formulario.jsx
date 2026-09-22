import { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'

// Tallas de camisa y saco — aplica para hombre, mujer y sudadera
const TALLAS_CAMISA_SACO = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
// Tallas de pantalón para traje hombre (código 1) y uniformes mixtos
const TALLAS_PANTALON_HOMBRE = ['28','30','32','34','36','38','40']
// Tallas de pantalón para traje dama (código 3)
const TALLAS_PANTALON_MUJER  = ['6','8','10','12','14','16','18','20','22']
const TALLAS_PANTALON = ['28', '30', '32', '34', '36', '38', '40']
const TALLAS_CALZADO_MANT  = ['37', '38', '39', '40', '41', '42']
const CODIGOS_MANTENIMIENTO = [6, 8]
const CODIGOS_SUDADERA = [7]

/* ── Botón "Guía de tallas" reutilizable ── */
function BtnGuia({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '5px 12px',
        background: 'rgba(200,151,58,0.13)',
        border: '1.5px solid rgba(200,151,58,0.55)',
        borderRadius: '999px',
        cursor: 'pointer',
        color: 'var(--dorado-cl)',
        fontFamily: 'var(--font-body)', fontSize: '0.74rem', fontWeight: 700,
        whiteSpace: 'nowrap', flexShrink: 0,
        letterSpacing: '0.01em',
        boxShadow: '0 0 10px rgba(200,151,58,0.1)',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 110 1.5A.75.75 0 018 4zm-.75 3h1.5v4.5h-1.5V7z"/>
      </svg>
      Guía de tallas
    </button>
  )
}

/* ── Drawer de referencia de tallas ── */
function GuiaTallas({ tabInicial = 'dama', onCerrar }) {
  const [tab, setTab] = useState(tabInicial)

  const DAMA = [
    { letra: 'XS',   nombre: 'Extra Pequeño',      conf: '6 – 8',   ref: '28 – 30' },
    { letra: 'S',    nombre: 'Pequeño',             conf: '8 – 10',  ref: '30 – 32' },
    { letra: 'M',    nombre: 'Mediano',             conf: '10 – 12', ref: '34 – 40' },
    { letra: 'L',    nombre: 'Grande',              conf: '14 – 16', ref: '36 – 38' },
    { letra: 'XL',   nombre: 'Extra Grande',        conf: '18 – 20', ref: '40 – 42' },
    { letra: 'XXL',  nombre: 'Doble Extra Grande',  conf: '22 – 24', ref: '44 – 46' },
    { letra: 'XXXL', nombre: 'Triple Extra Grande', conf: '22 – 24', ref: '44 – 46' },
  ]

  const CABALLERO = [
    { talla: '28', ref: '≈ 71 cm' },
    { talla: '30', ref: '≈ 76 cm' },
    { talla: '32', ref: '≈ 81 cm' },
    { talla: '34', ref: '≈ 86 cm' },
    { talla: '36', ref: '≈ 91 cm' },
    { talla: '38', ref: '≈ 97 cm' },
    { talla: '40', ref: '≈ 102 cm' },
  ]

  return (
    <div
      onClick={e => e.target === e.currentTarget && onCerrar()}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(10,22,40,0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        width: '100%', maxHeight: '85dvh',
        background: 'var(--bg-card)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 24px 40px',
        overflowY: 'auto',
        animation: 'fadeUp 0.3s var(--ease)',
      }}>
        {/* Handle */}
        <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'var(--gris-200)', margin: '0 auto 20px' }}/>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--azul-900)', marginBottom: '3px' }}>
              Guía de tallas
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Equivalencia entre tallas de letra y medidas numéricas
            </p>
          </div>
          <button
            type="button" onClick={onCerrar}
            style={{ background: 'var(--gris-100)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gris-600)', flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--gris-100)', borderRadius: 'var(--r-lg)', padding: '4px', marginBottom: '20px', gap: '4px' }}>
          {[
            { id: 'dama',      label: 'Pantalón Dama' },
            { id: 'caballero', label: 'Pantalón Caballero' },
          ].map(({ id, label }) => (
            <button
              key={id} type="button"
              onClick={() => setTab(id)}
              style={{
                flex: 1, padding: '9px', borderRadius: 'var(--r-md)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500,
                background: tab === id ? 'var(--blanco)' : 'transparent',
                color: tab === id ? 'var(--azul-800)' : 'var(--gris-500)',
                boxShadow: tab === id ? 'var(--sombra-sm)' : 'none',
                transition: 'all 0.2s var(--ease)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Pantalón Dama */}
        {tab === 'dama' && (
          <>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
              Tallas numéricas de confección colombiana. La columna <strong>Ref.</strong> indica la medida aproximada de cadera/cintura en cm.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '340px' }}>
                <thead>
                  <tr style={{ background: 'var(--azul-900)' }}>
                    {['Talla', 'Descripción', 'N.º confección', 'Ref. (cm)'].map((h, i) => (
                      <th key={h} style={{
                        padding: '10px 14px', color: 'white', fontWeight: 600,
                        textAlign: i < 2 ? 'left' : 'center',
                        borderRadius: i === 0 ? '8px 0 0 0' : i === 3 ? '0 8px 0 0' : 0,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAMA.map((f, i) => (
                    <tr key={f.letra} style={{ background: i % 2 === 0 ? 'var(--gris-50)' : 'white', borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--azul-700)', fontFamily: 'var(--font-display)', fontSize: '0.875rem' }}>{f.letra}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>{f.nombre}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--azul-600)' }}>{f.conf}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)' }}>{f.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pantalón Caballero */}
        {tab === 'caballero' && (
          <>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
              Las tallas de pantalón caballero corresponden a la medida de cintura en pulgadas (estándar internacional).
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--azul-900)' }}>
                    {['Talla (pulgadas)', 'Cintura aprox.'].map((h, i) => (
                      <th key={h} style={{
                        padding: '10px 14px', color: 'white', fontWeight: 600, textAlign: 'left',
                        borderRadius: i === 0 ? '8px 0 0 0' : '0 8px 0 0',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CABALLERO.map((f, i) => (
                    <tr key={f.talla} style={{ background: i % 2 === 0 ? 'var(--gris-50)' : 'white', borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--azul-700)', fontFamily: 'var(--font-display)', fontSize: '0.875rem' }}>{f.talla}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{f.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Nota camisa y saco */}
        <div style={{ marginTop: '20px', padding: '14px 16px', background: 'var(--azul-50)', borderRadius: 'var(--r-lg)', border: '1px solid var(--azul-100)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--azul-700)', lineHeight: 1.6 }}>
            <strong>Camisa, saco y chaqueta</strong> — se registran con tallas en letra (XS → XXXL) que corresponden a las tallas estándar de confección.
          </p>
        </div>
      </div>
    </div>
  )
}

function TallaSelector({ label, value, onChange, disabled, tallas = TALLAS_CAMISA_SACO }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label className="input-label">{label} <span className="req">*</span></label>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {(tallas).map(t => (
          <button
            key={t} type="button" disabled={disabled}
            onClick={() => onChange(t)}
            style={{
              padding: '7px 12px', borderRadius: 'var(--r-sm)',
              border: `1.5px solid ${value === t ? 'var(--azul-500)' : 'var(--border)'}`,
              background: value === t ? 'var(--azul-600)' : 'var(--blanco)',
              color: value === t ? 'white' : 'var(--text-primary)',
              fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}

function ModalDotacion({ empleado, prendas, dotacion, cerrado, onGuardar, onCerrar }) {
  const [tipoPrendaId,  setTipoPrendaId]  = useState(dotacion?.tipo_prenda_id || '')
  const [tallaCamisa,   setTallaCamisa]   = useState(dotacion?.talla_camisa   || '')
  const [tallaSaco,     setTallaSaco]     = useState(dotacion?.talla_saco     || '')
  const [tallaPantalon, setTallaPantalon] = useState(dotacion?.talla_pantalon || '')
  const [tallaGeneral,  setTallaGeneral]  = useState(dotacion?.talla_general  || '')
  const [bonCalzado,    setBonCalzado]    = useState(dotacion?.incluye_bono_calzado || false)
  const [error,      setError]      = useState('')
  const [guardando,  setGuardando]  = useState(false)
  const [guiaAbierta, setGuiaAbierta] = useState(false)

  const prenda = prendas.find(p => p.id === tipoPrendaId)
  const esMantenimiento = prenda && CODIGOS_MANTENIMIENTO.includes(Number(prenda.codigo))
  const esSudadera      = prenda && CODIGOS_SUDADERA.includes(Number(prenda.codigo))

  // Calcular prenda sugerida por defecto según tipo_cargo
  useEffect(() => {
    if (!dotacion && !tipoPrendaId) {
      const sugerida = prendas.find(p => {
        if (empleado.tipo_cargo === 'aseo')           return p.es_aseo
        if (empleado.tipo_cargo === 'operativo')      return p.codigo === 7
        if (empleado.tipo_cargo === 'profesional')    return p.es_elegante
        if (empleado.tipo_cargo === 'administrativo') return p.es_elegante
        return false
      })
      if (sugerida) setTipoPrendaId(sugerida.id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGuardar = async () => {
    setError('')
    if (!tipoPrendaId) { setError('Selecciona un tipo de prenda'); return }
    if (esMantenimiento) {
      if (!tallaSaco || !tallaCamisa || !tallaPantalon || !tallaGeneral) { setError('Ingresa las 4 tallas del uniforme de mantenimiento'); return }
    } else if (esSudadera) {
      if (!tallaSaco || !tallaCamisa || !tallaPantalon) { setError('Ingresa las 3 tallas de la sudadera'); return }
    } else if (prenda?.es_elegante) {
      if (!tallaCamisa || !tallaSaco || !tallaPantalon) { setError('Ingresa las 3 tallas del traje'); return }
    } else if (prenda?.requiere_talla && !prenda.es_aseo) {
      if (!tallaGeneral) { setError('Selecciona la talla'); return }
    }

    setGuardando(true)
    try {
      await onGuardar({
        empleado_id:          empleado.id,
        tipo_prenda_id:       tipoPrendaId,
        talla_camisa:         tallaCamisa,
        talla_saco:           tallaSaco,
        talla_pantalon:       tallaPantalon,
        talla_general:        tallaGeneral,
        incluye_bono_calzado: bonCalzado,
      })
      // onGuardar cierra el modal al terminar correctamente
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem', color: 'var(--azul-900)' }}>
              {dotacion ? 'Editar dotación' : 'Asignar dotación'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
              {empleado.nombre} · <span style={{ textTransform: 'capitalize' }}>{empleado.tipo_cargo}</span>
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onCerrar} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cerrado && (
            <div className="alerta alerta-warning">
              El formulario está cerrado. Solo puedes visualizar.
            </div>
          )}

          {/* Selector tipo de prenda */}
          <div className="input-group">
            <label className="input-label">Tipo de prenda <span className="req">*</span></label>
            <select
              className="input" value={tipoPrendaId}
              onChange={e => {
                setTipoPrendaId(e.target.value)
                setTallaCamisa(''); setTallaSaco(''); setTallaPantalon(''); setTallaGeneral('')
              }}
              disabled={cerrado}
            >
              <option value="">Selecciona una prenda</option>
              {prendas.map(p => (
                <option key={p.id} value={p.id}>
                  Tipo {p.codigo} — {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Tallas según tipo */}
          {esMantenimiento && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: 'var(--azul-50)', borderRadius: 'var(--r-lg)', border: '1px solid var(--azul-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--azul-700)', fontWeight: 500 }}>
                  Mantenimiento — ingresa cada talla por separado
                </p>
                <BtnGuia onClick={() => setGuiaAbierta(true)} />
              </div>
              <TallaSelector label="Chaqueta"  value={tallaSaco}     onChange={setTallaSaco}     disabled={cerrado} />
              <TallaSelector label="Camibuso"  value={tallaCamisa}   onChange={setTallaCamisa}   disabled={cerrado} />
              <TallaSelector label="Pantalón"  value={tallaPantalon} onChange={setTallaPantalon} disabled={cerrado} tallas={TALLAS_PANTALON} />
              <TallaSelector label="Calzado"   value={tallaGeneral}  onChange={setTallaGeneral}  disabled={cerrado} tallas={TALLAS_CALZADO_MANT} />
            </div>
          )}

          {esSudadera && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: 'var(--azul-50)', borderRadius: 'var(--r-lg)', border: '1px solid var(--azul-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--azul-700)', fontWeight: 500 }}>
                  Sudadera — ingresa cada talla por separado
                </p>
                <BtnGuia onClick={() => setGuiaAbierta(true)} />
              </div>
              <TallaSelector label="Chaqueta"  value={tallaSaco}     onChange={setTallaSaco}     disabled={cerrado} />
              <TallaSelector label="Pantalón"  value={tallaPantalon} onChange={setTallaPantalon} disabled={cerrado} tallas={TALLAS_PANTALON} />
              <TallaSelector label="Camiseta"  value={tallaCamisa}   onChange={setTallaCamisa}   disabled={cerrado} />
            </div>
          )}

          {prenda?.es_elegante && !esMantenimiento && !esSudadera && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: 'var(--azul-50)', borderRadius: 'var(--r-lg)', border: '1px solid var(--azul-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--azul-700)', fontWeight: 500 }}>
                  Traje elegante — ingresa cada talla por separado
                </p>
                <BtnGuia onClick={() => setGuiaAbierta(true)} />
              </div>
              <TallaSelector label="Camisa"   value={tallaCamisa}   onChange={setTallaCamisa}   disabled={cerrado} tallas={TALLAS_CAMISA_SACO} />
              <TallaSelector label="Saco"     value={tallaSaco}     onChange={setTallaSaco}     disabled={cerrado} tallas={TALLAS_CAMISA_SACO} />
              <TallaSelector label="Pantalón" value={tallaPantalon} onChange={setTallaPantalon} disabled={cerrado}
                tallas={Number(prenda.codigo) === 3 ? TALLAS_PANTALON_MUJER : TALLAS_PANTALON_HOMBRE} />
            </div>
          )}

          {prenda?.requiere_talla && !prenda.es_elegante && !prenda.es_aseo && !esMantenimiento && !esSudadera && (
            <TallaSelector label="Talla" value={tallaGeneral} onChange={setTallaGeneral} disabled={cerrado} />
          )}

          {prenda?.es_aseo && (
            <div className="alerta alerta-info">
              Personal de aseo — no requiere talla para esta prenda.
            </div>
          )}

          {/* Bono calzado para administrativos */}
          {(empleado.tipo_cargo === 'administrativo') && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox" checked={bonCalzado}
                onChange={e => setBonCalzado(e.target.checked)}
                disabled={cerrado}
                style={{ width: '18px', height: '18px', accentColor: 'var(--azul-600)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Incluir bono de calzado
              </span>
            </label>
          )}

          {error && (
            <div className="alerta alerta-error anim-fade-in">{error}</div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
          {!cerrado && (
            <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
              {guardando ? <><span className="spinner" style={{ width: '16px', height: '16px' }}/> Guardando…</> : 'Guardar dotación'}
            </button>
          )}
        </div>
      </div>

      {guiaAbierta && (
        <GuiaTallas
          tabInicial={Number(prenda?.codigo) === 3 ? 'dama' : 'caballero'}
          onCerrar={() => setGuiaAbierta(false)}
        />
      )}
    </div>
  )
}

function TarjetaEmpleado({ empleado, prendas, cerrado, onEditar }) {
  const dot = empleado.dotaciones?.[0]
  const prenda = dot ? prendas.find(p => p.id === dot.tipo_prenda_id) : null

  const tallasResumen = () => {
    if (!dot) return null
    const cod = Number(prenda?.codigo)
    if (CODIGOS_MANTENIMIENTO.includes(cod)) return `Chq: ${dot.talla_saco} / Cmb: ${dot.talla_camisa} / P: ${dot.talla_pantalon} / Calz: ${dot.talla_general}`
    if (CODIGOS_SUDADERA.includes(cod))      return `Chq: ${dot.talla_saco} / Pant: ${dot.talla_pantalon} / Cam: ${dot.talla_camisa}`
    if (prenda?.es_elegante) return `C: ${dot.talla_camisa} / S: ${dot.talla_saco} / P: ${dot.talla_pantalon}`
    if (prenda?.es_aseo)     return 'Sin talla'
    return dot.talla_general
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1.5px solid ${dot ? 'var(--azul-100)' : 'var(--gris-100)'}`,
      borderRadius: 'var(--r-lg)',
      padding: '16px',
      display: 'flex', alignItems: 'center', gap: '14px',
      transition: 'box-shadow 0.18s, border-color 0.18s',
      boxShadow: dot ? 'var(--sombra-sm)' : 'none',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--sombra-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = dot ? 'var(--sombra-sm)' : 'none'}
    >
      {/* Avatar */}
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
        background: dot ? 'var(--azul-600)' : 'var(--gris-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: dot ? 'white' : 'var(--gris-500)', fontWeight: 600, fontSize: '0.9rem',
      }}>
        {empleado.nombre.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--azul-900)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {empleado.nombre}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
            {empleado.tipo_cargo}
          </span>
          {dot && prenda && (
            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
              Tipo {prenda.codigo} · {tallasResumen()}
            </span>
          )}
          {!dot && (
            <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>Pendiente</span>
          )}
        </div>
      </div>

      {/* Botón acción */}
      <button
        className={`btn btn-sm ${dot ? 'btn-ghost' : 'btn-primary'}`}
        onClick={() => onEditar(empleado)}
        style={{ flexShrink: 0 }}
        disabled={cerrado && !dot}
      >
        {dot ? (cerrado ? 'Ver' : 'Editar') : 'Asignar'}
      </button>
    </div>
  )
}

export default function Formulario() {
  const { usuario } = useAuth()
  const [empleados,  setEmpleados]  = useState([])
  const [prendas,    setPrendas]    = useState([])
  const [cerrado,    setCerrado]    = useState(false)
  const [cargando,   setCargando]   = useState(true)
  const [filtro,     setFiltro]     = useState('')
  const [modalEmp,   setModalEmp]   = useState(null)
  const [toast,      setToast]      = useState(null)

  const mostrarToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    console.log('📡 Cargando empleados - Rol:', usuario.rol, 'dependencia_id:', usuario.dependencia_id)
    try {
      const [emps, prends, estado] = await Promise.all([
        api.empleados(usuario.dependencia_id),
        api.prendas(),
        api.estadoFormulario(),
      ])
      console.log('✅ Empleados cargados:', emps.length)
      setEmpleados(emps)
      setPrendas(prends)
      setCerrado(estado.cerrado)
    } catch (err) {
      mostrarToast(err.message, 'error')
      console.error('❌ Error cargando:', err)
    } finally {
      setCargando(false)
    }
  }, [usuario.dependencia_id, usuario.rol])

  useEffect(() => { cargar() }, [cargar])

  // ── Guardar dotación ──────────────────────────────────────────────────────
  // En lugar de recargar TODOS los empleados desde el servidor,
  // actualizamos solo el empleado afectado en el estado local.
  // Esto evita el parpadeo "Pendiente" y es más rápido.
  const handleGuardar = async (payload) => {
    try {
      console.log('💾 Guardando dotación:', payload)
      const resultado = await api.guardarDotacion(payload)
      console.log('✅ Respuesta del servidor:', resultado)

      // Actualizar el empleado en el estado local con la dotación devuelta
      setEmpleados(prev => prev.map(emp => {
        if (emp.id !== payload.empleado_id) return emp
        return {
          ...emp,
          dotaciones: [resultado.dotacion]  // la dotación ya viene con tipos_prenda incluido
        }
      }))

      // Si el modal estaba abierto con ese empleado, actualizar su referencia
      // para que al "Editar" de nuevo vea los datos actuales
      setModalEmp(prev => {
        if (!prev || prev.id !== payload.empleado_id) return null
        return { ...prev, dotaciones: [resultado.dotacion] }
      })

      mostrarToast('Dotación guardada correctamente')
      setModalEmp(null)  // cerrar modal

    } catch (err) {
      console.error('❌ Error guardando:', err)
      // El error se propaga al modal para que lo muestre
      throw err
    }
  }

  const empFiltrados = empleados.filter(e =>
    e.nombre.toLowerCase().includes(filtro.toLowerCase())
  )
  const registrados = empleados.filter(e => e.dotaciones?.length > 0).length
  const pendientes  = empleados.length - registrados
  const progreso    = empleados.length ? Math.round((registrados / empleados.length) * 100) : 0

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-app)' }}>
      <Navbar />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 16px 40px' }}>

        {/* Header */}
        <div className="anim-fade-up" style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(1.3rem, 4vw, 1.7rem)', color: 'var(--azul-900)', marginBottom: '4px' }}>
            {usuario.dependencia_nombre}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Asigna la dotación a cada empleado de tu dependencia
          </p>
        </div>

        {/* Banner formulario cerrado */}
        {cerrado && (
          <div className="alerta alerta-warning anim-fade-up" style={{ marginBottom: '20px', padding: '14px 18px' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M9 1a8 8 0 100 16A8 8 0 009 1zm0 4.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 019 5.5zm0 8a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
            <div>
              <strong>Formulario cerrado.</strong> El administrador ha cerrado la recepción de solicitudes. Solo puedes consultar los registros existentes.
            </div>
          </div>
        )}

        {/* Tarjetas de resumen */}
        <div className="anim-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total empleados', valor: empleados.length, color: 'var(--azul-600)' },
            { label: 'Registrados',     valor: registrados,      color: 'var(--verde)' },
            { label: 'Pendientes',      valor: pendientes,       color: pendientes > 0 ? 'var(--rojo)' : 'var(--verde)' },
          ].map(({ label, valor, color }) => (
            <div key={label} style={{
              background: 'var(--bg-card)', borderRadius: 'var(--r-lg)',
              padding: '14px 16px', textAlign: 'center',
              border: '1px solid rgba(10,22,40,0.06)',
              boxShadow: 'var(--sombra-sm)',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color, fontFamily: 'var(--font-display)' }}>{valor}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="anim-fade-up delay-2" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: '20px', boxShadow: 'var(--sombra-sm)', border: '1px solid rgba(10,22,40,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--azul-800)' }}>Avance de registro</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--azul-600)' }}>{progreso}%</span>
          </div>
          <div style={{ height: '8px', background: 'var(--gris-100)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '99px',
              width: `${progreso}%`,
              background: progreso === 100 ? 'var(--verde)' : 'var(--azul-500)',
              transition: 'width 0.6s var(--ease)',
            }}/>
          </div>
        </div>

        {/* Buscador */}
        <div className="anim-fade-up delay-3" style={{ position: 'relative', marginBottom: '16px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gris-500)' }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className="input" type="text"
            placeholder="Buscar empleado…"
            value={filtro} onChange={e => setFiltro(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* Lista de empleados */}
        {cargando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-secondary)' }}>
            <span className="spinner spinner-dark"/> Cargando empleados…
          </div>
        ) : (
          <div className="anim-fade-up delay-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {empFiltrados.length === 0 && (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
                No se encontraron empleados
              </div>
            )}
            {empFiltrados.map(emp => (
              <TarjetaEmpleado
                key={emp.id}
                empleado={emp}
                prendas={prendas}
                cerrado={cerrado}
                onEditar={setModalEmp}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalEmp && (
        <ModalDotacion
          empleado={modalEmp}
          prendas={prendas}
          dotacion={modalEmp.dotaciones?.[0]}
          cerrado={cerrado}
          onGuardar={handleGuardar}
          onCerrar={() => setModalEmp(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: toast.tipo === 'error' ? 'var(--rojo)' : 'var(--azul-900)',
          color: 'white', padding: '12px 20px',
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