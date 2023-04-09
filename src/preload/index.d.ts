import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      requestNewFile(): void
      newFile(callback: () => void): void
      requestLoadFile(): void
      loadFile(callback: (fileContent: string, file: any, oldFilePath: string) => void): void
      requestLoadFolder(): void
      loadFolder(callback: (folderTree: any) => void): void
      requestSubFolder(path: string): Promise<any>
      requestFileContent(path: string): Promise<string>
      saveFile(callback: any): void
      saveAsFile(callback :any): void
      requestSaveFile(fileContent: string, fileName: string): void
      requestSaveAsFile(fileContent: string): void
    }
  }
}
