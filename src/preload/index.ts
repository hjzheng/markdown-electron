import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  requestNewFile() {
    return ipcRenderer.send('requestNewFile')
  },
  newFile(callback: () => void) {
    ipcRenderer.on('newFile', (_event) => {
      callback()
    })
  },
  requestLoadFile() {
    return ipcRenderer.send('requestLoadFile')
  },
  loadFile(callback: (fileContent: string, file, oldFilePath) => void) {
    ipcRenderer.on('load', (_event, fileContent, file, oldFilePath) => {
      callback(fileContent, file, oldFilePath)
    })
  },
  requestLoadFolder() {
    return ipcRenderer.send('requestLoadFolder')
  },
  loadFolder(callback: (folderTree: any) => void) {
    ipcRenderer.on('loadDirectory', (_event, folderTree) => {
      callback(folderTree)
    })
  },
  requestFileContent(path: string) {
    return ipcRenderer.invoke('requestFileContent', path)
  },
  requestSubFolder(path) {
    return ipcRenderer.invoke('requestSubDirectory', path)
  },
  saveFile(callback) {
    ipcRenderer.on('saveFile', callback)
  },
  saveAsFile(callback) {
    ipcRenderer.on('saveAsFile', callback)
  },
  requestSaveFile(fileContent: string, fileName: string) {
    ipcRenderer.invoke('requestSave', fileContent, fileName)
  },
  requestSaveAsFile(fileContent: string) {
    ipcRenderer.invoke('requestSaveAs', fileContent)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
