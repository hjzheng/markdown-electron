import ReactDOM from 'react-dom/client'
import './assets/index.css'
import { theme, ConfigProvider } from 'antd';
import App from './App'
import useColorScheme from './utils/colorScheme'

const { defaultAlgorithm, darkAlgorithm } = theme;

function Main() {
  
  const mode = useColorScheme()

  return (<ConfigProvider
    theme={{
      algorithm: mode !== 'light' ? darkAlgorithm : defaultAlgorithm,
    }}>
    <App />
  </ConfigProvider>)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Main />
)
