import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { existsSync, mkdirSync, readFileSync, watchFile, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import * as mouse from '../../lib/isy4500.mjs'
import type { Device, LightConfig, Saved } from '@shared/types'

/**
 * Open ISY4500 Customizer (Buho Corps Systems): luz RGB del ratón ISY IGM 4500 WT.
 * El CLI isy4500 escribe la misma configuración (settings.json): la ventana la recoge al momento.
 */

app.setPath('userData', process.env.ISY_DATA_DIR || join(app.getPath('appData'), 'OpenISY4500Customizer'))

let win: BrowserWindow | null = null
let device: Device = { connected: false }
let stopListening: (() => void) | null = null

const settingsFile = (): string => join(app.getPath('userData'), 'settings.json')
const DEFAULT_SAVED: Saved = { config: mouse.DEFAULT_CONFIG, reapplyOnStart: false }

function readSaved(): Saved {
  try {
    const s = JSON.parse(readFileSync(settingsFile(), 'utf8').replace(/^﻿/, '')) as Partial<Saved>
    return { ...DEFAULT_SAVED, ...s, config: { ...mouse.DEFAULT_CONFIG, ...s.config } }
  } catch {
    return DEFAULT_SAVED
  }
}

let lastWritten = ''
function writeSaved(s: Saved): void {
  mkdirSync(dirname(settingsFile()), { recursive: true })
  lastWritten = JSON.stringify(s, null, 2)
  writeFileSync(settingsFile(), lastWritten)
}

const send = (channel: string, v: unknown): void => win?.webContents.send(channel, v)

/** Busca el ratón cada 2 s: detecta cuando se conecta o desconecta y escucha sus eventos. */
function pollDevice(): void {
  let info: ReturnType<typeof mouse.find> = null
  try {
    info = mouse.find()
  } catch {
    /* hid ocupado un instante */
  }
  const connected = !!info
  if (connected === device.connected) return
  device = info
    ? { connected: true, product: info.product, manufacturer: info.manufacturer, release: info.release, interfaces: info.interfaces }
    : { connected: false }
  send('device', device)
  stopListening?.()
  stopListening = null
  if (info) {
    try {
      stopListening = mouse.listen(
        (e) => send('mouse', { ...e, at: Date.now() }),
        () => {
          stopListening = null
          device = { connected: false }
          send('device', device)
        }
      )
    } catch {
      /* sin canal de eventos: la luz funciona igual */
    }
  }
}

function apply(config: LightConfig): { ok: true; packets: string[] } | { ok: false; error: string } {
  try {
    return { ok: true, packets: mouse.apply(config) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

function createWindow(): void {
  win = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 940,
    minHeight: 620,
    title: 'Open ISY4500 Customizer',
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#ffffff', symbolColor: '#000000', height: 40 },
    backgroundColor: '#ffffff',
    icon: join(__dirname, '../../build/icon.png'),
    show: false,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false, contextIsolation: true }
  })
  win.once('ready-to-show', () => win?.show())
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  if (process.env.ELECTRON_RENDERER_URL) void win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else void win.loadFile(join(__dirname, '../renderer/index.html'))
}

function registerIpc(): void {
  ipcMain.handle('device', () => device)
  ipcMain.handle('saved', () => readSaved())
  ipcMain.handle('save', (_e, s: Saved) => writeSaved(s))
  ipcMain.handle('apply', (_e, config: LightConfig) => {
    const r = apply(config)
    if (r.ok) writeSaved({ ...readSaved(), config })
    return r
  })
  ipcMain.handle('readState', () => {
    try {
      return mouse.readState()
    } catch {
      return null
    }
  })
  ipcMain.handle('getDpi', () => {
    try {
      const d = mouse.getDpi()
      return { ok: true, state: { codes: d.codes, active: d.active, enabled: d.enabled } }
    } catch (e) {
      return { ok: false, error: (e as Error).message }
    }
  })
  // Graba el DPI en la memoria del ratón y lo aplica al momento; la recarga borra la luz, así que se vuelve a mandar.
  ipcMain.handle('setDpi', (_e, codes: number[]) => {
    try {
      const r = mouse.setDpi(codes)
      if (r.changed) apply(readSaved().config)
      const d = mouse.getDpi()
      return { ok: true, state: { codes: d.codes, active: d.active, enabled: d.enabled } }
    } catch (e) {
      return { ok: false, error: (e as Error).message }
    }
  })
  // Activa un nivel de DPI sin pulsar el botón (graba el nivel y recarga; después se vuelve a mandar la luz).
  ipcMain.handle('setLevel', (_e, level: number) => {
    try {
      const r = mouse.setActiveLevel(level)
      if (r.changed) apply(readSaved().config)
      const d = mouse.getDpi()
      return { ok: true, state: { codes: d.codes, active: d.active, enabled: d.enabled } }
    } catch (e) {
      return { ok: false, error: (e as Error).message }
    }
  })
  ipcMain.handle('appInfo', () => ({
    version: app.getVersion(),
    cli: app.isPackaged ? join(dirname(process.execPath), 'cli') : join(app.getAppPath(), 'bin')
  }))
}

if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', () => {
    if (win?.isMinimized()) win.restore()
    win?.focus()
  })
  void app.whenReady().then(() => {
    registerIpc()
    createWindow()
    pollDevice()
    setInterval(pollDevice, 2000)
    const s = readSaved()
    if (s.reapplyOnStart && device.connected) apply(s.config)
    // Cambios hechos por el CLI mientras la ventana está abierta.
    if (!existsSync(settingsFile())) writeSaved(s)
    watchFile(settingsFile(), { interval: 700 }, () => {
      try {
        const txt = readFileSync(settingsFile(), 'utf8')
        if (txt !== lastWritten) send('saved', readSaved())
      } catch {
        /* a medio escribir */
      }
    })
  })
  app.on('window-all-closed', () => {
    stopListening?.()
    app.quit()
  })
}
