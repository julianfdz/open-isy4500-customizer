import { DPI_LEVELS, modeById, quantize } from '../../../../lib/protocol.mjs'
import type { Shared } from '@/App'
import { Preview } from '@/components/Preview'

export function DpiView({ s }: { s: Shared }): React.JSX.Element {
  const d = s.draft
  const m = modeById(d.mode)
  const setColor = (i: number, hex: string): void =>
    s.setDraft({ ...d, mode: m.color ? d.mode : 'static', colors: d.colors.map((c, j) => (j === i ? hex : c)) })

  return (
    <>
      <div className="head">
        <div>
          <h2>DPI</h2>
          <p>
            El ratón tiene 6 niveles de DPI y cambia de uno a otro con el botón de detrás de la rueda. Cada nivel tiene su propio color:
            así sabes en cuál estás sin mirar la pantalla. El nivel activo se marca en vivo al pulsar el botón.
          </p>
        </div>
      </div>
      <div className="layout">
        <div className="col">
          {!m.color && (
            <div className="warn">
              El estilo actual ({m.name}) no usa colores por nivel. Al elegir un color aquí se pasa a «Estático».
            </div>
          )}
          <div className="dpis">
            {Array.from({ length: DPI_LEVELS }, (_, i) => (
              <div key={i} className={`dpi${s.dpi === i ? ' live' : ''}`} data-level={i}>
                {s.dpi === i && <span className="tag solid live-tag">activo</span>}
                <span className="small muted">Nivel</span>
                <span className="n">{i + 1}</span>
                <div className="sw" style={{ background: quantize(d.colors[i]) }}>
                  <input type="color" value={d.colors[i]} onChange={(e) => setColor(i, e.target.value)} title="Cambiar el color de este nivel" />
                </div>
                <span className="mono small">{quantize(d.colors[i])}</span>
              </div>
            ))}
          </div>
          <div className="row">
            <button className="btn" onClick={() => s.setDraft({ ...d, colors: Array(DPI_LEVELS).fill(d.colors[s.dpi ?? 0]) })}>
              Mismo color en todos
            </button>
            <button className="btn" onClick={() => s.setDraft({ ...d, mode: 'static', colors: ['#00ff00', '#77ff00', '#ffff00', '#ffaa00', '#ff5500', '#ff0000'] })}>
              Verde → rojo según DPI
            </button>
          </div>
          <section className="box soft">
            <h3>¿Y los valores de DPI?</h3>
            <p className="small">
              El nivel activo se lee en directo (el ratón lo avisa por USB en cada pulsación). Cambiar los valores de cada nivel (por ejemplo,
              800 → 1000 DPI) no está en el protocolo conocido de este chip: OpenRGB solo documenta la iluminación y la marca no publica
              software. No se envían comandos a ciegas al ratón, así que de momento los valores son los de fábrica.
            </p>
          </section>
        </div>
        <Preview s={s} />
      </div>
    </>
  )
}
