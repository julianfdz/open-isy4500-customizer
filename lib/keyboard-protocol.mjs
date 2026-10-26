/**
 * Teclado Sino Wealth 258A:0090 («SINO WEALTH Mechanical Keyboard»; OpenRGB lo soporta como Genesis Thor 300,
 * Controllers/SinowealthController/SinowealthKeyboard90Controller). Comprobado en el teclado del usuario el 26/10/2026.
 * Todo va por feature reports de 8 bytes con report ID 0x0A (interfaz 1, usage page 0xFF00, usage 2) y SOLO toca la luz:
 *   efecto:  0A 03 01 · 0A 0A MODO BRILLO VELOCIDAD COLOR
 *   tecla:   0A 0C 01 TECLA R G B   (en el modo personalizado 0x13) … y al final 0A 0C 01 89 00 00 00 (aplicar)
 * El teclado guarda el último efecto él solo: reenchufar no lo deshace (para eso está «Restaurar luz»).
 * Ningún comando cambia qué hace una tecla.
 */
export const KB_VID = 0x258a
export const KB_PID = 0x0090
export const KB_REPORT_ID = 0x0a
export const KB_COMMIT_KEY = 0x89
export const KB_BRIGHTNESS_MAX = 4
export const KB_SPEED_MAX = 4

/** Colores del firmware para los efectos (no hay RGB libre salvo en el modo personalizado). */
export const KB_COLORS = [
  { id: 'rojo', name: 'Rojo', value: 0, css: '#ff2020' },
  { id: 'verde', name: 'Verde', value: 1, css: '#20e020' },
  { id: 'azul', name: 'Azul', value: 2, css: '#2060ff' },
  { id: 'amarillo', name: 'Amarillo', value: 3, css: '#e8e020' },
  { id: 'violeta', name: 'Violeta', value: 4, css: '#b040ff' },
  { id: 'cian', name: 'Cian', value: 5, css: '#20e0e0' },
  { id: 'blanco', name: 'Blanco', value: 6, css: '#ffffff' },
  { id: 'arcoiris', name: 'Arcoíris', value: 7, css: 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f)' }
]

/** Efectos (valores de OpenRGB). color = admite elegir color. */
export const KB_MODES = [
  { id: 'estatico', name: 'Estático', value: 0x10, color: true },
  { id: 'respiracion', name: 'Respiración', value: 0x01, color: true },
  { id: 'arcoiris', name: 'Ola arcoíris', value: 0x04 },
  { id: 'prismo', name: 'Prismo', value: 0x00 },
  { id: 'flores', name: 'Flores', value: 0x03 },
  { id: 'giro-horario', name: 'Giro horario', value: 0x06 },
  { id: 'giro-antihorario', name: 'Giro antihorario', value: 0x09 },
  { id: 'reactivo', name: 'Reacción al pulsar', value: 0x08 },
  { id: 'reactivo-tecla', name: 'Reacción por tecla', value: 0x0f, color: true },
  { id: 'serpiente', name: 'Serpiente', value: 0x0a, color: true },
  { id: 'tornado', name: 'Tornado', value: 0x0c, color: true },
  { id: 'neon', name: 'Neón', value: 0x0d, color: true },
  { id: 'estrellas', name: 'Estrellas', value: 0x0e, color: true },
  { id: 'lluvia', name: 'Lluvia', value: 0x11, color: true },
  { id: 'ola-1', name: 'Ola 1', value: 0x02, color: true },
  { id: 'ola-2', name: 'Ola 2', value: 0x05 },
  { id: 'ola-3', name: 'Ola 3', value: 0x07, color: true },
  { id: 'ola-4', name: 'Ola 4', value: 0x0b, color: true },
  { id: 'ola-5', name: 'Ola 5', value: 0x12 },
  { id: 'personalizado', name: 'Tecla a tecla', value: 0x13, custom: true }
]

