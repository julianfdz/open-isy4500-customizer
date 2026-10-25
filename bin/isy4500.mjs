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
