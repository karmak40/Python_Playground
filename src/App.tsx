import { HashRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nProvider'
import { ThemeProvider } from './theme/ThemeProvider'
import { StudioPage } from './pages/Studio/StudioPage'
import { DebuggerPage } from './pages/Debugger/DebuggerPage'
import { HelpPage } from './pages/Help/HelpPage'

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<StudioPage />} />
            <Route path="/debugger" element={<DebuggerPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </HashRouter>
      </I18nProvider>
    </ThemeProvider>
  )
}
