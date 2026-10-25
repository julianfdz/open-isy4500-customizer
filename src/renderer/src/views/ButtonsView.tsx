import { useEffect, useRef, useState } from 'react'
import type { Shared } from '@/App'

type Btn = 'left' | 'right' | 'wheel' | 'up' | 'down' | 'back' | 'forward' | 'dpi'

const ROWS: { id: Btn; name: string; does: string; how: string }[] = [
  { id: 'left', name: 'Botón izquierdo', does: 'Clic principal', how: 'Windows' },
  { id: 'right', name: 'Botón derecho', does: 'Menú contextual', how: 'Windows' },
  { id: 'wheel', name: 'Clic de rueda', does: 'Clic central', how: 'Windows' },
  { id: 'up', name: 'Rueda arriba', does: 'Desplazar arriba', how: 'Windows' },
  { id: 'down', name: 'Rueda abajo', does: 'Desplazar abajo', how: 'Windows' },
  { id: 'back', name: 'Lateral trasero', does: 'Atrás (si tu ratón lo tiene)', how: 'Windows' },
  { id: 'forward', name: 'Lateral delantero', does: 'Adelante (si tu ratón lo tiene)', how: 'Windows' },
  { id: 'dpi', name: 'Botón DPI', does: 'Siguiente nivel de DPI (6 niveles)', how: 'USB del ratón' }
]
const DOM_BUTTON: Btn[] = ['left', 'wheel', 'right', 'back', 'forward']

export function ButtonsView({ s }: { s: Shared }): React.JSX.Element {
  const [hit, setHit] = useState<Set<Btn>>(new Set())
  const [log, setLog] = useState<string[]>([])
  const timers = useRef<Record<string, number>>({})

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
      if (b) flash(b, `${ROWS.find((r) => r.id === b)!.name} pulsado`)
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
          <p>Pulsa cualquier botón del ratón con la ventana delante: se marca en el dibujo y en la tabla. Sirve para comprobar que todos funcionan.</p>
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
              <tr><th>Botón</th><th>Qué hace</th><th>Lo gestiona</th></tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id} className={hit.has(r.id) ? 'hit' : ''} data-btn={r.id}>
                  <td>{r.name}</td><td>{r.does}</td><td className="small">{r.how}</td>
                </tr>
              ))}
              <tr>
                <td>Botón de modos (debajo)</td><td>Cambia el efecto de luz en el propio ratón</td><td className="small">Firmware</td>
              </tr>
            </tbody>
          </table>
          <div className="testpad">Zona de prueba: haz clic, gira la rueda o usa los laterales aquí</div>
          <div className="log">
            {log.length === 0 ? <div className="muted">Aún no has pulsado nada.</div> : log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <section className="box soft">
            <h3>Reasignar botones</h3>
            <p className="small">
              Cambiar lo que hace cada botón (macros, atajos) no está en el protocolo conocido de este chip, así que la app no lo ofrece todavía.
              Si el ratón manda algún informe USB nuevo al pulsar un botón, aparece arriba como «sin identificar»: es la pista para seguir
              investigando.
            </p>
            {!s.device.connected && <p className="small" style={{ marginTop: 6 }}>Conecta el ratón para ver el botón DPI.</p>}
          </section>
        </div>
      </div>
    </>
  )
}
