import { useEffect, useRef, useState } from 'react'
import { BUTTONS, FACTORY_BUTTONS, FUNCTIONS, functionOf } from '../../../../lib/protocol.mjs'
import type { Shared } from '@/App'

type Btn = 'left' | 'right' | 'wheel' | 'up' | 'down' | 'back' | 'forward' | 'dpi'

// idx = posición del botón en el mapa del ratón (BUTTONS); el giro de la rueda no se puede reasignar.
const ROWS: { id: Btn; name: string; idx?: number; fixed?: string }[] = [
  { id: 'left', name: 'Botón izquierdo', idx: 0 },
  { id: 'right', name: 'Botón derecho', idx: 1 },
  { id: 'wheel', name: 'Clic de rueda', idx: 2 },
  { id: 'up', name: 'Rueda arriba', fixed: 'Desplazar arriba' },
  { id: 'down', name: 'Rueda abajo', fixed: 'Desplazar abajo' },
  { id: 'back', name: 'Lateral trasero', idx: 3 },
  { id: 'forward', name: 'Lateral delantero', idx: 4 },
  { id: 'dpi', name: 'Botón DPI', idx: 5 }
]
// Lo que recibe Windows (la ventana), según el número de botón del evento.
const DOM_BUTTON: Btn[] = ['left', 'wheel', 'right', 'back', 'forward']
const DOM_NAME: Record<string, string> = { left: 'clic izquierdo', wheel: 'clic central', right: 'clic derecho', back: 'atrás', forward: 'adelante' }

