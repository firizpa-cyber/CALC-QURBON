export default function InfoPanel({ onClose }) {
    return (
        <div className="info-overlay" onClick={onClose}>
            <div className="info-panel" onClick={e => e.stopPropagation()}>
                <button className="info-close" onClick={onClose}>×</button>
                <h2>Почему React? ⚛️</h2>

                <div className="info-card">
                    <h4>1. Компоненты (Components)</h4>
                    <p>Весь интерфейс разбит на независимые кирпичики (Кнопки, Дисплей, История). Их легко менять и переиспользовать.</p>
                </div>

                <div className="info-card">
                    <h4>2. Состояние (State)</h4>
                    <p>React сам следит за данными. Когда меняется цифра на экране, React обновляет только эту часть, а не всю страницу.</p>
                </div>

                <div className="info-card">
                    <h4>3. Виртуальный DOM</h4>
                    <p>React работает быстрее, потому что сначала "рисует" изменения в памяти, а потом точечно обновляет браузер.</p>
                </div>

                <div className="info-card">
                    <h4>Сравнение</h4>
                    <table className="compare-table">
                        <thead>
                            <tr><th>Обычный JS</th><th>React</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Много <code>document.querySelector</code></td><td>Нет ручных выборок</td></tr>
                            <tr><td>Сложно обновлять UI</td><td>UI обновляется сам</td></tr>
                            <tr><td>Код — "спагетти"</td><td>Чёткая структура</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="info-card">
                    <p style={{ textAlign: 'center', opacity: 0.7, fontSize: '11px' }}>
                        Kami Calc 💕 v2.0 • Love Edition
                    </p>
                </div>
            </div>
        </div>
    )
}
