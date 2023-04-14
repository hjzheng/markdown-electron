import { useState, useEffect, useCallback, useRef } from 'react'
import { Layout, theme } from 'antd'
import { MarkdownTabs } from './components/MarkdownTabs'
import FileTree from './components/FileTree'
import { ProfileOutlined } from '@ant-design/icons'
import { getParentPaths, findTreeNode } from './utils/utils'
import { Dialog } from './components/Dialog'
import { Welcome } from './components/Welcome'

const { Sider, Content } = Layout

type IFile = {name: string, path: string, fileContent?: string}

function App(): JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const [file, setFile] = useState<IFile|null>(null)
  const [files, setFiles] = useState<IFile[]>([])
  const [folderTree, setFolderTree] = useState<any[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  const rootFolderRef = useRef<string>('')
  const fileTreeRef = useRef<any>(null)

  const onFolderExpand = (keys) => {
    setExpandedKeys(keys)
  }

  const onFileChange = (file: IFile) => {
    setFile(file)
    let expandKeys = getParentPaths(rootFolderRef.current, file.path || '')
    if (expandKeys) {
      setExpandedKeys(expandKeys)
    }
  }  

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const loadSubFolderData = async (data) => {
    setFolderTree([...data])
  }

  const add = (file, oldFilePath?) => {
    const index = files.findIndex((f) => f.path === file.path);
    if (index === -1) {
        Promise.resolve().then(() => {
            // @ts-ignore
            setFiles((files) => {
                const index = files.findIndex(f => f.path === oldFilePath)
                if (index !== -1) {
                    files[index] = file
                    return [...files]
                } else {
                    return [...files, file]
                }
            })
        }).then(() => {
            setFile({ name: file.name, path: file.path })
        })
    } else {
        setFile({ name: file.name, path: file.path })
    }
  }

  const onFileSelect = async (_keys, info) => {
    const { node } = info
    if (node.extension === '.md') {
      const fileContent = await window.api.requestFileContent(node.path)
      const file = { name: node.title, path: node.path, fileContent: fileContent }
      add(file)
    }
  }

  useEffect(() => {
    window.onbeforeunload = () => {
      window.api.saveUserPreferencesData('openFiles', files.map(f => ({
        name: f.name,
        path: f.path,
        fileContent: f.path.startsWith('fakePath') ? f.fileContent : ''
      })))
      window.api.saveUserPreferencesData('file', file)
    }
    return () => { window.onbeforeunload = null }
  }, [files, file])

  useEffect(() => {
    // 初始化，获取 user-persisted data
    window.api.requestUserPreferencesData(['rootFolder', 'openFiles', 'file']).then(async (data) => {
      const { rootFolder, openFiles, file } = data
      
      if (rootFolder) {
        window.api.requestLoadFolder(rootFolder)
        rootFolderRef.current = rootFolder
      }
      
      if (openFiles) {
        const files = await Promise.all(openFiles.filter(file => file.path).map(async file => {

          let fileContent = file.fileContent || ''

          if (!file.path.startsWith('fakePath')) {
            fileContent = await window.api.requestFileContent(file.path)
          }

          return {
            ...file,
            fileContent
          }
        }))

        if (files.length > 0) {
          setFiles(files)
          setFile(file || files[0])
          
          let expandKeys = getParentPaths(rootFolder, file?.path || '')

          if (expandKeys) {
            setExpandedKeys(expandKeys)
          }
        }
      }
    })
  }, [])

  useEffect(() => {
    let callback1 = window.api.saveFile(() => {
      const _file = files.find(it => it.path === file?.path)
      if(_file) window.api.requestSaveFile(_file.fileContent || '', _file.path)
    })
  
    let callback2 = window.api.saveAsFile(() => {
      const _file = files.find(it => it.path === file?.path)
      if(_file) window.api.requestSaveAsFile(_file.fileContent || '')
    })

    return () => {
      callback1 && callback1()
      callback2 && callback2()
    }
  } , [files]) 

  useEffect(() => {
    let callback = window.api.loadFolder(folderTree => {
      rootFolderRef.current = folderTree.path
      setFolderTree([folderTree])
    })

    let callback1 = window.api.newFile(() => {
        add({ name: '未命名文件', path: 'fakePath' + Date.now(), fileContent: '' });
    })

    let callback2 = window.api.loadFile((fileContent, file, oldFilePath) => {
        add({ name: file.name, path: file.path, fileContent: fileContent }, oldFilePath)
    })

    return () => {
        callback && callback()
        callback1 && callback1()
        callback2 && callback2()
    }
  }, [])


  const refreshFolder = useCallback(async (folderTree, path) => {
    const res = await window.api.requestSubFolder(path)
    const node = findTreeNode(folderTree, path)
    if (node) {
      // @ts-ignore
      node.children = [...res.children]
      setFolderTree(() => [...folderTree])
    }
  }, [folderTree])

  const successCallback = useCallback(async (path, targetKey) => {
    await refreshFolder(folderTree, path)

    if (targetKey) {
      setTimeout(() => {
        fileTreeRef.current?.scrollTo({ key: targetKey, align: 'bottom', offset: 100 })
      }, 200)
    }
  }, [folderTree])

  
  return (
    <Layout style={{height: '100vh', background: colorBgContainer}}>
      <Dialog callback={successCallback} />
      <Sider
        trigger={<ProfileOutlined style={{fontSize: 12}}/>}
        theme={'light'} collapsible collapsed={collapsed} collapsedWidth={0} onCollapse={() => setCollapsed(!collapsed)}>
        <div className="logo"
          style={{
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            background: colorBgContainer,
            paddingLeft: '10px',
            fontWeight: 'bold',
          }}
        >
          FOLDERS
        </div>
        <FileTree 
          ref={fileTreeRef}
          data={folderTree} 
          onLoadData={loadSubFolderData} 
          selectFile={file?.path || ''}
          onSelect={onFileSelect} 
          onExpand={onFolderExpand}
          expandedKeys={expandedKeys}
          />
      </Sider>
      <Layout className="site-layout">
        <Content
          style={{
            margin: '0px 5px',
            padding: '5px 15px',
            minHeight: 280,
            height: 'calc(100vh - 40px)',
            background: colorBgContainer,
          }}
        >
        {
          files.length !== 0 ?
          <MarkdownTabs 
            file={file} 
            files={files} 
            onFileChange={onFileChange}
            onFilesChange={setFiles} 
            onAddFile={add} /> : 
            <Welcome />
        } 
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
