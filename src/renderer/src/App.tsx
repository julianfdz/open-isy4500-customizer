import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_CONFIG } from '../../../lib/protocol.mjs'
import type { Device, LightConfig, MouseEvent, Saved } from '@shared/types'
import { ColorView } from '@/views/ColorView'
import { DpiView } from '@/views/DpiView'
import { ButtonsView } from '@/views/ButtonsView'
import logo from './logobuho.png'

type ViewId = 'color' | 'dpi' | 'botones'
const VIEWS: { id: ViewId; name: string }[] = [
  { id: 'color', name: 'Color' },
  { id: 'dpi', name: 'DPI' },
  { id: 'botones', name: 'Botones' }
]

/** Estado común a las tres vistas. */
export interface Shared {
  device: Device
  draft: LightConfig
  /** Lo último que se ha mandado al ratón en esta sesión (o por el CLI); null si aún nada. */
  applied: LightConfig | null
  dpi: number | null
  events: MouseEvent[]
  busy: boolean
  error: string | null
  setDraft(c: LightConfig): void
  setDpiLevel(level: number | null): void
  apply(c?: LightConfig): Promise<void>
}

const same = (a: LightConfig, b: LightConfig): boolean => JSON.stringify(a) === JSON.stringify(b)

export default function App(): React.JSX.Element {
  const [view, setView] = useState<ViewId>('color')
  const [device, setDevice] = useState<Device>({ connected: false })
  const [saved, setSaved] = useState<Saved>({ config: DEFAULT_CONFIG, reapplyOnStart: false })
  const [draft, setDraft] = useState<LightConfig>(DEFAULT_CONFIG)
  const [dpi, setDpi] = useState<number | null>(null)
  const [events, setEvents] = useState<MouseEvent[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastApply, setLastApply] = useState<string | null>(null)
  const [applied, setApplied] = useState<LightConfig | null>(null)

  useEffect(() => {
    void window.isy.device().then((d) => {
      setDevice(d)
      // Nivel activo leído de la memoria del ratón, sin esperar a que se pulse el botón.
      if (d.connected) void window.isy.getDpi().then((r) => r.ok && setDpi(r.state.active))
    })
    void window.isy.saved().then((s) => {
      setSaved(s)
      setDraft(s.config)
    })
    const offs = [
      window.isy.onDevice((d) => {
        setDevice(d)
        if (!d.connected) setDpi(null)
        else void window.isy.getDpi().then((r) => r.ok && setDpi(r.state.active))
      }),
      window.isy.onMouse((e) => {
        if (e.type === 'dpi') setDpi(e.level)
        setEvents((list) => [e, ...list].slice(0, 200))
      }),
      // El CLI ha cambiado la luz: la ventana se pone al día.
      window.isy.onSaved((s) => {
        setSaved(s)
        setDraft(s.config)
        setApplied(s.config)
        setLastApply(`${new Date().toLocaleTimeString()} (CLI)`)
      })
    ]
    return () => offs.forEach((off) => off())
  }, [])

  const apply = useCallback(async (c?: LightConfig) => {
    const config = c ?? draft
    if (c) setDraft(c)
    setBusy(true)
    setError(null)
    const r = await window.isy.apply(config)
    setBusy(false)
    if (!r.ok) return setError(r.error)
    setSaved((s) => ({ ...s, config }))
    setApplied(config)
    setLastApply(new Date().toLocaleTimeString())
  }, [draft])

  const shared: Shared = { device, draft, applied, dpi, events, busy, error, setDraft, setDpiLevel: setDpi, apply }
  const pending = !applied || !same(draft, applied)

  return (
    <div className="app">
      <div className="titlebar">
        <img src={logo} alt="" />
        <b>Open ISY4500 Customizer</b>
        <span>ISY IGM 4500 WT · luz · DPI · botones</span>
      </div>
      <nav className="nav">
        {VIEWS.map((v, i) => (
          <button key={v.id} className={v.id === view ? 'on' : ''} onClick={() => setView(v.id)} data-view={v.id}>
            <span className="num">{String(i + 1).padStart(2, '0')}</span>
            {v.name}
          </button>
        ))}
        <label className="check foot">
          <input
            type="checkbox"
            checked={saved.reapplyOnStart}
            onChange={(e) => {
              const s = { ...saved, reapplyOnStart: e.target.checked }
              setSaved(s)
              void window.isy.save(s)
            }}
          />
          Reaplicar al abrir
        </label>
      </nav>
      <main className="main">
        {view === 'color' && <ColorView s={shared} />}
        {view === 'dpi' && <DpiView s={shared} />}
        {view === 'botones' && <ButtonsView s={shared} />}
      </main>
      <footer className="status">
        <span><span className={`dot ${device.connected ? 'ok' : ''}`} />{device.connected ? 'Ratón conectado' : 'Ratón no encontrado'}</span>
        <span className="mono">USB 30FA:1040{device.product ? ` · ${device.product}` : ''}</span>
        <span>DPI: {dpi === null ? '—' : `nivel ${dpi + 1} de 6`}</span>
        {pending && <span>{applied ? 'Cambios sin aplicar' : 'Pulsa «Aplicar» para mandar la configuración'}</span>}
        <span style={{ marginLeft: 'auto' }}>{lastApply ? `Aplicado ${lastApply}` : 'Sin cambios en esta sesión'}</span>
      </footer>
    </div>
  )
}
