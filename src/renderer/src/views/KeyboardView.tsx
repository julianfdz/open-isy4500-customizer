import { useEffect, useMemo, useRef, useState } from 'react'
import {
  KB_BRIGHTNESS_MAX, KB_CALIB_LEDS, KB_COLORS, KB_KEYS, KB_MODES, KB_PRESETS, KB_RESTORE, KB_SPEED_MAX, KB_TEMPLATES, KB_TEXT_MAX,
  kbCodeLabel, kbKeysFromCalibration, kbModeById, kbPreset, kbText
} from '../../../../lib/keyboard-protocol.mjs'
import type { KbCalibEntry, KbKey } from '../../../../lib/keyboard-protocol.mjs'
import type { KbSaved } from '@shared/types'

const DEFAULT_KB: KbSaved = { effect: { ...KB_RESTORE }, keys: kbPreset('wasd'), perKey: false }
const QUICK = ['#ffffff', '#ff0000', '#ff5a00', '#ffff00', '#00ff00', '#00ffff', '#0078ff', '#0000ff', '#9922ff', '#ff00ff', '#000000']

export function KeyboardView(): React.JSX.Element {
  const [status, setStatus] = useState<{ connected: boolean; product?: string }>({ connected: false })
  const [kb, setKb] = useState<KbSaved>(DEFAULT_KB)
  const [brush, setBrush] = useState('#0078ff')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [text, setText] = useState('BUHO')
  const [fg, setFg] = useState('#ff5a00')
  const [bg, setBg] = useState('#000000')
  const [textInfo, setTextInfo] = useState<string | null>(null)
  const [calibrating, setCalibrating] = useState(false)
  const painting = useRef(false)

  useEffect(() => {
    void window.isy.kbStatus().then(setStatus)
    void window.isy.saved().then((s) => s.keyboard && setKb({ ...DEFAULT_KB, ...s.keyboard }))
    const off = window.isy.onKb(setStatus)
    const up = (): void => void (painting.current = false)
    window.addEventListener('mouseup', up)
    return () => {
      off()
      window.removeEventListener('mouseup', up)
    }
  }, [])

  // Distribución: la calibrada de este teclado o, si no hay, la de OpenRGB (Genesis Thor 300).
  const keys: KbKey[] = useMemo(() => (kb.calibration?.length ? kbKeysFromCalibration(kb.calibration) : KB_KEYS), [kb.calibration])
  const rows = useMemo(() => Array.from({ length: 6 }, (_, r) => keys.filter((k) => k.row === r).sort((a, b) => a.col - b.col)), [keys])
  const m = kbModeById(kb.effect.mode)
  const setEffect = (patch: Partial<KbSaved['effect']>): void => setKb({ ...kb, perKey: false, effect: { ...kb.effect, ...patch } })
  const paint = (id: string): void => setKb((k) => ({ ...k, perKey: true, keys: { ...k.keys, [id]: brush } }))

  async function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>, okText: string): Promise<void> {
    setBusy(true)
    setMsg(null)
    const r = await fn()
    setBusy(false)
    setMsg(r.ok ? { ok: true, text: okText } : { ok: false, text: r.error })
  }
  const apply = (next: KbSaved, okText: string): Promise<void> => run(() => window.isy.kbApply(next), okText)

  async function finishCalibration(entries: KbCalibEntry[] | null): Promise<void> {
    setCalibrating(false)
    if (!entries) return void run(() => window.isy.kbRestore(), 'Calibración cancelada; luz restaurada.')
    const ck = kbKeysFromCalibration(entries)
    const next: KbSaved = { ...kb, calibration: entries, perKey: true, keys: kbPreset('wasd', ck) }
    setKb(next)
    await apply(next, `Teclado calibrado: ${entries.length} teclas con luz. Ya puedes usar plantillas y texto.`)
  }

  if (calibrating) return <Calibration onDone={(e) => void finishCalibration(e)} />

  return (
    <>
      <div className="head">
        <div>
          <h2>Teclado</h2>
          <p>
            Teclados RGB con chip Sino Wealth (USB 258A:0090). Solo cambia la luz: ninguna opción toca lo que hace cada tecla, así que tus
            atajos y macros siguen igual. El teclado recuerda el último efecto aunque lo desenchufes.
          </p>
        </div>
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <button className="btn" disabled={busy || !status.connected} onClick={() => setCalibrating(true)} title="Enseña a la app dónde está cada tecla de tu teclado">
            {kb.calibration?.length ? 'Recalibrar' : 'Calibrar mi teclado'}
          </button>
          <button
            className="btn"
            disabled={busy || !status.connected}
            onClick={() => {
              setKb({ ...kb, perKey: false, effect: { ...KB_RESTORE } })
              void run(() => window.isy.kbRestore(), 'Luz restaurada: estático rojo.')
            }}
            title="Vuelve a estático rojo, como lo tenías"
          >
            Restaurar luz
          </button>
        </div>
      </div>
      {!status.connected && <div className="warn" style={{ marginBottom: 14 }}>No encuentro el teclado (USB 258A:0090). Conéctalo y aparecerá solo.</div>}
      {status.connected && !kb.calibration?.length && (
        <div className="warn" style={{ marginBottom: 14 }}>
          Cada teclado con este chip coloca sus teclas a su manera. Los efectos funcionan ya, pero para pintar teclas, plantillas y texto
          pulsa <b>Calibrar mi teclado</b> (2-3 minutos): así la app sabe qué luz hay bajo cada tecla.
        </div>
      )}
      {msg && <div className={msg.ok ? 'warn' : 'err'} style={{ marginBottom: 14 }}>{msg.text}</div>}

      <div className="col">
        <section className="box">
          <h3>Efecto {!kb.perKey && <span className="tag solid">activo</span>}</h3>
          <div className="modes">
            {KB_MODES.filter((x) => !x.custom).map((x) => (
              <button key={x.id} className={`mode${!kb.perKey && x.id === kb.effect.mode ? ' on' : ''}`} onClick={() => setEffect({ mode: x.id })}>
                {x.name}
                <small>{x.color ? 'con color' : 'multicolor'}</small>
              </button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 14, gap: 24, alignItems: 'flex-end' }}>
            <div className="col" style={{ gap: 4, opacity: m.color ? 1 : 0.35 }}>
              <span className="small">Color</span>
              <div className="swatches">
                {KB_COLORS.map((c) => (
                  <button
                    key={c.id}
                    title={c.name}
                    disabled={!m.color}
                    style={{ background: c.css, outline: kb.effect.color === c.id ? '2px solid #000' : 'none', outlineOffset: 2 }}
                    onClick={() => setEffect({ color: c.id })}
                  />
                ))}
              </div>
            </div>
            <label className="param" style={{ minWidth: 180 }}>
              <span>Brillo</span><span className="mono">{kb.effect.brightness}/{KB_BRIGHTNESS_MAX}</span>
              <input type="range" min={0} max={KB_BRIGHTNESS_MAX} value={kb.effect.brightness} onChange={(e) => setKb({ ...kb, effect: { ...kb.effect, brightness: +e.target.value } })} />
            </label>
            <label className="param" style={{ minWidth: 180 }}>
              <span>Velocidad</span><span className="mono">{kb.effect.speed}/{KB_SPEED_MAX}</span>
              <input type="range" min={0} max={KB_SPEED_MAX} value={kb.effect.speed} onChange={(e) => setEffect({ speed: +e.target.value })} />
            </label>
            <button className="btn primary" disabled={busy || !status.connected} onClick={() => void apply({ ...kb, perKey: false }, `Efecto «${m.name}» aplicado.`)}>
              Aplicar efecto
            </button>
          </div>
        </section>

        <section className="box">
          <h3>
            Tecla a tecla {kb.perKey && <span className="tag solid">activo</span>}
            <span className="tag">{kb.calibration?.length ? `tu teclado · ${keys.length} teclas` : 'distribución de ejemplo'}</span>
          </h3>
          <div className="kbtpl">
            {[...KB_TEMPLATES.map((t) => ({ id: t.id, name: t.name, cols: t.colors(keys) })), ...KB_PRESETS.map((p) => ({ id: p.id, name: p.name, cols: kbPreset(p.id, keys) }))].map((t) => (
              <button key={t.id} className="preset" onClick={() => setKb({ ...kb, perKey: true, keys: t.cols })} title={t.name}>
                <div className="strip">{(rows[2].length ? rows[2] : keys).map((k) => <i key={k.id} style={{ background: t.cols[k.id] }} />)}</div>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
          <div className="row" style={{ margin: '12px 0', gap: 12 }}>
            <span className="small">Texto en el teclado</span>
            <input type="text" className="mono" maxLength={KB_TEXT_MAX} value={text} onChange={(e) => setText(e.target.value.toUpperCase())} style={{ width: 110, letterSpacing: '.15em' }} />
            <label className="row small" style={{ gap: 6 }}>letras <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} style={{ width: 36, height: 26, border: '1px solid #000', padding: 0 }} /></label>
            <label className="row small" style={{ gap: 6 }}>fondo <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: 36, height: 26, border: '1px solid #000', padding: 0 }} /></label>
            <button
              className="btn"
              disabled={!text.trim()}
              onClick={() => {
                try {
                  const r = kbText(text, fg, bg, keys)
                  setKb({ ...kb, perKey: true, keys: r.colors })
                  setTextInfo(r.lost ? `${r.lost} de ${r.total} puntos caen en huecos del teclado.` : 'Cabe entero.')
                } catch (e) {
                  setTextInfo((e as Error).message)
                }
              }}
            >
              Dibujar texto
            </button>
            {textInfo && <span className="small muted">{textInfo}</span>}
          </div>
          <div className="row" style={{ marginBottom: 12, gap: 16 }}>
            <label className="row small" style={{ gap: 8 }}>
              Pincel <input type="color" value={brush} onChange={(e) => setBrush(e.target.value)} style={{ width: 44, height: 28, border: '1px solid #000', padding: 0 }} />
            </label>
            <div className="swatches">
              {QUICK.map((c) => <button key={c} title={c} style={{ background: c, outline: brush === c ? '2px solid #000' : 'none', outlineOffset: 2 }} onClick={() => setBrush(c)} />)}
            </div>
            <button className="btn" onClick={() => setKb({ ...kb, perKey: true, keys: Object.fromEntries(keys.map((k) => [k.id, brush])) })}>Pintar todas</button>
          </div>
          <div className="kbd" onMouseLeave={() => void (painting.current = false)}>
            {rows.map((row, r) => (
              <div key={r} className="kbrow">
                {row.map((k, i) => {
                  const gap = i === 0 ? k.col : k.col - row[i - 1].col - 1
                  const c = kb.keys[k.id] ?? '#000000'
                  return (
                    <button
                      key={k.id}
                      className="kkey"
                      title={`${k.label || 'Espacio'} · LED ${k.idx}`}
                      style={{ marginLeft: gap > 0 ? `calc(${Math.min(gap, 1.5)} * var(--u) * 0.6)` : undefined, width: `calc(${k.w} * var(--u))`, ['--kc' as string]: c }}
                      onMouseDown={() => { painting.current = true; paint(k.id) }}
                      onMouseEnter={() => painting.current && paint(k.id)}
                    >
                      <span>{k.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" disabled={busy || !status.connected} onClick={() => void apply({ ...kb, perKey: true }, 'Teclas aplicadas.')}>
              Aplicar teclas
            </button>
            <span className="small muted">
              Pinta haciendo clic o arrastrando. Las teclas en negro quedan apagadas (en un teclado el negro es «luz apagada»): el texto se lee mejor
              encendido sobre fondo apagado.
            </span>
          </div>
        </section>
      </div>
    </>
  )
}

/** Asistente: enciende un LED cada vez y el usuario pulsa la tecla iluminada. */
function Calibration({ onDone }: { onDone: (entries: KbCalibEntry[] | null) => void }): React.JSX.Element {
  const [i, setI] = useState(0)
  const [entries, setEntries] = useState<KbCalibEntry[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const led = KB_CALIB_LEDS[i]
  const state = useRef({ i, entries, ready })
  state.current = { i, entries, ready }

  // Apaga todo y enciende el primer LED.
  useEffect(() => {
    void (async () => {
      const a = await window.isy.kbCalibStart()
      const b = a.ok ? await window.isy.kbCalibStep(null, KB_CALIB_LEDS[0]) : a
      if (!b.ok) setError(b.error)
      else setReady(true)
    })()
  }, [])

  async function go(next: number, list: KbCalibEntry[]): Promise<void> {
    const prev = KB_CALIB_LEDS[state.current.i]
    setEntries(list)
    if (next >= KB_CALIB_LEDS.length) return onDone(list)
    setI(next)
    const r = await window.isy.kbCalibStep(prev, KB_CALIB_LEDS[next])
    if (!r.ok) setError(r.error)
  }
  const record = (code: string): void => {
    const { i: ci, entries: list } = state.current
    const led = KB_CALIB_LEDS[ci]
    void go(ci + 1, [...list.filter((e) => e.led !== led), { led, code }])
  }
  const skip = (): void => void go(state.current.i + 1, state.current.entries)
  const back = (): void => {
    const { i: ci, entries: list } = state.current
    if (ci === 0) return
    const prevLed = KB_CALIB_LEDS[ci - 1]
    void (async () => {
      setI(ci - 1)
      setEntries(list.filter((e) => e.led !== prevLed))
      await window.isy.kbCalibStep(KB_CALIB_LEDS[ci], prevLed)
    })()
  }

  // La tecla que pulse el usuario es la que está encendida. AltGr llega como Ctrl izquierdo + AltGr casi a la vez:
  // se espera un instante antes de apuntar un Ctrl izquierdo por si detrás viene AltGr.
  const pendingCtrl = useRef<number | null>(null)
  const lastAt = useRef(0)
  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      e.preventDefault()
      e.stopPropagation()
      if (!state.current.ready || e.repeat) return
      const code = e.code || e.key
      if (code === 'ControlLeft') {
        pendingCtrl.current = window.setTimeout(() => {
          pendingCtrl.current = null
          lastAt.current = Date.now()
          record('ControlLeft')
        }, 60)
        return
      }
      if (pendingCtrl.current !== null) {
        clearTimeout(pendingCtrl.current)
        pendingCtrl.current = null
      }
      // Rebotes: dos teclas en menos de 120 ms no pueden ser dos pasos distintos.
      if (Date.now() - lastAt.current < 120) return
      lastAt.current = Date.now()
      record(code)
    }
    window.addEventListener('keydown', down, true)
    return () => window.removeEventListener('keydown', down, true)
  }, [])

  const last = entries[entries.length - 1]
  return (
    <>
      <div className="head">
        <div>
          <h2>Calibrar el teclado</h2>
          <p>
            Se enciende una luz blanca cada vez. <b>Pulsa la tecla que esté encendida.</b> Si no ves ninguna encendida, usa «No se ve ninguna»
            con el ratón. Fn no llega al ordenador y Windows o Bloq Mayús a veces tampoco: si se encienden, usa sus botones.
          </p>
        </div>
      </div>
      {error && <div className="err" style={{ marginBottom: 12 }}>{error}</div>}
      <div className="box col" style={{ maxWidth: 720 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="big mono">LED {led}</span>
          <span className="muted">paso {i + 1} de {KB_CALIB_LEDS.length} · {entries.length} teclas encontradas</span>
        </div>
        <div className="calbar"><i style={{ width: `${((i + 1) / KB_CALIB_LEDS.length) * 100}%` }} /></div>
        <div className="row">
          <button className="btn primary" disabled={!ready} onClick={skip}>No se ve ninguna</button>
          <button className="btn" disabled={!ready} onClick={() => record('Fn')}>Es la tecla Fn</button>
          <button className="btn" disabled={!ready} onClick={() => record('MetaLeft')}>Es Windows</button>
          <button className="btn" disabled={!ready} onClick={() => record('CapsLock')}>Es Bloq Mayús</button>
          <button className="btn" disabled={!ready || i === 0} onClick={back}>Atrás</button>
          <span className="spacer" style={{ flex: 1 }} />
          <button className="btn" onClick={() => onDone(entries.length ? entries : null)}>{entries.length ? 'Terminar aquí' : 'Cancelar'}</button>
          <button className="btn" onClick={() => onDone(null)}>Cancelar</button>
        </div>
        <p className="small muted">
          {last ? `Último: LED ${last.led} = ${kbCodeLabel(last.code) || 'Espacio'}` : 'Aún no has pulsado ninguna tecla.'} Las teclas pulsadas aquí no escriben nada.
          Si pulsas la tecla de Windows y se abre el menú Inicio, ciérralo con Esc después de volver a esta ventana.
        </p>
      </div>
    </>
  )
}
