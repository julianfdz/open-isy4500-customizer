#!/usr/bin/env node
/**
 * isy4500: luz RGB del ratón ISY IGM 4500 WT desde la terminal (para personas y agentes de IA).
 * Habla con el ratón directamente por USB; si la app está abierta, se pone al día sola.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as mouse from '../lib/isy4500.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = process.env.ISY_DATA_DIR || join(process.env.APPDATA || join(process.env.HOME || '.', '.config'), 'OpenISY4500Customizer')
const settingsFile = join(dataDir, 'settings.json')

const HELP = `isy4500 · Open ISY4500 Customizer (ratón ISY IGM 4500 WT, USB 30FA:1040)

  isy4500 status                      ¿Está conectado? Configuración guardada.
  isy4500 color <#rrggbb> [--dpi N]   Color fijo (todos los niveles de DPI o solo el N, 1-6).
  isy4500 colors <c1> … <c6>          Un color por nivel de DPI.
  isy4500 mode <modo> [--speed 0-5] [--brightness 0-7] [--dir 0|1]
  isy4500 preset <id>                 Estilo predefinido (isy4500 presets para verlos).
  isy4500 off                         Apaga la luz.
  isy4500 modes | presets             Lista modos o estilos.
  isy4500 dpi                         DPI de cada nivel guardado en el ratón (solo lectura).
  isy4500 dpi <v1> … <v6>             Graba el DPI de los 6 niveles (200-4800, de 200 en 200, sin 2200).
  isy4500 dpi <valor> --level N       Graba solo el nivel N (1-6).
  isy4500 dpi factory                 Vuelve a los valores de fábrica.
  isy4500 level <N>                   Activa el nivel de DPI N (1-6) sin pulsar el botón.
  isy4500 buttons                     Función de cada botón (lee la memoria del ratón).
  isy4500 button <botón> <función>    Reasigna un botón (isy4500 buttons para ver nombres).
  isy4500 buttons factory             Botones de fábrica.
  isy4500 listen [segundos]           Muestra el nivel de DPI al pulsar el botón (solo lectura).
  isy4500 skill                       Guía completa para agentes de IA.

  --json  salida en JSON · --dry-run  enseña los paquetes sin mandarlos`

function readSaved() {
  try {
    const s = JSON.parse(readFileSync(settingsFile, 'utf8').replace(/^﻿/, ''))
    return { reapplyOnStart: false, ...s, config: { ...mouse.DEFAULT_CONFIG, ...s.config } }
  } catch {
    return { reapplyOnStart: false, config: mouse.DEFAULT_CONFIG }
  }
}

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  if (i < 0) return undefined
  const v = args[i + 1]
  args.splice(i, 2)
  return v
}
const bool = (name) => {
  const i = args.indexOf(`--${name}`)
  if (i >= 0) args.splice(i, 1)
  return i >= 0
}
const json = bool('json')
const dry = bool('dry-run')
const out = (obj, text) => console.log(json ? JSON.stringify(obj, null, 2) : text)

function send(config) {
  const full = { ...mouse.DEFAULT_CONFIG, ...config }
  if (dry) return out({ dryRun: true, config: full, packets: mouse.packetsFor(full).map(mouse.hex) }, mouse.packetsFor(full).map(mouse.hex).join('\n'))
  const packets = mouse.apply(full)
  const saved = readSaved()
  mkdirSync(dataDir, { recursive: true })
  writeFileSync(settingsFile, JSON.stringify({ ...saved, config: full }, null, 2))
  const m = mouse.modeById(full.mode)
  out({ ok: true, config: full, packets }, `Aplicado: ${m.name}${m.color ? ' · ' + full.colors.map(mouse.quantize).join(' ') : ''}`)
}

const level = (v) => {
  const n = Number(v)
  if (!Number.isInteger(n) || n < 1 || n > mouse.DPI_LEVELS) throw new Error(`Nivel de DPI no válido: ${v} (1-${mouse.DPI_LEVELS})`)
  return n - 1
}

try {
  const [cmd, ...rest] = args
  const saved = readSaved()
  switch (cmd) {
    case 'status': {
      const info = mouse.find()
      out(
        { connected: !!info, device: info, saved: saved.config, state: info ? mouse.readState() : null },
        info
          ? `Conectado: ${info.product} (${info.manufacturer}), USB 30FA:1040\nGuardado: ${mouse.modeById(saved.config.mode).name} · ${saved.config.colors.join(' ')}`
          : 'Ratón no encontrado (USB 30FA:1040).'
      )
      break
    }
    case 'color': {
      if (!rest[0]) throw new Error('Falta el color: isy4500 color #ff0000')
      mouse.parseHex(rest[0])
      const dpi = flag('dpi')
      const hex = rest[0].startsWith('#') ? rest[0] : '#' + rest[0]
      const base = mouse.modeById(saved.config.mode).color ? saved.config : { ...saved.config, mode: 'static', brightness: mouse.BRIGHTNESS_MAX }
      const colors = dpi === undefined ? Array(mouse.DPI_LEVELS).fill(hex) : base.colors.map((c, i) => (i === level(dpi) ? hex : c))
      send({ ...base, colors })
      break
    }
    case 'colors': {
      if (rest.length !== mouse.DPI_LEVELS) throw new Error(`Hacen falta ${mouse.DPI_LEVELS} colores, uno por nivel de DPI.`)
      rest.forEach(mouse.parseHex)
      send({ ...saved.config, mode: 'static', colors: rest.map((c) => (c.startsWith('#') ? c : '#' + c)) })
      break
    }
    case 'mode': {
      const m = mouse.modeById(rest[0])
      const speed = flag('speed')
      const brightness = flag('brightness')
      const dir = flag('dir')
      send({
        ...saved.config,
        mode: m.id,
        ...(speed !== undefined && { speed: Number(speed) }),
        ...(brightness !== undefined && { brightness: Number(brightness) }),
        ...(dir !== undefined && { direction: Number(dir) })
      })
      break
    }
    case 'preset': {
      const p = mouse.PRESETS.find((x) => x.id === rest[0])
      if (!p) throw new Error(`Estilo desconocido: ${rest[0]}. Estilos: ${mouse.PRESETS.map((x) => x.id).join(', ')}`)
      send({ ...mouse.DEFAULT_CONFIG, ...p.config })
      break
    }
    case 'dpi': {
      const cur = mouse.getDpi()
      const show = (codes, active) => codes.map((c, i) => `  nivel ${i + 1}: ${String(mouse.dpiOf(c)).padStart(4)} DPI (código ${c})${i === active ? '  ← activo' : ''}`).join('\n')
      const lvl = flag('level')
      const vals = rest.filter((v, i, a) => v !== '--level' && a[i - 1] !== '--level')
      if (!vals.length) {
        out({ ...cur, dpi: cur.codes.map(mouse.dpiOf) }, `DPI guardado en el ratón (aprox. código × 200):
${show(cur.codes, cur.active)}`)
        break
      }
      const toCode = (v) => {
        const c = Number(v) / 200
        if (!mouse.DPI_CODES.includes(c)) throw new Error(`DPI no válido: ${v}. Válidos: ${mouse.DPI_CODES.map(mouse.dpiOf).join(', ')}`)
        return c
      }
      let codes
      if (vals[0] === 'factory') codes = mouse.FACTORY_DPI
      else if (lvl !== undefined) codes = cur.codes.map((c, i) => (i === level(lvl) ? toCode(vals[0]) : c))
      else if (vals.length === mouse.DPI_LEVELS) codes = vals.map(toCode)
      else throw new Error(`Pasa ${mouse.DPI_LEVELS} valores, uno con --level N, o «factory».`)
      if (dry) {
        out({ dryRun: true, codes }, `Se grabaría:
${show(codes, -1)}`)
        break
      }
      const r = mouse.setDpi(codes)
      // La recarga del ratón borra la luz puesta en RAM: se vuelve a mandar la guardada.
      if (r.changed) mouse.apply(saved.config)
      out({ ok: true, ...r }, r.changed ? `DPI grabado en el ratón:
${show(r.codes, -1)}` : 'Sin cambios: el ratón ya tenía esos valores.')
      break
    }
    case 'buttons':
    case 'button': {
      const cur = mouse.getButtons().codes
      const show = (codes) => mouse.BUTTONS.map((b, i) => `  ${b.id.padEnd(10)} → ${mouse.functionOf(codes[i])?.id ?? '0x' + codes[i].toString(16)}`).join('\n')
      const help = `Botones: ${mouse.BUTTONS.map((b) => b.id).join(', ')}
Funciones: ${mouse.FUNCTIONS.map((f) => f.id).join(', ')}`
      if (!rest.length) {
        out({ codes: cur, buttons: mouse.BUTTONS.map((b, i) => ({ button: b.id, function: mouse.functionOf(cur[i])?.id ?? null })) }, `Botones del ratón:
${show(cur)}

${help}`)
        break
      }
      let codes
      if (rest[0] === 'factory') codes = mouse.FACTORY_BUTTONS
      else {
        const bi = mouse.BUTTONS.findIndex((b) => b.id === rest[0])
        const fn = mouse.FUNCTIONS.find((f) => f.id === rest[1])
        if (bi < 0 || !fn) throw new Error(`Uso: isy4500 button <botón> <función>
${help}`)
        codes = cur.map((c, i) => (i === bi ? fn.code : c))
      }
      if (dry) {
        mouse.encodeButtons([0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x35, 0x06], codes)
        out({ dryRun: true, codes }, `Se grabaría:
${show(codes)}`)
        break
      }
      const r = mouse.setButtons(codes)
      if (r.changed) mouse.apply(saved.config)
      out({ ok: true, ...r }, r.changed ? `Botones grabados en el ratón:
${show(r.codes)}` : 'Sin cambios.')
      break
    }
    case 'level': {
      const r = mouse.setActiveLevel(level(rest[0]))
      if (r.changed) mouse.apply(saved.config)
      out({ ok: true, ...r }, `Nivel de DPI activo: ${r.active + 1} (${mouse.dpiOf(mouse.getDpi().codes[r.active])} DPI)`)
      break
    }
    case 'off':
      send({ ...saved.config, mode: 'off' })
      break
    case 'modes':
      out(mouse.MODES, mouse.MODES.map((m) => `${m.id.padEnd(11)} ${m.name.padEnd(18)} ${[m.color && 'color', m.speed && 'velocidad', m.brightness && 'brillo', m.direction && 'dirección'].filter(Boolean).join(', ')}`).join('\n'))
      break
    case 'presets':
      out(mouse.PRESETS, mouse.PRESETS.map((p) => `${p.id.padEnd(14)} ${p.name}`).join('\n'))
      break
    case 'listen': {
      const secs = Number(rest[0] || 30)
      if (!json) console.log(`Escuchando ${secs} s: pulsa el botón de DPI…`)
      const stop = mouse.listen((e) => out(e, e.type === 'dpi' ? `DPI → nivel ${e.level + 1}` : `informe: ${e.hex}`))
      setTimeout(() => {
        stop()
        process.exit(0)
      }, secs * 1000)
      break
    }
    case 'skill':
      console.log(readFileSync(join(here, '..', 'skills', 'isy4500', 'SKILL.md'), 'utf8'))
      break
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      console.log(HELP)
      break
    default:
      throw new Error(`Orden desconocida: ${cmd}\n\n${HELP}`)
  }
} catch (e) {
  if (json) console.log(JSON.stringify({ ok: false, error: e.message }))
  else console.error(`Error: ${e.message}`)
  process.exit(1)
}