/** Teclas: idx = número de LED del teclado; row/col = posición en la rejilla de OpenRGB; w = ancho relativo. */
export const KB_KEYS = [
  {"id":"escape","label":"Esc","idx":1,"row":0,"col":0,"w":1},
  {"id":"f1","label":"F1","idx":3,"row":0,"col":2,"w":1},
  {"id":"f2","label":"F2","idx":4,"row":0,"col":3,"w":1},
  {"id":"f3","label":"F3","idx":5,"row":0,"col":4,"w":1},
  {"id":"f4","label":"F4","idx":6,"row":0,"col":5,"w":1},
  {"id":"f5","label":"F5","idx":7,"row":0,"col":6,"w":1},
  {"id":"f6","label":"F6","idx":8,"row":0,"col":7,"w":1},
  {"id":"f7","label":"F7","idx":9,"row":0,"col":8,"w":1},
  {"id":"f8","label":"F8","idx":10,"row":0,"col":9,"w":1},
  {"id":"f9","label":"F9","idx":11,"row":0,"col":10,"w":1},
  {"id":"f10","label":"F10","idx":12,"row":0,"col":11,"w":1},
  {"id":"f11","label":"F11","idx":13,"row":0,"col":12,"w":1},
  {"id":"f12","label":"F12","idx":15,"row":0,"col":13,"w":1},
  {"id":"print_screen","label":"Impr","idx":16,"row":0,"col":15,"w":1},
  {"id":"scroll_lock","label":"BloqDes","idx":17,"row":0,"col":16,"w":1},
  {"id":"pause_break","label":"Pausa","idx":18,"row":0,"col":17,"w":1},
  {"id":"back_tick","label":"º","idx":24,"row":1,"col":0,"w":1},
  {"id":"1","label":"1","idx":25,"row":1,"col":1,"w":1},
  {"id":"2","label":"2","idx":26,"row":1,"col":2,"w":1},
  {"id":"3","label":"3","idx":27,"row":1,"col":3,"w":1},
  {"id":"4","label":"4","idx":28,"row":1,"col":4,"w":1},
  {"id":"5","label":"5","idx":29,"row":1,"col":5,"w":1},
  {"id":"6","label":"6","idx":30,"row":1,"col":6,"w":1},
  {"id":"7","label":"7","idx":31,"row":1,"col":7,"w":1},
  {"id":"8","label":"8","idx":32,"row":1,"col":8,"w":1},
  {"id":"9","label":"9","idx":33,"row":1,"col":9,"w":1},
  {"id":"0","label":"0","idx":34,"row":1,"col":10,"w":1},
  {"id":"minus","label":"'","idx":35,"row":1,"col":11,"w":1},
  {"id":"equals","label":"¡","idx":36,"row":1,"col":12,"w":1},
  {"id":"backspace","label":"⌫","idx":38,"row":1,"col":13,"w":2},
  {"id":"insert","label":"Ins","idx":39,"row":1,"col":15,"w":1},
  {"id":"home","label":"Inicio","idx":40,"row":1,"col":16,"w":1},
  {"id":"page_up","label":"RePág","idx":41,"row":1,"col":17,"w":1},
  {"id":"numpad_lock","label":"BloqNum","idx":42,"row":1,"col":19,"w":1},
  {"id":"numpad_divide","label":"/","idx":43,"row":1,"col":20,"w":1},
  {"id":"numpad_times","label":"*","idx":44,"row":1,"col":21,"w":1},
  {"id":"numpad_minus","label":"-","idx":45,"row":1,"col":22,"w":1},
  {"id":"tab","label":"Tab","idx":47,"row":2,"col":0,"w":1.5},
  {"id":"q","label":"Q","idx":48,"row":2,"col":1,"w":1},
  {"id":"w","label":"W","idx":49,"row":2,"col":2,"w":1},
  {"id":"e","label":"E","idx":50,"row":2,"col":3,"w":1},
  {"id":"r","label":"R","idx":51,"row":2,"col":4,"w":1},
  {"id":"t","label":"T","idx":52,"row":2,"col":5,"w":1},
  {"id":"y","label":"Y","idx":53,"row":2,"col":6,"w":1},
  {"id":"u","label":"U","idx":54,"row":2,"col":7,"w":1},
  {"id":"i","label":"I","idx":55,"row":2,"col":8,"w":1},
  {"id":"o","label":"O","idx":56,"row":2,"col":9,"w":1},
  {"id":"p","label":"P","idx":57,"row":2,"col":10,"w":1},
  {"id":"left_bracket","label":"`","idx":58,"row":2,"col":11,"w":1},
  {"id":"right_bracket","label":"+","idx":59,"row":2,"col":12,"w":1},
  {"id":"delete","label":"Supr","idx":62,"row":2,"col":15,"w":1},
  {"id":"end","label":"Fin","idx":63,"row":2,"col":16,"w":1},
  {"id":"page_down","label":"AvPág","idx":64,"row":2,"col":17,"w":1},
  {"id":"numpad_7","label":"7","idx":65,"row":2,"col":19,"w":1},
  {"id":"numpad_8","label":"8","idx":66,"row":2,"col":20,"w":1},
  {"id":"numpad_9","label":"9","idx":67,"row":2,"col":21,"w":1},
  {"id":"caps_lock","label":"Bloq","idx":70,"row":3,"col":0,"w":1.75},
  {"id":"a","label":"A","idx":71,"row":3,"col":1,"w":1},
  {"id":"s","label":"S","idx":72,"row":3,"col":2,"w":1},
  {"id":"d","label":"D","idx":73,"row":3,"col":3,"w":1},
  {"id":"f","label":"F","idx":74,"row":3,"col":4,"w":1},
  {"id":"g","label":"G","idx":75,"row":3,"col":5,"w":1},
  {"id":"h","label":"H","idx":76,"row":3,"col":6,"w":1},
  {"id":"j","label":"J","idx":77,"row":3,"col":7,"w":1},
  {"id":"k","label":"K","idx":78,"row":3,"col":8,"w":1},
  {"id":"l","label":"L","idx":79,"row":3,"col":9,"w":1},
  {"id":"semicolon","label":"Ñ","idx":80,"row":3,"col":10,"w":1},
  {"id":"quote","label":"´","idx":81,"row":3,"col":11,"w":1},
  {"id":"ansi_back_slash","label":"Ç","idx":82,"row":3,"col":12,"w":1.5},
  {"id":"ansi_enter","label":"Intro","idx":84,"row":3,"col":13,"w":2.25},
  {"id":"numpad_4","label":"4","idx":88,"row":3,"col":19,"w":1},
  {"id":"numpad_5","label":"5","idx":89,"row":3,"col":20,"w":1},
  {"id":"numpad_6","label":"6","idx":90,"row":3,"col":21,"w":1},
  {"id":"numpad_plus","label":"+","idx":68,"row":3,"col":22,"w":1},
  {"id":"left_shift","label":"Mayús","idx":93,"row":4,"col":0,"w":2.25},
  {"id":"z","label":"Z","idx":95,"row":4,"col":2,"w":1},
  {"id":"x","label":"X","idx":96,"row":4,"col":3,"w":1},
  {"id":"c","label":"C","idx":97,"row":4,"col":4,"w":1},
  {"id":"v","label":"V","idx":98,"row":4,"col":5,"w":1},
  {"id":"b","label":"B","idx":99,"row":4,"col":6,"w":1},
  {"id":"n","label":"N","idx":100,"row":4,"col":7,"w":1},
  {"id":"m","label":"M","idx":101,"row":4,"col":8,"w":1},
  {"id":"comma","label":",","idx":102,"row":4,"col":9,"w":1},
  {"id":"period","label":".","idx":103,"row":4,"col":10,"w":1},
  {"id":"forward_slash","label":"-","idx":104,"row":4,"col":11,"w":1},
  {"id":"right_shift","label":"Mayús","idx":107,"row":4,"col":13,"w":2.75},
  {"id":"up_arrow","label":"↑","idx":109,"row":4,"col":16,"w":1},
  {"id":"numpad_1","label":"1","idx":111,"row":4,"col":19,"w":1},
  {"id":"numpad_2","label":"2","idx":112,"row":4,"col":20,"w":1},
  {"id":"numpad_3","label":"3","idx":113,"row":4,"col":21,"w":1},
  {"id":"left_control","label":"Ctrl","idx":116,"row":5,"col":0,"w":1.25},
  {"id":"left_windows","label":"Win","idx":117,"row":5,"col":1,"w":1.25},
  {"id":"left_alt","label":"Alt","idx":118,"row":5,"col":2,"w":1.25},
  {"id":"space","label":"","idx":121,"row":5,"col":6,"w":6.25},
  {"id":"right_alt","label":"AltGr","idx":124,"row":5,"col":10,"w":1.25},
  {"id":"right_function","label":"Fn","idx":125,"row":5,"col":11,"w":1.25},
  {"id":"menu","label":"Menú","idx":126,"row":5,"col":12,"w":1.25},
  {"id":"right_control","label":"Ctrl","idx":128,"row":5,"col":13,"w":1.25},
  {"id":"left_arrow","label":"←","idx":131,"row":5,"col":15,"w":1},
  {"id":"down_arrow","label":"↓","idx":132,"row":5,"col":16,"w":1},
  {"id":"right_arrow","label":"→","idx":133,"row":5,"col":17,"w":1},
  {"id":"numpad_0","label":"0","idx":134,"row":5,"col":19,"w":2},
  {"id":"numpad_period","label":".","idx":136,"row":5,"col":21,"w":1},
  {"id":"numpad_enter","label":"Intro","idx":114,"row":5,"col":22,"w":1}
]


