import { useEffect, useState } from 'react'
import { Modal, Input, message } from 'antd'
import { validateFileName, getFileName, getParentPath, getSeparator } from '../utils/utils'

interface IProps {
    callback: (parentPath, targetKey) => void
}

export function Dialog({callback}: IProps): JSX.Element {

    const [newPath, setNewPath] = useState('')
    const [oldPath, setOldPath] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [modalTitle, setModelTitle] = useState('')
    const [okfunName, setOkfunName] = useState('')

    useEffect(() => {
        let callback1 = window.api.createFolder(async (_e, path) => {
            setOldPath(path)
            setNewPath('新建目录')
            setModalVisible(true)
            setModelTitle('创建目录')
            setOkfunName('createFolder')
        })

        let callback2 = window.api.createFile(async (_e, path) => {
            setOldPath(path)
            setNewPath('新建文件')
            setModalVisible(true)
            setModelTitle('创建文件')
            setOkfunName('createFile')
        })

        let callback3 = window.api.deleteFolderOrFile(async (_e, path, isDirectory) => {
            setOldPath(path)
            setNewPath(`确定要删除${isDirectory ? '目录' : '文件'}${getFileName(path)}吗？`)
            setModalVisible(true)
            setModelTitle('删除')
            setOkfunName('delete')
        })

        let callback4 = window.api.renameFolderOrFile(async (_e, path) => {
            setOldPath(path)
            setNewPath(getFileName(path))
            setModalVisible(true)
            setModelTitle('重命名')
            setOkfunName('rename')
        })

        return () => {
            callback1 && callback1()
            callback2 && callback2()
            callback3 && callback3()
            callback4 && callback4()
        }
    }, [oldPath, newPath, modalVisible, modalTitle, okfunName])

    const cancel = () => {
        setNewPath('')
        setOldPath('')
        setModalVisible(false)
    }

    const deleteOK = async () => {
        const res = await window.api.requestDeleteFolderOrFile(oldPath)

        if (res) {
            const parentPath = getParentPath(oldPath)
            callback(parentPath, null)
        }

        cancel()
    }

    const renameOK = async () => {
        const path = oldPath
        if (!validateFileName(newPath.trim())) {
            message.error('文件名不合法')
            return
        }
        const _newPath = getParentPath(path) + getSeparator(path) + newPath.trim()
        const res = await window.api.requestRenameFolderOrFile(path, _newPath)
        if (res) {
            const parentPath = getParentPath(path)
            callback(parentPath, null)
        }
        cancel()
    }

    const createFolderOK = async () => {
        const path = oldPath

        if (!validateFileName(newPath.trim())) {
            message.error('目录名不合法')
            return
        }

        const _newPath = path + getSeparator(path) + newPath.trim()

        const res = await window.api.requestCreateFolder(_newPath)

        if (res) {
            callback(path, _newPath)
        }

        cancel()
    }

    const createFileOK = async () => {
        const path = oldPath

        if (!validateFileName(newPath.trim())) {
            message.error('文件名不合法')
            return
        }

        const _newPath = path + getSeparator(path) + newPath.trim()

        const res = await window.api.requestCreateFile(_newPath)

        if (res) {
            callback(path, _newPath)
        }

        cancel()
    }

    const oks = {
        rename: renameOK,
        createFile: createFileOK,
        createFolder: createFolderOK,
        delete: deleteOK,
    }


    return (
        <Modal open={modalVisible} title={modalTitle}
            onOk={oks[okfunName]}
            onCancel={cancel}
        >
            {okfunName === 'delete' ? newPath : <Input value={newPath} onChange={(e) => setNewPath(e.target.value)} />}
        </Modal>
    )
}