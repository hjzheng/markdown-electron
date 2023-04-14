import { Menu, BrowserWindow } from 'electron';
import fs from 'fs';

function createFolder(path) {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.webContents.send('createFolder', path);
}

function createFile(path) {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.webContents.send('createFile', path);
}

function deleteFolderOrFile(path, isDirectory) {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.webContents.send('deleteFolderOrFile', path, isDirectory);
}

function rename(path, isDirectory) {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.webContents.send('renameFolderOrFile', path, isDirectory);
}

export const createContextMenu = (path) => {

    const stat = fs.statSync(path)
    const isDirectory = stat.isDirectory()

    if (isDirectory) {
        const contextMenu = Menu.buildFromTemplate([
            { label: '创建目录', click: () => {
                createFolder(path)
            }},
            { label: '创建文件', click: () => {
                createFile(path)
            }},
            { label: '重命名', click: () => {
                rename(path, isDirectory)
            }},
            { label: '删除目录', click: () => {
                deleteFolderOrFile(path, isDirectory)
            }},
        ])
          
        return contextMenu
    } else {
        const contextMenu = Menu.buildFromTemplate([
            { label: '重命名', click: () => {
                rename(path, isDirectory)
            }},
            { label: '删除文件', click: () => {
                deleteFolderOrFile(path, isDirectory)
            }},
        ])
          
        return contextMenu
    }
}
