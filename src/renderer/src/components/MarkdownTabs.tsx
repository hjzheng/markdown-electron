import { Tabs } from 'antd'
import MarkdownEditor from './MarkdownEditor'
import { getFileName } from '../utils/utils'

type IFile = { name: string, path: string, fileContent?: string }


interface IProps {
    file: IFile | null
    files: IFile[]
    onFileChange: (file: IFile) => void
    onFilesChange: (files: IFile[]) => void
    onAddFile: (file: IFile, oldFilePath?: string) => void
}

export const MarkdownTabs = ({ file, files, onFileChange, onFilesChange, onAddFile }: IProps): JSX.Element => {

    const remove = (targetKey) => {
        const targetIndex = files.findIndex((pane) => pane.path === targetKey);
        const newFiles = files.filter((pane) => pane.path !== targetKey);
        if (newFiles.length && targetKey === file?.path) {
            const { path, name } = newFiles[targetIndex === newFiles.length ? targetIndex - 1 : targetIndex];
            onFileChange({ name, path })
        }
        onFilesChange(newFiles);
    };


    const onEdit = (targetKey, action: 'add' | 'remove') => {
        if (action === 'add') {
            onAddFile({ name: '未命名文件', path: 'fakePath' + Date.now(), fileContent: '' });
        } else {
            remove(targetKey);
        }
    };

    const setFileContentByPath = (path: string, fileContent) => {
        const file = files.find(it => it.path === path)
        if (file) file.fileContent = fileContent
        onFilesChange([...files])
    }

    return (
        <Tabs
            onChange={(path) => onFileChange({ name: getFileName(path), path: path })}
            activeKey={file?.path}
            type="editable-card"
            onEdit={onEdit}
            items={files.map(f => (
                {
                    label: `${f.name}`,
                    children: <MarkdownEditor
                        isActived={f.path === file?.path}
                        fileContent={f.fileContent || ''}
                        onChange={value => setFileContentByPath(f.path, value)} />,
                    key: f.path
                }))}
        />
    )
}