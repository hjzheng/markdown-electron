import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      requestNewFile(): void
      newFile(callback: () => void): () => void
      requestLoadFile(): void
      loadFile(callback: (fileContent: string, file: any, oldFilePath: string) => void): () => void
      requestLoadFolder(rootFolder: string): void
      loadFolder(callback: (folderTree: any) => void): () => void
      requestSubFolder(path: string): Promise<any>
      requestFileContent(path: string): Promise<string>
      saveFile(callback: any): () => void
      saveAsFile(callback: any): () => void
      requestSaveFile(fileContent: string, fileName: string): void
      requestSaveAsFile(fileContent: string): void
      requestUserPreferencesData(keys: ('rootFolder' | 'openFiles' | 'file')[]): Promise<any>
      saveUserPreferencesData(key: 'rootFolder' | 'openFiles' | 'file', value): Promise<boolean>
      requestFileTreeContextMenu(path: string): Promise<any>
      createFolder(callback: (e, path: string) => void): () => void
      createFile(callback: (e, path: string) => void): () => void
      requestCreateFolder(path: string): Promise<any>
      requestCreateFile(path: string): Promise<any>
      deleteFolderOrFile(callback: (e, path: string) => void): () => void
      requestDeleteFolderOrFile(path: string): Promise<any>
    }
  }
}
