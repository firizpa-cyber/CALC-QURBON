export default function ThemeSwitcher({ themes, current, onChange }) {
    return (
        <div className="theme-switch">
            {Object.entries(themes).map(([key, t]) => (
                <button key={key}
                    className={`theme-chip${current === key ? ' active' : ''}`}
                    onClick={() => onChange(key)}>
                    {t.icon} {t.name}
                </button>
            ))}
        </div>
    )
}
