import { useState, useCallback, useEffect } from 'react'
import Calculator from './components/Calculator'
import History from './components/History'
import ThemeSwitcher from './components/ThemeSwitcher'
import InfoPanel from './components/InfoPanel'

// Профессиональные темы
const THEMES = {
    dark: { name: 'Dark', icon: '🌑', accent: '#007acc', bg: '#1e1e1e', surface: '#2d2d2d' },
    light: { name: 'Light', icon: '☀️', accent: '#0078d7', bg: '#f3f3f3', surface: '#ffffff' },
    ocean: { name: 'Ocean', icon: '🌊', accent: '#00cec9', bg: '#101a24', surface: '#182533' },
    midnight: { name: 'Midnight', icon: '🌌', accent: '#a29bfe', bg: '#0c0c16', surface: '#16162a' },
}

function applyTheme(key) {
    const t = THEMES[key]
    const r = document.documentElement.style
    r.setProperty('--accent', t.accent)
    r.setProperty('--bg', t.bg)
    r.setProperty('--surface', t.surface)
    r.setProperty('--surface-2', key === 'light' ? '#e5e5e5' : '#3d3d3d')
    r.setProperty('--text', key === 'light' ? '#000000' : '#ffffff')
    r.setProperty('--text-dim', key === 'light' ? '#666666' : '#a0a0a0')
}

export default function App() {
    const [history, setHistory] = useState([])
    const [theme, setTheme] = useState('dark')
    const [showInfo, setShowInfo] = useState(false)

    useEffect(() => { applyTheme('dark') }, [])

    const handleThemeChange = useCallback((t) => {
        setTheme(t); applyTheme(t)
    }, [])

    const addHistory = useCallback((expression, result) => {
        setHistory(prev => [{ expression, result }, ...prev].slice(0, 30))
    }, [])

    const clearHistory = useCallback(() => setHistory([]), [])

    const handleHistoryClick = useCallback((result) => {
        window.__calcSetValue?.(result)
    }, [])

    return (
        <div className="app-wrapper">
            <Calculator addHistory={addHistory} onShowInfo={() => setShowInfo(true)} />
            <div className="side-panel">
                <ThemeSwitcher themes={THEMES} current={theme} onChange={handleThemeChange} />
                <History items={history} onClear={clearHistory} onItemClick={handleHistoryClick} />
            </div>
            {showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}
        </div>
    )
}
