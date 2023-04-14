import { theme } from 'antd'

export const Welcome = () => {

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const addAction = (action) => {
        // boswer send action 
        window.api[action]()
    }

    return (
        <div
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
            <a style={{ padding: '0 10px' }} onClick={() => addAction('requestLoadFile')}>打开文件</a>
            <a style={{ padding: '0 10px' }} onClick={() => addAction('requestLoadFolder')}>打开目录</a>
            <a style={{ padding: '0 10px' }} onClick={() => addAction('requestNewFile')}>新建文件</a>
        </div>
    )
}