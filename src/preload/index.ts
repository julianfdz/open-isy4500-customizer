import { contextBridge, ipcRenderer } from 'electron'
import type { Api } from '@shared/types'

function on<T>(channel: string, cb: (v: T) => void): () => void {
  const h = (_e: unknown, v: T): void => cb(v)
  ipcRenderer.on(channel, h)
  return () => ipcRenderer.removeListener(channel, h)
}

const api: Api = {
  device: () => ipcRenderer.invoke('device'),
  saved: () => ipcRenderer.invoke('saved'),
  save: (s) => ipcRenderer.invoke('save', s),
  apply: (config) => ipcRenderer.invoke('apply', config),
  readState: () => ipcRenderer.invoke('readState'),
  getDpi: () => ipcRenderer.invoke('getDpi'),
  setDpi: (codes) => ipcRenderer.invoke('setDpi', codes),
  setLevel: (level) => ipcRenderer.invoke('setLevel', level),
  getButtons: () => ipcRenderer.invoke('getButtons'),
  setButtons: (codes) => ipcRenderer.invoke('setButtons', codes),
  appInfo: () => ipcRenderer.invoke('appInfo'),
  kbStatus: () => ipcRenderer.invoke('kbStatus'),
  kbApply: (kb) => ipcRenderer.invoke('kbApply', kb),
  kbRestore: () => ipcRenderer.invoke('kbRestore'),
  kbCalibStart: () => ipcRenderer.invoke('kbCalibStart'),
  kbCalibStep: (prev, cur) => ipcRenderer.invoke('kbCalibStep', prev, cur),
  onKb: (cb) => on('kb', cb),
  onDevice: (cb) => on('device', cb),
  onMouse: (cb) => on('mouse', cb),
  onSaved: (cb) => on('saved', cb)
}

contextBridge.exposeInMainWorld('isy', api)
