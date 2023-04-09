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