import EventEmitter from 'wolfy87-eventemitter';

export const findTreeNode = (treeData, path) => {
    let node = null
    const loop = (data) => {
        for (let i = 0; i < data.length; i++) {
            const item = data[i]
            if (item.path === path) {
                node = item
                break
            }
            if (item.children) {
                loop(item.children)
            }
        }
    }
    loop(treeData)
    return node
}


export const EE = new EventEmitter()

export const getFileName = (path: string) => {
    // windows
    if (path.indexOf('\\') > -1) {
        const arr = path.split('\\')
        return arr[arr.length - 1]
    } else {
        const arr = path.split('/')
        return arr[arr.length - 1]
    }
}

export const getParentPaths = (rootFolderPath: string, filePath: string) => {
    let isWindows = rootFolderPath.indexOf('\\') > -1

    let separator = isWindows ? '\\' : '/'

    let paths = [rootFolderPath]

    let prefix = rootFolderPath

    if (filePath.startsWith(rootFolderPath)) {
        let reg = new RegExp(`^${rootFolderPath}`)
        let tmpPath = filePath.replace(reg, '')
        let tmps = tmpPath.split(separator)
        tmps.shift()
        tmps.pop()

        while (tmps.length !== 0) {
            let x = tmps.shift()
            prefix = prefix + separator + x
            paths.push(prefix)
        }
        return paths
    } else {
        return null
    }
}