/** Posición física: x = borde izquierdo y w = ancho en unidades de tecla; h = alto en filas (Intro y + del numérico). */
const PHYS = {
  escape: 0, f1: 2, f2: 3, f3: 4, f4: 5, f5: 6.5, f6: 7.5, f7: 8.5, f8: 9.5, f9: 11, f10: 12, f11: 13, f12: 14,
  print_screen: 15.25, scroll_lock: 16.25, pause_break: 17.25,
  back_tick: 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 10, minus: 11, equals: 12, backspace: 13,
  insert: 15.25, home: 16.25, page_up: 17.25, numpad_lock: 18.5, numpad_divide: 19.5, numpad_times: 20.5, numpad_minus: 21.5,
  tab: 0, q: 1.5, w: 2.5, e: 3.5, r: 4.5, t: 5.5, y: 6.5, u: 7.5, i: 8.5, o: 9.5, p: 10.5, left_bracket: 11.5, right_bracket: 12.5,
  delete: 15.25, end: 16.25, page_down: 17.25, numpad_7: 18.5, numpad_8: 19.5, numpad_9: 20.5, numpad_plus: 21.5,
  caps_lock: 0, a: 1.75, s: 2.75, d: 3.75, f: 4.75, g: 5.75, h: 6.75, j: 7.75, k: 8.75, l: 9.75, semicolon: 10.75, quote: 11.75,
  ansi_back_slash: 12.75, ansi_enter: 13.75, numpad_4: 18.5, numpad_5: 19.5, numpad_6: 20.5,
  left_shift: 0, z: 2.25, x: 3.25, c: 4.25, v: 5.25, b: 6.25, n: 7.25, m: 8.25, comma: 9.25, period: 10.25, forward_slash: 11.25,
  right_shift: 12.25, up_arrow: 16.25, numpad_1: 18.5, numpad_2: 19.5, numpad_3: 20.5, numpad_enter: 21.5,
  left_control: 0, left_windows: 1.25, left_alt: 2.5, space: 3.75, right_alt: 10, right_function: 11.25, menu: 12.5, right_control: 13.75,
  left_arrow: 15.25, down_arrow: 16.25, right_arrow: 17.25, numpad_0: 18.5, numpad_period: 20.5
}
const PHYS_W = { backspace: 2, tab: 1.5, caps_lock: 1.75, ansi_enter: 1.25, left_shift: 2.25, right_shift: 2.75, left_control: 1.25,
  left_windows: 1.25, left_alt: 1.25, space: 6.25, right_alt: 1.25, right_function: 1.25, menu: 1.25, right_control: 1.25, numpad_0: 2 }
