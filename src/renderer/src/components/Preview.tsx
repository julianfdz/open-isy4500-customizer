import { modeById, quantize } from '../../../../lib/protocol.mjs'
import type { Shared } from '@/App'

/** Ratón visto desde arriba, iluminado con la configuración que se va a aplicar. */
export function MouseSvg({ color, mode }: { color: string; mode: string }): React.JSX.Element {
  const fill = mode === 'off' ? '#ffffff' : mode === 'static' || mode === 'breathing' ? quantize(color) : '#ff0000'
  return (
    <div className={`mousebox fx-${mode}`}>
      <svg viewBox="0 0 120 200" aria-label="Vista previa del ratón">
        <defs>
          <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        {/* halo de luz */}
        <g className="glow" style={{ fill }} opacity={mode === 'off' ? 0 : 1}>
          <path d="M14 70 Q8 150 32 184 L40 178 Q20 148 24 72 Z" filter="url(#blur)" />
          <path d="M106 70 Q112 150 88 184 L80 178 Q100 148 96 72 Z" filter="url(#blur)" />
          <rect x="54" y="30" width="12" height="34" rx="6" filter="url(#blur)" />
          <path d="M45 132 L60 116 L75 132 L60 152 Z" filter="url(#blur)" />
        </g>
        {/* carcasa */}
        <path d="M60 6 C28 6 14 34 14 80 L14 130 C14 172 34 194 60 194 C86 194 106 172 106 130 L106 80 C106 34 92 6 60 6 Z" fill="#fff" stroke="#000" strokeWidth="2.5" />
        <path d="M60 6 L60 76 M14 80 Q60 92 106 80" fill="none" stroke="#000" strokeWidth="1.5" />
        {/* tiras de luz, rueda y logo */}
        <g className="glow" style={{ fill }}>
          <path d="M17 78 Q13 146 34 182 L38 179 Q20 146 22 79 Z" stroke="#000" strokeWidth="1" />
          <path d="M103 78 Q107 146 86 182 L82 179 Q100 146 98 79 Z" stroke="#000" strokeWidth="1" />
          <path d="M45 132 L60 116 L75 132 L60 152 Z" stroke="#000" strokeWidth="1.5" />
        </g>
        <rect x="54" y="30" width="12" height="34" rx="6" fill="#fff" stroke="#000" strokeWidth="2" />
        <rect className="glow" x="57" y="36" width="6" height="22" rx="3" style={{ fill }} />
        <rect x="55" y="70" width="10" height="7" rx="2" fill="#000" />
      </svg>
    </div>
  )
}

export function Preview({ s }: { s: Shared }): React.JSX.Element {
  const m = modeById(s.draft.mode)
  const level = s.dpi ?? 0
  const pending = !s.applied || JSON.stringify(s.draft) !== JSON.stringify(s.applied)
  return (
    <aside className="preview">
      <MouseSvg color={s.draft.colors[level]} mode={s.draft.mode} />
      <div className="small muted" style={{ textAlign: 'center', marginTop: -4 }}>
        {m.name}{m.color ? ` · nivel de DPI ${level + 1}` : ''}
      </div>
      <div className="applybar">
        <button className="btn primary big" disabled={!s.device.connected || s.busy} onClick={() => void s.apply()} data-testid="apply">
          {s.busy ? 'Aplicando…' : 'Aplicar al ratón'}
        </button>
        <span className="pending">
          {!s.device.connected ? 'Conecta el ratón para aplicar.' : !s.applied ? 'Aún no has mandado nada al ratón en esta sesión.' : pending ? 'Hay cambios sin aplicar.' : 'El ratón tiene esta configuración.'}
        </span>
        {s.error && <div className="err">{s.error}</div>}
      </div>
      <p className="small muted">
        El ratón tiene 4 bits por canal (16 tonos de rojo, verde y azul): la vista previa ya muestra el color redondeado que verás.
      </p>
    </aside>
  )
}
