import { useState, useCallback, useEffect } from 'react'
import Calculator from './components/Calculator'
import History from './components/History'
import LoveBackground from './components/LoveBackground'
import ThemeSwitcher from './components/ThemeSwitcher'
import InfoPanel from './components/InfoPanel'

const THEMES = {
    love: { name: 'Любовь', icon: '💕', accent: '#e84393', accentLight: '#fd79a8', bg: '#1a0a12' },
    sakura: { name: 'Сакура', icon: '🌸', accent: '#e17055', accentLight: '#fab1a0', bg: '#1a0f0a' },
    ocean: { name: 'Океан', icon: '🌊', accent: '#0984e3', accentLight: '#74b9ff', bg: '#0a0f1a' },
    mint: { name: 'Мята', icon: '🍃', accent: '#00b894', accentLight: '#55efc4', bg: '#0a1a12' },
    violet: { name: 'Фиалка', icon: '💜', accent: '#6c5ce7', accentLight: '#a29bfe', bg: '#0f0a1a' },
}

function applyTheme(key) {
    const t = THEMES[key]
    const r = document.documentElement.style
    r.setProperty('--accent', t.accent)
    r.setProperty('--accent-light', t.accentLight)
    r.setProperty('--bg', t.bg)
}

export default function App() {
    const [history, setHistory] = useState([])
    const [theme, setTheme] = useState('love')
    const [showInfo, setShowInfo] = useState(false)

    useEffect(() => { applyTheme('love') }, [])

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
        <>
            <LoveBackground />
            <div className="app-wrapper">
                <Calculator addHistory={addHistory} onShowInfo={() => setShowInfo(true)} />
                <div className="side-panel">
                    <ThemeSwitcher themes={THEMES} current={theme} onChange={handleThemeChange} />
                    <History items={history} onClear={clearHistory} onItemClick={handleHistoryClick} />
                </div>
            </div>
            {showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}
        </>
    )
}