// Teclas de dos filas: el Intro ISO empieza en la fila de Q y el + y el Intro del numérico bajan una fila.
const PHYS_TALL = { ansi_enter: 2, numpad_plus: 2, numpad_enter: 2 }
const PHYS_TOP = { ansi_enter: 2, numpad_plus: 2, numpad_enter: 4 }
for (const k of KB_KEYS) {
  k.x = PHYS[k.id] ?? k.col
  k.w = PHYS_W[k.id] ?? 1
  k.top = PHYS_TOP[k.id] ?? k.row
  k.h = PHYS_TALL[k.id] ?? 1
}


/** KeyboardEvent.code de cada tecla de la distribución de fábrica (las plantillas trabajan con códigos). */
const ID_CODE = {
  escape: 'Escape', back_tick: 'Backquote', minus: 'Minus', equals: 'Equal', backspace: 'Backspace', insert: 'Insert', home: 'Home',
  page_up: 'PageUp', numpad_lock: 'NumLock', numpad_divide: 'NumpadDivide', numpad_times: 'NumpadMultiply', numpad_minus: 'NumpadSubtract',
  tab: 'Tab', left_bracket: 'BracketLeft', right_bracket: 'BracketRight', delete: 'Delete', end: 'End', page_down: 'PageDown',
  numpad_plus: 'NumpadAdd', caps_lock: 'CapsLock', semicolon: 'Semicolon', quote: 'Quote', ansi_back_slash: 'Backslash', ansi_enter: 'Enter',
  left_shift: 'ShiftLeft', comma: 'Comma', period: 'Period', forward_slash: 'Slash', right_shift: 'ShiftRight', up_arrow: 'ArrowUp',
  numpad_enter: 'NumpadEnter', left_control: 'ControlLeft', left_windows: 'MetaLeft', left_alt: 'AltLeft', space: 'Space', right_alt: 'AltRight',
  right_function: 'Fn', menu: 'ContextMenu', right_control: 'ControlRight', left_arrow: 'ArrowLeft', down_arrow: 'ArrowDown',
  right_arrow: 'ArrowRight', numpad_period: 'NumpadDecimal', print_screen: 'PrintScreen', scroll_lock: 'ScrollLock', pause_break: 'Pause'
}
for (const k of KB_KEYS) {
  k.code = ID_CODE[k.id] ?? (/^f\d+$/.test(k.id) ? k.id.toUpperCase() : /^\d$/.test(k.id) ? `Digit${k.id}` : /^numpad_\d$/.test(k.id) ? `Numpad${k.id.slice(7)}` : /^[a-z]$/.test(k.id) ? `Key${k.id.toUpperCase()}` : k.id)
}

