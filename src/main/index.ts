import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { createApplicationMenu } from './createApplicationMenu'
import fs from 'fs'
import path from 'path'
import { store } from './store'
import { createContextMenu } from './createContextMenu'

function removeDirSync(dir) {
  let files = fs.readdirSync(dir)
  console.log(files, 'files')
  for (var i = 0; i < files.length; i++) {
    let newPath = path.join(dir, files[i]);
    let stat = fs.statSync(newPath)
    if (stat.isDirectory()) {
      // 如果是文件夹就递归下去
      removeDirSync(newPath)
    } else {
      // 删除文件
      fs.unlinkSync(newPath)
    }
  }
  fs.rmdirSync(dir)
}

const dirTree = require("directory-tree")

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createApplicationMenu()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// list app life cycle events here: https://www.electronjs.org/docs/api/app#event-quit

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.handle('requestSave', (event, fileContent, fileName) => {

  const window = BrowserWindow.fromWebContents(event.sender)

  const options = {
    title: 'Save markdown file',
    filters: [
      {
        name: 'MyFile',
        extensions: ['md']
      }
    ]
  };

  if (fileName && !fileName.startsWith('fakePath')) {
    fs.writeFileSync(fileName, fileContent);
  } else {
    if (window) {
      let newFileName = dialog.showSaveDialogSync(window, options)
      if (newFileName) {
        fs.writeFileSync(newFileName, fileContent)
        window.webContents.send('load', fileContent, {
          name: path.basename(newFileName),
          path: newFileName,
        }, fileName);
      }
    }
  }
});

ipcMain.handle('requestSaveAs', (event, fileContent) => {

  const window = BrowserWindow.fromWebContents(event.sender)
  const options = {
    title: 'Save as markdown file',
    filters: [
      {
        name: 'MyFile',
        extensions: ['md']
      }
    ]
  };

  if (window) {
    const newFileName = dialog.showSaveDialogSync(window, options);

    if (newFileName) {
      fs.writeFileSync(newFileName, fileContent);
      window.webContents.send('load', fileContent, {
        name: path.basename(newFileName),
        path: newFileName,
      });
    }
  }
});

ipcMain.handle('requestSubDirectory', (_event, path) => {
  const callback = (item) => {
    item.isLeaf = item.type === 'file'
    item.title = item.name
    item.key = item.path
  }
  return dirTree(path, { attributes: ["type", "extension"], depth: 1 }, callback, callback)
})

ipcMain.handle('requestFileContent', (_event, path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
})

ipcMain.handle('requestUserPreferencesData', (_event, keys) => {
  let res = keys.reduce((obj, key) => {
    obj[key] = store.get(key)
    return obj
  }, {})

  return res
})

ipcMain.handle('saveUserPreferencesData', (_event, key, value) => {
  try {
    store.set(key, value)
    return true
  } catch (e) {
    return false
  }
})

ipcMain.handle('requestFileTreeContextMenu', (_event, path) => {
  const win = BrowserWindow.fromWebContents(_event.sender)
  if (win) createContextMenu(path).popup({ window: win })
  return path
})

ipcMain.handle('requestCreateFolder', (_event, path) => {
  const win = BrowserWindow.fromWebContents(_event.sender)

  const options = {
    title: 'create new folder',
    defaultPath: path,
    buttonLabel: '创建',
  };

  if (win) {
    const newDir = dialog.showSaveDialogSync(win, options);
    if (newDir) {
      fs.mkdirSync(newDir)
    }
    return newDir
  } else {
    return null
  }
})

ipcMain.handle('requestDeleteFolderOrFile', async (_event, _path) => {
  const win = BrowserWindow.fromWebContents(_event.sender)

  if (win) {
  
    const stat = fs.statSync(_path)
    const isDirectory = stat.isDirectory()

    const { response } = await dialog.showMessageBox(win, {
      type: 'warning',
      title: '删除文件',
      message: `确定要删除${isDirectory ? '文件夹' : '文件'} ${path.basename(_path)} 吗？`,
      buttons: ['确定', '取消'],
    })

    if (response === 0) {
      if (isDirectory) {
        removeDirSync(_path)
      } else {
        fs.unlinkSync(_path)
      }
      return true
    } else {
      return false
    }
  } else {
    return false
  }
})

ipcMain.handle('requestCreateFile', (_event, path) => {
  const win = BrowserWindow.fromWebContents(_event.sender)

  const options = {
    title: 'create new file',
    defaultPath: path,
    buttonLabel: '创建',
    filters: [
      {
        name: 'MyNewFile',
        extensions: ['md']
      }
    ]
  };

  if (win) {
    const newFileName = dialog.showSaveDialogSync(win, options);

    if (newFileName) {
      fs.writeFileSync(newFileName, '');
    }

    return newFileName

  } else {
    return null
  }

})