export function ButtonsView({ s }: { s: Shared }): React.JSX.Element {
  const [hit, setHit] = useState<Set<Btn>>(new Set())
  const [log, setLog] = useState<string[]>([])
  const timers = useRef<Record<string, number>>({})
  // Mapa de botones: lo grabado en el ratón y lo que se está editando.
  const [stored, setStored] = useState<number[] | null>(null)
  const [codes, setCodes] = useState<number[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!s.device.connected) return
    void window.isy.getButtons().then((r) => {
      if (!r.ok) return setMsg({ ok: false, text: r.error })
      setStored(r.codes)
      setCodes(r.codes)
    })
  }, [s.device.connected])

  async function save(next: number[]): Promise<void> {
    setBusy(true)
    setMsg(null)
    const r = await window.isy.setButtons(next)
    setBusy(false)
    if (!r.ok) return setMsg({ ok: false, text: r.error })
    setStored(r.codes)
    setCodes(r.codes)
    setMsg({ ok: true, text: 'Botones grabados en el ratón: funcionan en cualquier PC, sin la app.' })
  }
  const pending = !!codes && !!stored && codes.join() !== stored.join()
  const noLeft = !!codes && !codes.includes(0x01)

  const flash = (b: Btn, text: string, ms = 0): void => {
    setHit((h) => new Set(h).add(b))
    setLog((l) => [`${new Date().toLocaleTimeString()}  ${text}`, ...l].slice(0, 100))
    if (ms) {
      clearTimeout(timers.current[b])
      timers.current[b] = window.setTimeout(() => setHit((h) => { const n = new Set(h); n.delete(b); return n }), ms)
    }
  }
  const release = (b: Btn): void => setHit((h) => { const n = new Set(h); n.delete(b); return n })

  // Botones normales: los ve Windows (y por tanto la ventana) como cualquier ratón.
  useEffect(() => {
    const down = (e: globalThis.MouseEvent): void => {
      const b = DOM_BUTTON[e.button]
      if (b) flash(b, `Windows recibe: ${DOM_NAME[b]}`)
      if (e.button > 2) e.preventDefault()
    }
    const up = (e: globalThis.MouseEvent): void => {
      const b = DOM_BUTTON[e.button]
      if (b) release(b)
      if (e.button > 2) e.preventDefault()
    }
    const wheel = (e: WheelEvent): void => (e.deltaY < 0 ? flash('up', 'Rueda arriba', 180) : flash('down', 'Rueda abajo', 180))
    const menu = (e: Event): void => e.preventDefault()
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    window.addEventListener('wheel', wheel, { passive: true })
    window.addEventListener('contextmenu', menu)
    return () => {
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('contextmenu', menu)
    }
  }, [])

  // DPI y cualquier otro informe del canal propio del ratón.
  const seen = useRef(s.events[0])
  useEffect(() => {
    const e = s.events[0]
    if (!e || e === seen.current) return
    seen.current = e
    if (e.type === 'dpi') flash('dpi', `Botón DPI → nivel ${e.level + 1}`, 600)
    else setLog((l) => [`${new Date(e.at).toLocaleTimeString()}  Informe USB sin identificar: ${e.hex}`, ...l].slice(0, 100))
  }, [s.events])

  const cls = (b: Btn): string => `part${hit.has(b) ? ' hit' : ''}`
  return (
    <>
      <div className="head">
        <div>
          <h2>Botones</h2>
          <p>
            Elige qué hace cada botón y grábalo en el ratón: funciona en cualquier PC, sin la app. Abajo puedes probarlos: el registro
            enseña lo que recibe Windows al pulsar.
          </p>
        </div>
      </div>
      <div className="btnmap">
        <svg viewBox="0 0 160 240" aria-label="Botones del ratón">
          <path d="M80 10 C46 10 30 40 30 90 L30 150 C30 200 52 228 80 228 C108 228 130 200 130 150 L130 90 C130 40 114 10 80 10 Z" fill="#fff" stroke="#000" strokeWidth="2.5" />
          <path className={cls('left')} d="M78 12 C48 14 32 42 31 88 L78 92 Z" />
          <path className={cls('right')} d="M82 12 C112 14 128 42 129 88 L82 92 Z" />
          <rect className={cls('wheel')} x="72" y="30" width="16" height="38" rx="8" />
          <path className={cls('up')} d="M80 18 L74 26 L86 26 Z" />
          <path className={cls('down')} d="M80 80 L74 72 L86 72 Z" />
          <rect className={cls('dpi')} x="73" y="96" width="14" height="10" rx="2" />
          <rect className={cls('forward')} x="22" y="104" width="10" height="20" rx="3" />
          <rect className={cls('back')} x="22" y="128" width="10" height="20" rx="3" />
          <text x="140" y="60">L/R</text>
          <text x="96" y="104">DPI</text>
          <text x="0" y="160">lat.</text>
        </svg>
        <div className="col">
          <table>
            <thead>
              <tr><th>Botón</th><th>Función</th></tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id} className={hit.has(r.id) ? 'hit' : ''} data-btn={r.id}>
                  <td>{r.name}</td>
                  <td>
                    {r.idx === undefined ? (
                      <span className="muted">{r.fixed}</span>
                    ) : (
                      <select
                        className="fnsel"
                        value={codes?.[r.idx] ?? ''}
                        disabled={!codes || busy}
                        onChange={(e) => codes && setCodes(codes.map((c, i) => (i === r.idx ? +e.target.value : c)))}
                      >
                        {!codes && <option value="">—</option>}
                        {codes && !functionOf(codes[r.idx]) && <option value={codes[r.idx]}>Otra (0x{codes[r.idx].toString(16)})</option>}
                        {FUNCTIONS.map((f) => <option key={f.code} value={f.code}>{f.name}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td>Botón de modos (debajo)</td><td className="muted">Cambia el efecto de luz (no se puede reasignar)</td>
              </tr>
            </tbody>
          </table>
          <div className="row">
            <button className="btn primary" disabled={!pending || noLeft || busy || !s.device.connected} onClick={() => codes && void save(codes)}>
              {busy ? 'Grabando…' : 'Grabar botones en el ratón'}
            </button>
            <button className="btn" disabled={busy || !stored || stored.join() === FACTORY_BUTTONS.join()} onClick={() => void save(FACTORY_BUTTONS)}>
              Botones de fábrica
            </button>
            {noLeft && <span className="small">Algún botón tiene que quedar como clic izquierdo.</span>}
            {!noLeft && pending && <span className="small muted">Hay cambios sin grabar.</span>}
          </div>
          {msg && <div className={msg.ok ? 'warn' : 'err'}>{msg.text}</div>}
          <div className="testpad">Zona de prueba: haz clic, gira la rueda o usa los laterales aquí</div>
          <div className="log">
            {log.length === 0 ? <div className="muted">Aún no has pulsado nada.</div> : log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <section className="box soft">
            <h3>Qué se puede asignar</h3>
            <p className="small">
              Solo funciones comprobadas en este ratón: clics, atrás/adelante, cambiar o subir el DPI y desactivar ({BUTTONS.length} botones).
              Teclas, atajos, multimedia o macros necesitan más investigación y no se ofrecen todavía.
            </p>
            {!s.device.connected && <p className="small" style={{ marginTop: 6 }}>Conecta el ratón para ver y cambiar sus botones.</p>}
          </section>
        </div>
      </div>
    </>
  )
}
