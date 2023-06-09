import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  requestNewFile() {
    return ipcRenderer.send('requestNewFile')
  },
  newFile(callback: () => void) {
    const _callback = (_event) => {
      callback()
    }
    ipcRenderer.on('newFile', _callback)
    return () => ipcRenderer.off('newFile', _callback)
  },
  requestLoadFile() {
    return ipcRenderer.send('requestLoadFile')
  },
  loadFile(callback: (fileContent: string, file, oldFilePath) => void) {
    const _callback = (_event, fileContent, file, oldFilePath) => {
      callback(fileContent, file, oldFilePath)
    }
    ipcRenderer.on('load', _callback)

    return () => ipcRenderer.off('load', _callback)
  },
  requestLoadFolder(rootFolder) {
    return ipcRenderer.send('requestLoadFolder', rootFolder)
  },
  loadFolder(callback: (folderTree: any) => void) {
    const _callback = (_event, folderTree) => {
      callback(folderTree)
    }
    ipcRenderer.on('loadDirectory', _callback)

    return () => ipcRenderer.off('loadDirectory', _callback)
  },
  requestFileContent(path: string) {
    return ipcRenderer.invoke('requestFileContent', path)
  },
  requestSubFolder(path) {
    return ipcRenderer.invoke('requestSubDirectory', path)
  },
  saveFile(callback) {
    ipcRenderer.on('saveFile', callback)
    return () => ipcRenderer.off('saveFile', callback)
  },
  saveAsFile(callback) {
    ipcRenderer.on('saveAsFile', callback)
    return () => ipcRenderer.off('saveAsFile', callback)
  },
  requestSaveFile(fileContent: string, fileName: string) {
    ipcRenderer.invoke('requestSave', fileContent, fileName)
  },
  requestSaveAsFile(fileContent: string) {
    ipcRenderer.invoke('requestSaveAs', fileContent)
  },
  requestUserPreferencesData(keys: ('rootFolder' | 'openFiles' | 'file')[]) {
    return ipcRenderer.invoke('requestUserPreferencesData', keys)
  },
  saveUserPreferencesData(key: 'rootFolder' | 'openFiles' | 'file', value) {
    return ipcRenderer.invoke('saveUserPreferencesData', key, value)
  },
  requestFileTreeContextMenu(path: string) {
    return ipcRenderer.invoke('requestFileTreeContextMenu', path)
  },
  createFolder(callback: (e, path: string) => void) {
    ipcRenderer.on('createFolder', callback)
    return () => ipcRenderer.off('createFolder', callback)
  },
  createFile(callback: (e, path: string) => void) {
    ipcRenderer.on('createFile', callback)
    return () => ipcRenderer.off('createFile', callback)
  },
  deleteFolderOrFile(callback: (e, path: string, isDirectory: boolean) => void) {
    ipcRenderer.on('deleteFolderOrFile', callback)
    return () => ipcRenderer.off('deleteFolderOrFile', callback)
  },
  renameFolderOrFile(callback: (e, path: string, isDirectory: boolean) => void) {
    ipcRenderer.on('renameFolderOrFile', callback)
    return () => ipcRenderer.off('renameFolderOrFile', callback)
  },
  requestCreateFolder(path: string) {
    return ipcRenderer.invoke('requestCreateFolder', path)
  },
  requestCreateFile(path: string) {
    return ipcRenderer.invoke('requestCreateFile', path)
  },
  requestDeleteFolderOrFile(path: string) {
    return ipcRenderer.invoke('requestDeleteFolderOrFile', path)
  },
  requestRenameFolderOrFile(path: string, newName: string) {
    return ipcRenderer.invoke('requestRenameFolderOrFile', path, newName)
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