/** Lo que se pone con «Restaurar luz»: como lo tenía el usuario (estático rojo). */
export const KB_RESTORE = { mode: 'estatico', brightness: 4, speed: 2, color: 'rojo' }

export function kbModeById(id) {
  const m = KB_MODES.find((x) => x.id === id)
  if (!m) throw new Error(`Efecto desconocido: ${id}. Efectos: ${KB_MODES.map((x) => x.id).join(', ')}`)
  return m
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)))
const pad = (p) => { while (p.length < 8) p.push(0); return p }

/** Paquetes de un efecto. */
export function kbModePackets({ mode, brightness = 4, speed = 2, color = 'arcoiris' }) {
  const m = kbModeById(mode)
  const c = KB_COLORS.find((x) => x.id === color) ?? KB_COLORS[7]
  return [
    pad([KB_REPORT_ID, 0x03, 0x01]),
    pad([KB_REPORT_ID, 0x0a, m.value, clamp(brightness, 0, KB_BRIGHTNESS_MAX), clamp(speed, 0, KB_SPEED_MAX), m.color ? c.value : 7])
  ]
}

/** Paquetes del modo tecla a tecla: colors = { idTecla: '#rrggbb' } (las que falten, apagadas). */
export function kbKeyPackets(colors, brightness = 4, keys = KB_KEYS) {
  const out = kbModePackets({ mode: 'personalizado', brightness })
  for (const k of keys) {
    const hex = colors[k.id] ?? '#000000'
    const m = /^#?([0-9a-f]{6})$/i.exec(hex)
    if (!m) throw new Error(`Color no válido para ${k.id}: ${hex}`)
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
    out.push(pad([KB_REPORT_ID, 0x0c, 0x01, k.idx, r, g, b]))
  }
  out.push(pad([KB_REPORT_ID, 0x0c, 0x01, KB_COMMIT_KEY]))
  return out
}

/** Estilos de teclas hechos (por código de tecla, sirven para cualquier distribución). */
const maxCol = (keys) => Math.max(1, ...keys.map((k) => k.col))
export function kbPreset(id, keys = KB_KEYS) {
  const all = (c) => Object.fromEntries(keys.map((k) => [k.id, c]))
  const byCode = (base, map) => {
    const o = { ...base }
    for (const k of keys) if (map[k.code]) o[k.id] = map[k.code]
    return o
  }
  const hsl = (h) => {
    const f = (n) => { const k = (n + h / 30) % 12; const v = 1 - Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(v * 255) }
    return '#' + [f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, '0')).join('')
  }
  const mc = maxCol(keys)
  switch (id) {
    case 'wasd': return byCode(all('#000000'), { KeyW: '#0078ff', KeyA: '#0078ff', KeyS: '#0078ff', KeyD: '#0078ff', Escape: '#ff0000' })
    case 'gamer': return byCode(all('#200000'), { KeyW: '#ff0000', KeyA: '#ff0000', KeyS: '#ff0000', KeyD: '#ff0000', Space: '#ff5500', ShiftLeft: '#ff5500', ControlLeft: '#ff5500', Digit1: '#ffaa00', Digit2: '#ffaa00', Digit3: '#ffaa00', Digit4: '#ffaa00' })
    case 'arcoiris': return Object.fromEntries(keys.map((k) => [k.id, hsl((k.col / mc) * 330)]))
    case 'zonas': return Object.fromEntries(keys.map((k) => [k.id, k.row === 0 ? '#ff0000' : /^(Numpad|NumLock)/.test(k.code ?? '') ? '#00aaff' : /^(Arrow|Insert|Delete|Home|End|Page)/.test(k.code ?? '') ? '#ffaa00' : '#ffffff']))
    case 'apagado': return all('#000000')
    default: return all('#ffffff')
  }
}
export const KB_PRESETS = [
  { id: 'wasd', name: 'WASD azul' },
  { id: 'gamer', name: 'Gamer rojo' },
  { id: 'arcoiris', name: 'Arcoíris por columnas' },
  { id: 'zonas', name: 'Zonas' },
  { id: 'blanco', name: 'Todo blanco' },
  { id: 'apagado', name: 'Todo apagado' }
]

/*
 * Texto en el teclado: letras de 3×4 teclas en las cuatro filas centrales (números, Q, A, Z), que están completas en el
 * bloque principal y en el numérico. Cada letra busca su columna (en orden) para no caer en huecos ni en teclas anchas.
 */
