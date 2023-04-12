import { useState, useEffect, useCallback, useRef } from 'react'
import { Layout, theme, Tabs } from 'antd'
import MarkdownEditor from './components/MarkdownEditor'
import FileTree from './components/FileTree'
import { ProfileOutlined } from '@ant-design/icons'
import { getFileName, getParentPaths } from './utils/utils'

const { Sider, Content } = Layout

type IFile = {name: string, path: string, fileContent?: string}

function App(): JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const [file, setFile] = useState<IFile|null>(null)
  const [files, setFiles] = useState<IFile[]>([])
  const [folderTree, setFolderTree] = useState<any[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const rootFolderRef = useRef<string>('')

  const onFolderExpand = (keys) => {
    setExpandedKeys(keys)
  }

  const onChange = (key: string) => {
    setFile({ name: getFileName(key), path: key })
    let expandKeys = getParentPaths(rootFolderRef.current, key || '')
    if (expandKeys) {
      setExpandedKeys(expandKeys)
    }
  }

  const add = (file, oldFilePath?) => {
    const index = files.findIndex((f) => f.path === file.path);
    if (index === -1) {
      Promise.resolve().then(() => {
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

  const remove = (targetKey) => {
    const targetIndex = files.findIndex((pane) => pane.path === targetKey);
    const newFiles = files.filter((pane) => pane.path !== targetKey);
    if (newFiles.length && targetKey === file?.path) {
      const { path, name } = newFiles[targetIndex === newFiles.length ? targetIndex - 1 : targetIndex];
      setFile({ name, path })
    }
    setFiles(newFiles);
  };


  const onEdit = (targetKey, action: 'add' | 'remove') => {
    if (action === 'add') {
      add({ name: '未命名文件', path: 'fakePath' + Date.now(), fileContent: '' });
    } else {
      remove(targetKey);
    }
  };

  const setFileContentByPath = (path: string, fileContent) => {
    const file = files.find(it => it.path === path)
    if (file) file.fileContent = fileContent
    setFiles([...files])
  }

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const loadSubFolderData = async (data) => {
    setFolderTree([...data])
  }

  const onFileSelect = async (_keys, info) => {
    const { node } = info
    if (node.extension === '.md') {
      const fileContent = await window.api.requestFileContent(node.path)
      add({ name: node.title, path: node.path, fileContent: fileContent })
    }
  }

  const addAction = (action) => {
    // boswer send action 
    window.api[action]()
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

  const saveAsFile = useCallback(() => {
    const _file = files.find(it => it.path === file?.path)
    if(_file) window.api.requestSaveAsFile(_file.fileContent || '')
  }, [files])

  const saveFile = useCallback(() => {
    const _file = files.find(it => it.path === file?.path)
    if(_file) window.api.requestSaveFile(_file.fileContent || '', _file.path)
  }, [files])

  useEffect(() => {
    let callback1 = window.api.saveFile(() => {
      saveFile()
    })
  
    let callback2 = window.api.saveAsFile(() => {
      saveAsFile()
    })

    return () => {
      callback1 && callback1()
      callback2 && callback2()
    }
  } , [files]) 

  useEffect(() => {
    let callback1 = window.api.newFile(() => {
      add({ name: '未命名文件', path: 'fakePath' + Date.now(), fileContent: '' });
    })

    let callback2 = window.api.loadFile((fileContent, file, oldFilePath) => {
      add({ name: file.name, path: file.path, fileContent: fileContent }, oldFilePath)
    })

    let callback3 = window.api.loadFolder(folderTree => {
      rootFolderRef.current = folderTree.path
      setFolderTree([folderTree])
    })

    return () => {
      callback1 && callback1()
      callback2 && callback2()
      callback3 && callback3()
    }
  }, [])

  return (
    <Layout style={{height: '100vh', background: colorBgContainer}}>
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
          <Tabs
            onChange={onChange}
            activeKey={file?.path}
            type="editable-card"
            onEdit={onEdit}
            items={files.map(f => (
              { label: `${f.name}`, 
                children: <MarkdownEditor 
                    isActived={f.path === file?.path}
                    fileContent={f.fileContent || ''} 
                    onChange={value => setFileContentByPath(f.path, value)}/>,
                key: f.path }))}
          /> : <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                background: colorBgContainer,
                paddingLeft: '10px',
                fontWeight: 'bold',
                justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <h3>欢迎使用</h3>
                <a style={{padding: '0 10px'}} onClick={() => addAction('requestLoadFile') }>打开文件</a>
                <a style={{padding: '0 10px'}} onClick={() => addAction('requestLoadFolder') }>打开目录</a>
                <a style={{padding: '0 10px'}} onClick={() => addAction('requestNewFile') }>新建文件</a>
              </div>
        } 
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
