import { useState, useEffect, useRef } from 'react'
import { Button, Layout, theme, Tabs } from 'antd'
import MarkdownEditor from './components/MarkdownEditor'
import FileTree from './components/FileTree'
import { ProfileOutlined } from '@ant-design/icons'

const { Sider, Content } = Layout

const getFileName = (path: string) => {
  // windows
  if (path.indexOf('\\') > -1) {
    const arr = path.split('\\')
    return arr[arr.length - 1]
  } else {
    const arr = path.split('/')
    return arr[arr.length - 1]
  }
}

type IFile = {name: string, path: string, fileContent?: string}

function App(): JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const [file, setFile] = useState<IFile|null>(null)
  const [files, setFiles] = useState<IFile[]>([])
  const [folderTree, setFolderTree] = useState<any[]>([])

  const onChange = (key: string) => {
    setFile({ name: getFileName(key), path: key })
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

  const saveBtnRef = useRef(null)
  const saveAsBtnRef = useRef(null)

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

  const clickSaveFile = async () => {
    const _file = files.find(it => it.path === file?.path)
    if(_file) window.api.requestSaveFile(_file.fileContent || '', _file.path)
  }

  const clickSaveAsFile = async () => {
    const _file = files.find(it => it.path === file?.path)
    if(_file) window.api.requestSaveAsFile(_file.fileContent || '')
  }

  useEffect(() => {
    window.api.saveFile(() => {
      // @ts-ignore
      // setState callback 方式可以解决 待重构
      saveBtnRef.current.click()
    })
  
    window.api.saveAsFile(() => {
      // @ts-ignore
      // setState callback 方式可以解决 待重构
      saveAsBtnRef.current.click()
    })
  } , []) 

  useEffect(() => {
    window.api.newFile(() => {
      add({ name: '未命名文件', path: 'fakePath' + Date.now(), fileContent: '' });
    })

    window.api.loadFile((fileContent, file, oldFilePath) => {
      add({ name: file.name, path: file.path, fileContent: fileContent }, oldFilePath)
    })

    window.api.loadFolder(folderTree => {
      setFolderTree([folderTree])
    })
  }, [])

  return (
    <Layout style={{height: '100vh'}}>
      <Button style={{display: 'none'}} ref={saveBtnRef} onClick={()=> clickSaveFile()}>save</Button>
      <Button style={{display: 'none'}} ref={saveAsBtnRef} onClick={()=> clickSaveAsFile()}>saveAs</Button>
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
        <FileTree data={folderTree} onLoadData={loadSubFolderData} onSelect={onFileSelect}/>
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
            items={files.map(f => ({ label: `${f.name}`, children: <MarkdownEditor fileContent={f.fileContent || ''} onChange={value => setFileContentByPath(f.path, value)}/>, key: f.path }))}
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