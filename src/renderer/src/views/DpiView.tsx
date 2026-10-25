import { useEffect, useState } from 'react'
import { DPI_CODES, DPI_LEVELS, FACTORY_DPI, dpiOf, modeById, quantize } from '../../../../lib/protocol.mjs'
import type { DpiState } from '@shared/types'
import type { Shared } from '@/App'
import { Preview } from '@/components/Preview'

export function DpiView({ s }: { s: Shared }): React.JSX.Element {
  const d = s.draft
  const m = modeById(d.mode)
  const [mouseDpi, setMouseDpi] = useState<DpiState | null>(null)
  const [codes, setCodes] = useState<number[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Lo que hay grabado en el ratón (se lee de su memoria, sin escribir nada).
  useEffect(() => {
    if (!s.device.connected) return
    void window.isy.getDpi().then((r) => {
      if (!r.ok) return setMsg({ ok: false, text: r.error })
      setMouseDpi(r.state)
      setCodes(r.state.codes)
    })
  }, [s.device.connected])

  const setColor = (i: number, hex: string): void =>
    s.setDraft({ ...d, mode: m.color ? d.mode : 'static', colors: d.colors.map((c, j) => (j === i ? hex : c)) })
  const dpiPending = !!codes && !!mouseDpi && codes.join() !== mouseDpi.codes.join()

  async function saveDpi(next: number[]): Promise<void> {
    setBusy(true)
    setMsg(null)
    const r = await window.isy.setDpi(next)
    setBusy(false)
    if (!r.ok) return setMsg({ ok: false, text: r.error })
    setMouseDpi(r.state)
    setCodes(r.state.codes)
    s.setDpiLevel(r.state.active)
    setMsg({ ok: true, text: 'DPI grabado en el ratón. Se mantiene aunque lo desenchufes.' })
  }

  async function activate(level: number): Promise<void> {
    if (busy || !s.device.connected || s.dpi === level) return
    setBusy(true)
    setMsg(null)
    const r = await window.isy.setLevel(level)
    setBusy(false)
    if (!r.ok) return setMsg({ ok: false, text: r.error })
    setMouseDpi(r.state)
    s.setDpiLevel(r.state.active)
  }

  return (
    <>
      <div className="head">
        <div>
          <h2>DPI</h2>
          <p>
            El ratón tiene 6 niveles. Pulsa una tarjeta para activar ese nivel, o usa el botón de detrás de la rueda como siempre.
            Aquí eliges también la velocidad (DPI) y el color de cada nivel.
          </p>
        </div>
      </div>
      <div className="layout">
        <div className="col">
          <div className="dpis">
            {Array.from({ length: DPI_LEVELS }, (_, i) => (
              <div
                key={i}
                className={`dpi${s.dpi === i ? ' live' : ''}`}
                data-level={i}
                title={s.dpi === i ? 'Nivel activo' : 'Pulsa para activar este nivel'}
                // Pulsar la tarjeta (fuera del desplegable y del color) activa el nivel.
                onClick={(e) => !(e.target as HTMLElement).closest('select, input, label') && void activate(i)}
              >
                {s.dpi === i ? <span className="tag solid live-tag">activo</span> : <span className="tag live-tag">activar</span>}
                <span className="small muted">Nivel</span>
                <span className="n">{i + 1}</span>
                <label className="small">
                  Velocidad
                  <select
                    className="dpisel"
                    value={codes?.[i] ?? ''}
                    disabled={!codes || busy}
                    onChange={(e) => codes && setCodes(codes.map((c, j) => (j === i ? +e.target.value : c)))}
                  >
                    {!codes && <option value="">—</option>}
                    {DPI_CODES.map((c) => <option key={c} value={c}>{dpiOf(c)} DPI</option>)}
                  </select>
                </label>
                <div className="sw" style={{ background: quantize(d.colors[i]) }}>
                  <input type="color" value={d.colors[i]} onChange={(e) => setColor(i, e.target.value)} title="Cambiar el color de este nivel" />
                </div>
                <span className="mono small">{quantize(d.colors[i])}</span>
              </div>
            ))}
          </div>

          <section className="box">
            <h3>Velocidad <span className="tag">se graba en el ratón</span></h3>
            <div className="row">
              <button className="btn primary" disabled={!dpiPending || busy || !s.device.connected} onClick={() => codes && void saveDpi(codes)} data-testid="save-dpi">
                {busy ? 'Grabando…' : 'Grabar DPI en el ratón'}
              </button>
              <button className="btn" disabled={busy || !mouseDpi || mouseDpi.codes.join() === FACTORY_DPI.join()} onClick={() => void saveDpi(FACTORY_DPI)}>
                Valores de fábrica
              </button>
              {dpiPending && <span className="small muted">Hay cambios sin grabar.</span>}
            </div>
            {msg && <div className={msg.ok ? 'warn' : 'err'} style={{ marginTop: 10 }}>{msg.text}</div>}
            <p className="small muted" style={{ marginTop: 10 }}>
              Los valores son aproximados (código × 200, según el software del mismo chip). Fábrica: 1200, 1600, 2400, 2600, 3000 y 3600.
              El DPI se guarda en la memoria del ratón; la luz, en cambio, hay que mandarla con «Aplicar» o «Reaplicar al abrir».
            </p>
          </section>

          <section className="box soft">
            <h3>Colores por nivel</h3>
            {!m.color && <div className="warn" style={{ marginBottom: 8 }}>El estilo actual ({m.name}) no usa colores por nivel: al elegir uno se pasa a «Estático».</div>}
            <div className="row">
              <button className="btn" onClick={() => s.setDraft({ ...d, colors: Array(DPI_LEVELS).fill(d.colors[s.dpi ?? 0]) })}>Mismo color en todos</button>
              <button className="btn" onClick={() => s.setDraft({ ...d, mode: 'static', colors: ['#00ff00', '#77ff00', '#ffff00', '#ffaa00', '#ff5500', '#ff0000'] })}>
                Verde → rojo según DPI
              </button>
              <span className="small muted">Los colores se mandan con «Aplicar al ratón».</span>
            </div>
          </section>
        </div>
        <Preview s={s} />
      </div>
    </>
  )
}