const FONT = {
  A: ['.X.', 'X.X', 'XXX', 'X.X'], B: ['X..', 'XXX', 'X.X', 'XXX'], C: ['XXX', 'X..', 'X..', 'XXX'], D: ['XX.', 'X.X', 'X.X', 'XX.'],
  E: ['XXX', 'XX.', 'X..', 'XXX'], F: ['XXX', 'XX.', 'X..', 'X..'], G: ['XXX', 'X..', 'X.X', 'XXX'], H: ['X.X', 'XXX', 'X.X', 'X.X'],
  I: ['XXX', '.X.', '.X.', 'XXX'], J: ['..X', '..X', 'X.X', 'XXX'], K: ['X.X', 'XX.', 'X.X', 'X.X'], L: ['X..', 'X..', 'X..', 'XXX'],
  M: ['XXX', 'XXX', 'X.X', 'X.X'], N: ['XX.', 'X.X', 'X.X', 'X.X'], O: ['XXX', 'X.X', 'X.X', 'XXX'], P: ['XXX', 'X.X', 'XXX', 'X..'],
  Q: ['XXX', 'X.X', 'XXX', '..X'], R: ['XXX', 'X.X', 'XX.', 'X.X'], S: ['.XX', 'X..', '..X', 'XX.'], T: ['XXX', '.X.', '.X.', '.X.'],
  U: ['X.X', 'X.X', 'X.X', 'XXX'], V: ['X.X', 'X.X', 'X.X', '.X.'], W: ['X.X', 'X.X', 'XXX', 'XXX'], X: ['X.X', '.X.', '.X.', 'X.X'],
  Y: ['X.X', '.X.', '.X.', '.X.'], Z: ['XXX', '.X.', 'X..', 'XXX'], Ñ: ['XXX', 'XX.', 'X.X', 'X.X'],
  0: ['XXX', 'X.X', 'X.X', 'XXX'], 1: ['XX.', '.X.', '.X.', 'XXX'], 2: ['XX.', '..X', 'X..', 'XXX'], 3: ['XXX', '.XX', '..X', 'XXX'],
  4: ['X.X', 'XXX', '..X', '..X'], 5: ['XXX', 'XX.', '..X', 'XX.'], 6: ['X..', 'XXX', 'X.X', 'XXX'], 7: ['XXX', '..X', '.X.', '.X.'],
  8: ['XXX', 'XXX', 'X.X', 'XXX'], 9: ['XXX', 'X.X', 'XXX', '..X'], ' ': ['...', '...', '...', '...'], '!': ['.X.', '.X.', '...', '.X.'],
  '-': ['...', 'XXX', '...', '...'], '♥': ['X.X', 'XXX', '.X.', '...']
}
export const KB_TEXT_MAX = 5
export const kbTextChars = Object.keys(FONT).join('')
const TEXT_TOP = 1

/**
 * Columna «visual» de cada tecla para dibujar texto. En la matriz del firmware el numérico de la fila de abajo no coincide con
 * lo que se ve (el 0 es ancho y comparte columnas con las flechas), así que el numérico se recoloca a partir del 7:
 * columna 0 = BloqNum/7/4/1/0, 1 = / 8 5 2 (y la mitad derecha del 0), 2 = * 9 6 3 ., 3 = - + Intro.
 */
const NUMPAD_COL = {
  NumLock: 0, Numpad7: 0, Numpad4: 0, Numpad1: 0, Numpad0: 0,
  NumpadDivide: 1, Numpad8: 1, Numpad5: 1, Numpad2: 1,
  NumpadMultiply: 2, Numpad9: 2, Numpad6: 2, Numpad3: 2, NumpadDecimal: 2,
  NumpadSubtract: 3, NumpadAdd: 3, NumpadEnter: 3
}
function textGrid(keys) {
  const n7 = keys.find((k) => k.code === 'Numpad7')
  return keys
    .map((k) => {
      const nc = NUMPAD_COL[k.code]
      if (n7 && nc !== undefined) return { k, row: k.row, x: n7.col + nc, w: k.code === 'Numpad0' ? 2 : 1 }
      return { k, row: k.row, x: k.col, w: 1 }
    })
    // Las flechas que en la matriz caen en columnas del numérico no se ven ahí: fuera del dibujo de texto.
    .filter((g) => !n7 || NUMPAD_COL[g.k.code] !== undefined || g.x < n7.col || g.x > n7.col + 3)
}

/**
 * Colores para dibujar un texto: teclas del texto en fg, el resto en bg. Devuelve también cuántos píxeles se pierden.
 * Cada letra busca su columna (en orden) y puede bajar una fila si así cae mejor. Se evita Bloq Num (su luz de estado tapa
 * el color) y las teclas anchas del bloque principal (Mayús, Intro, ⌫).
 */
