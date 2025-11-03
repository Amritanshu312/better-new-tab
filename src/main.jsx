import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { VideoProvider } from './context/VideoContext.jsx'
import { GeneralSettingsProvider } from './context/GeneralSettings'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VideoProvider>
      <GeneralSettingsProvider >
        <App />
      </GeneralSettingsProvider>
    </VideoProvider>
  </StrictMode>,
)
