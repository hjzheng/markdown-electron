import { shell, Menu, BrowserWindow, dialog, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { store } from './store'

const dirTree = require("directory-tree")

function saveFile() {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.webContents.send('saveFile');
}

function saveAsFile() {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.webContents.send('saveAsFile');
}

function newFile() {
    const window = BrowserWindow.getFocusedWindow();

    if (!window) return

    window.webContents.send('newFile');
}

function loadFile() {
    const window = BrowserWindow.getFocusedWindow();

    if (!window) return

    const files = dialog.showOpenDialogSync(window, {
        properties: ['openFile'],
        title: 'Pick a markdown file',
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
    });

    if (!files) return;

    const file = files[0];
    const fileContent = fs.readFileSync(file).toString();
    const filePath = path.resolve(file)

    window.webContents.send('load', fileContent, {
        name: path.basename(file),
        path: filePath,
    });
}

function loadFolder(rootFolder?: string) {
    const window = BrowserWindow.getFocusedWindow();

    if (!window) return

    let folders: string[] = []

    if (rootFolder) {
        folders = [rootFolder]
    } else {
        folders = dialog.showOpenDialogSync(window, {
            properties: ['openDirectory'],
            title: 'Pick a Directory',
        }) || [];
    }

    if (folders && folders?.length > 0) {
        const callback = (item) => {
            item.isLeaf = item.type === 'file'
            item.title = item.name
            item.key = item.path
        }
        const filteredTree = dirTree(folders[0], { attributes: ["type", "extension"], depth: 1 }, callback, callback)
        window.webContents.send('loadDirectory', filteredTree)
        store.set('rootFolder', folders[0])
    }
}

ipcMain.on('requestNewFile', () => {
    newFile()
})

ipcMain.on('requestLoadFile', () => {
    loadFile()
})

ipcMain.on('requestLoadFolder', (_event, rootFolder?) => {
    loadFolder(rootFolder)
})

export function createApplicationMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        newFile()
                    },
                },
                {
                    label: 'Open',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        loadFile()
                    },
                },
                {
                    label: 'Open Folder',
                    accelerator: 'CmdOrCtrl+L',
                    click: () => {
                        loadFolder()
                    },
                },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        saveFile()
                    },
                },
                {
                    label: 'Save As',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => {
                        saveAsFile()
                    },
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    role: 'quit',
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'delete' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        },
        {
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' },
            ],
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: () => { shell.openExternal('https://electronjs.org'); },
                },
            ],
        },
    ]

    const menu = Menu.buildFromTemplate(template)

    Menu.setApplicationMenu(menu)
}