export function kbText(text, fg = '#000000', bg = '#ff9900', keys = KB_KEYS) {
  if (!text || text.length > KB_TEXT_MAX) throw new Error(`El texto tiene que tener entre 1 y ${KB_TEXT_MAX} caracteres.`)
  const glyphs = [...text.toUpperCase()].map((ch) => {
    const g = FONT[ch]
    if (!g) throw new Error(`Carácter no disponible: «${ch}». Disponibles: ${kbTextChars}`)
    const px = []
    g.forEach((line, r) => [...line].forEach((v, c) => v === 'X' && px.push([r, c])))
    return px
  })
  const grid = textGrid(keys)
  const cellKey = (r, c) => grid.find((g) => g.row === r && c >= g.x && c < g.x + g.w)?.k
  const cols = Math.max(...grid.map((g) => g.x + g.w))
  const memo = new Map()
  const evalGlyph = (gi, top, left) => {
    const id = `${gi},${top},${left}`
    if (memo.has(id)) return memo.get(id)
    let score = 0
    const on = new Set()
    for (const [r, c] of glyphs[gi]) {
      const k = cellKey(r + top, c + left)
      if (!k) continue
      on.add(k.id)
      score += k.code === 'NumLock' ? -3 : k.w > 1.5 ? -1 : 1
    }
    const res = { score, on, hit: on.size }
    memo.set(id, res)
    return res
  }
  let best = null
  const place = (i, minLeft, chosen, score) => {
    if (i === glyphs.length) {
      const lefts = chosen.map((c) => c.left)
      const shifted = chosen.filter((c) => c.top !== chosen[0].top).length
      const total = score * 100 - (lefts[lefts.length - 1] - lefts[0]) * 2 - lefts[0] - shifted * 30
      if (!best || total > best.total) best = { chosen: [...chosen], total }
      return
    }
    for (const top of [TEXT_TOP, TEXT_TOP + 1]) {
      for (let left = minLeft; left + 3 <= cols; left++) {
        chosen.push({ top, left })
        place(i + 1, left + 4, chosen, score + evalGlyph(i, top, left).score)
        chosen.pop()
      }
    }
  }
  place(0, 0, [], 0)
  if (!best) throw new Error('El teclado es demasiado estrecho para ese texto.')
  const colors = Object.fromEntries(keys.map((k) => [k.id, bg]))
  let hit = 0
  best.chosen.forEach((c, i) => {
    for (const [r, cc] of glyphs[i]) {
      const k = cellKey(r + c.top, cc + c.left)
      if (k && k.code !== 'NumLock') { colors[k.id] = fg; hit++ }
    }
  })
  const total = glyphs.reduce((n, px) => n + px.length, 0)
  return { colors, lost: Math.max(0, total - hit), total }
}

/** Plantillas de color por filas o columnas (degradados). */
function gradient(stops, by, keys) {
  const lerp = (a, b, t) => Math.round(a + (b - a) * t)
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const max = by === 'row' ? 5 : maxCol(keys)
  const o = {}
  for (const k of keys) {
    const t = (by === 'row' ? k.row : k.col) / max
    const seg = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)))
    const lt = t * (stops.length - 1) - seg
    const [a, b] = [rgb(stops[seg]), rgb(stops[seg + 1])]
    o[k.id] = '#' + [0, 1, 2].map((i) => lerp(a[i], b[i], lt).toString(16).padStart(2, '0')).join('')
  }
  return o
}

