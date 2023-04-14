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

function deleteFolderOrFile(path) {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.webContents.send('deleteFolderOrFile', path);
}

export const createContextMenu = (path) => {

    const stat = fs.statSync(path)

    if (stat.isDirectory()) {
        const contextMenu = Menu.buildFromTemplate([
            { label: '创建目录', click: () => {
                createFolder(path)
            }},
            { label: '创建文件', click: () => {
                createFile(path)
            }},
            { label: '删除目录', click: () => {
                deleteFolderOrFile(path)
            }},
        ])
          
        return contextMenu
    } else {
        const contextMenu = Menu.buildFromTemplate([
            { label: '删除文件', click: () => {
                deleteFolderOrFile(path)
            }},
        ])
          
        return contextMenu
    }
}
