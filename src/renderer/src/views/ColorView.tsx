import { useState } from 'react'
import { BRIGHTNESS_MAX, DEFAULT_CONFIG, DPI_LEVELS, MODES, PRESETS, SPEED_MAX, modeById, parseHex, quantize } from '../../../../lib/protocol.mjs'
import type { LightConfig, Preset } from '@shared/types'
import type { Shared } from '@/App'
import { Preview } from '@/components/Preview'

const QUICK = ['#ffffff', '#ff0000', '#ff7700', '#ffff00', '#00ff00', '#00ffff', '#22e3ff', '#0000ff', '#9922ff', '#ff00ff', '#ff0077']
const toHex = (rgb: number[]): string => '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('')

const presetConfig = (p: Preset): LightConfig => ({ ...DEFAULT_CONFIG, ...p.config, colors: p.config.colors ?? DEFAULT_CONFIG.colors })

function Strip({ p }: { p: Preset }): React.JSX.Element {
  const c = presetConfig(p)
  const m = modeById(c.mode)
  if (m.id === 'off') return <div className="strip off" />
  if (!m.color) return <div className="strip rainbow" />
  return (
    <div className={`strip${m.id === 'breathing' ? ' breath' : ''}`}>
      {c.colors.map((col, i) => <i key={i} style={{ background: col }} />)}
    </div>
  )
}

export function ColorView({ s }: { s: Shared }): React.JSX.Element {
  const d = s.draft
  const m = modeById(d.mode)
  // A qué nivel de DPI va el color libre: todos o uno concreto.
  const [target, setTarget] = useState<'all' | number>('all')
  const shown = d.colors[target === 'all' ? s.dpi ?? 0 : target]
  const rgb = parseHex(shown)

  const set = (patch: Partial<LightConfig>): void => s.setDraft({ ...d, ...patch })
  const setColor = (hex: string): void => {
    const colors = d.colors.map((c, i) => (target === 'all' || target === i ? hex : c))
    s.setDraft({ ...d, mode: m.color ? d.mode : 'static', colors })
  }
  const presetOn = (p: Preset): boolean => JSON.stringify(presetConfig(p)) === JSON.stringify(s.applied)

  return (
    <>
      <div className="head">
        <div>
          <h2>Color</h2>
          <p>Elige un estilo hecho, un efecto de luz o tu propio color. Los estilos se aplican al pulsarlos; lo demás, con «Aplicar al ratón».</p>
        </div>
      </div>
      <div className="layout">
        <div className="col">
          <section className="box">
            <h3>Estilos preprogramados <span className="tag">un clic</span></h3>
            <div className="presets">
              {PRESETS.map((p) => (
                <button key={p.id} className={`preset${presetOn(p) ? ' on' : ''}`} disabled={!s.device.connected || s.busy} onClick={() => void s.apply(presetConfig(p))} data-preset={p.id}>
                  <Strip p={p} />
                  <span>{p.name}</span>
                  <small>{modeById(presetConfig(p).mode).name}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="box">
            <h3>Estilo de luz</h3>
            <div className="modes">
              {MODES.map((x) => (
                <button key={x.id} className={`mode${x.id === d.mode ? ' on' : ''}`} onClick={() => set({ mode: x.id })} data-mode={x.id}>
                  {x.name}
                  <small>{[x.color && 'color', x.speed && 'velocidad', x.brightness && 'brillo', x.direction && 'dirección'].filter(Boolean).join(' · ') || '—'}</small>
                </button>
              ))}
            </div>
            <div className="row" style={{ marginTop: 14, gap: 24, alignItems: 'flex-end' }}>
              <label className="param" style={{ minWidth: 200, opacity: m.brightness ? 1 : 0.35 }}>
                <span>Brillo</span><span className="mono">{d.brightness}/{BRIGHTNESS_MAX}</span>
                <input type="range" min={0} max={BRIGHTNESS_MAX} value={d.brightness} disabled={!m.brightness} onChange={(e) => set({ brightness: +e.target.value })} />
              </label>
              <label className="param" style={{ minWidth: 200, opacity: m.speed ? 1 : 0.35 }}>
                <span>Velocidad</span><span className="mono">{d.speed}/{SPEED_MAX}</span>
                <input type="range" min={0} max={SPEED_MAX} value={d.speed} disabled={!m.speed} onChange={(e) => set({ speed: +e.target.value })} />
              </label>
              <div className="col" style={{ gap: 4, opacity: m.direction ? 1 : 0.35 }}>
                <span className="small">Dirección</span>
                <div className="seg">
                  {['→', '←'].map((l, i) => (
                    <button key={l} className={d.direction === i ? 'on' : ''} disabled={!m.direction} onClick={() => set({ direction: i })}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="box" style={{ opacity: m.id === 'off' ? 0.5 : 1 }}>
            <h3>Color RGB libre {!m.color && <span className="tag">pasa a Estático</span>}</h3>
            <div className="rgb">
              <input type="color" className="picker" value={shown} onChange={(e) => setColor(e.target.value)} />
              <div className="col" style={{ gap: 9 }}>
                {(['R', 'G', 'B'] as const).map((ch, i) => (
                  <div key={ch} className="chan">
                    <span>{ch}</span>
                    <input type="range" min={0} max={255} step={17} value={rgb[i]} onChange={(e) => setColor(toHex(rgb.map((v, j) => (j === i ? +e.target.value : v))))} />
                    <span>{rgb[i]}</span>
                  </div>
                ))}
                <div className="row">
                  <input type="text" className="mono" style={{ width: 100 }} value={shown} onChange={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value) && setColor(e.target.value.toLowerCase())} />
                  <span className="small muted">se verá {quantize(shown)}</span>
                </div>
                <div className="swatches">
                  {QUICK.map((c) => <button key={c} style={{ background: c }} title={c} onClick={() => setColor(c)} />)}
                </div>
              </div>
            </div>
            <div className="col" style={{ gap: 6, marginTop: 14 }}>
              <span className="small">Aplicar el color a</span>
              <div className="levels">
                <button className={target === 'all' ? 'on' : ''} onClick={() => setTarget('all')}><i style={{ background: 'linear-gradient(90deg,#000,#fff)' }} />Todos</button>
                {Array.from({ length: DPI_LEVELS }, (_, i) => (
                  <button key={i} className={target === i ? 'on' : ''} onClick={() => setTarget(i)}>
                    <i style={{ background: d.colors[i] }} />DPI {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
        <Preview s={s} />
      </div>
    </>
  )
}