/** Plantillas «chulas» (además de los estilos básicos de kbPreset). colors(keys) vale para cualquier distribución. */
const MODS = ['ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'MetaLeft', 'Tab', 'Escape', 'Enter', 'Backspace', 'Fn']
export const KB_TEMPLATES = [
  { id: 'buho', name: 'BUHO dorado', colors: (keys = KB_KEYS) => kbText('BUHO', '#ff5a00', '#000000', keys).colors },
  { id: 'atardecer', name: 'Atardecer', colors: (keys = KB_KEYS) => gradient(['#5500aa', '#ff0066', '#ff5a00', '#ff9900'], 'row', keys) },
  { id: 'oceano', name: 'Océano', colors: (keys = KB_KEYS) => gradient(['#00ffee', '#0088ff', '#0000aa'], 'row', keys) },
  { id: 'fuego', name: 'Fuego', colors: (keys = KB_KEYS) => gradient(['#ff9900', '#ff4400', '#ff0000', '#660000'], 'row', keys) },
  { id: 'vaporwave', name: 'Vaporwave', colors: (keys = KB_KEYS) => gradient(['#ff00cc', '#9900ff', '#00ccff'], 'col', keys) },
  { id: 'aurora', name: 'Aurora', colors: (keys = KB_KEYS) => gradient(['#00ff88', '#00ccff', '#aa00ff', '#00ff88'], 'col', keys) },
  {
    id: 'matrix',
    name: 'Matrix',
    colors: (keys = KB_KEYS) => Object.fromEntries(keys.map((k) => [k.id, ['#002200', '#00aa00', '#00ff44', '#005500'][(k.idx * 7 + k.row * 3) % 4]]))
  },
  {
    id: 'programador',
    name: 'Programador',
    colors: (keys = KB_KEYS) => Object.fromEntries(keys.map((k) => [k.id, MODS.includes(k.code) ? '#ff5a00' : k.row === 0 ? '#aa00ff' : /^(Numpad|NumLock|Arrow)/.test(k.code ?? '') ? '#00aaff' : '#ffffff']))
  }
]

/*
 * Calibración: cada teclado con este chip coloca sus teclas a su manera. El número de LED codifica su sitio en la matriz
 * del firmware (LED = fila × 23 + columna + 1), así que basta con saber qué LED hay bajo cada tecla física: se enciende
 * un LED cada vez y el usuario pulsa la tecla iluminada (KeyboardEvent.code).
 */
export const KB_LED_MAX = 0x88
/** LEDs a recorrer al calibrar (todos los posibles, sin el 0x89, que es «aplicar»). */
export const KB_CALIB_LEDS = Array.from({ length: KB_LED_MAX }, (_, i) => i + 1)

/** Paquetes para encender solo los LEDs indicados: { led: '#rrggbb' } (el resto apagado). */
export function kbRawPackets(colorsByLed, brightness = 4) {
  const out = kbModePackets({ mode: 'personalizado', brightness })
  for (const led of KB_CALIB_LEDS) {
    const hex = colorsByLed[led] ?? '#000000'
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    out.push(pad([KB_REPORT_ID, 0x0c, 0x01, led, r, g, b]))
  }
  out.push(pad([KB_REPORT_ID, 0x0c, 0x01, KB_COMMIT_KEY]))
  return out
}

/** Paso de calibración: apaga el LED anterior, enciende el nuevo y aplica (sin reenviar todo el teclado). */
export function kbStepPackets(prev, cur) {
  const out = []
  if (prev) out.push(pad([KB_REPORT_ID, 0x0c, 0x01, prev, 0, 0, 0]))
  if (cur) out.push(pad([KB_REPORT_ID, 0x0c, 0x01, cur, 255, 255, 255]))
  out.push(pad([KB_REPORT_ID, 0x0c, 0x01, KB_COMMIT_KEY]))
  return out
}

const CODE_LABEL = {
  Escape: 'Esc', Backquote: 'º', Minus: "'", Equal: '¡', Backspace: '⌫', Tab: 'Tab', BracketLeft: '`', BracketRight: '+',
  Enter: 'Intro', CapsLock: 'Bloq', Semicolon: 'Ñ', Quote: '´', Backslash: 'Ç', ShiftLeft: 'Mayús', IntlBackslash: '<',
  Comma: ',', Period: '.', Slash: '-', ShiftRight: 'Mayús', ControlLeft: 'Ctrl', MetaLeft: 'Win', AltLeft: 'Alt', Space: '',
  AltRight: 'AltGr', ContextMenu: 'Menú', ControlRight: 'Ctrl', MetaRight: 'Win', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←',
  ArrowRight: '→', Insert: 'Ins', Delete: 'Supr', Home: 'Inicio', End: 'Fin', PageUp: 'RePág', PageDown: 'AvPág',
  PrintScreen: 'Impr', ScrollLock: 'BloqDes', Pause: 'Pausa', NumLock: 'BloqNum', NumpadDivide: '/', NumpadMultiply: '*',
  NumpadSubtract: '-', NumpadAdd: '+', NumpadEnter: 'Intro', NumpadDecimal: '.', Fn: 'Fn', Otra: '?'
}
const CODE_WIDTH = { Backspace: 2, Tab: 1.5, CapsLock: 1.75, Enter: 1.5, ShiftLeft: 2.25, ShiftRight: 1.75, Space: 6.25, NumpadAdd: 1, NumpadEnter: 1 }

export function kbCodeLabel(code) {
  if (CODE_LABEL[code] !== undefined) return CODE_LABEL[code]
  const m = /^(?:Key|Digit)(.)$/.exec(code) ?? /^Numpad(\d)$/.exec(code) ?? /^(F\d+)$/.exec(code)
  return m ? m[1] : code
}

/** Teclas a partir de una calibración [{ led, code }]: posición sacada del número de LED. */
export function kbKeysFromCalibration(entries) {
  return entries
    .map(({ led, code }) => {
      const row = Math.floor((led - 1) / 23)
      const col = (led - 1) % 23
      return { id: `led${led}`, label: kbCodeLabel(code), code, idx: led, row, col, w: CODE_WIDTH[code] ?? 1, x: col, top: row, h: 1 }
    })
    .sort((a, b) => a.idx - b.idx)
}
