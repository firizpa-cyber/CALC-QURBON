export default function History({ items, onClear, onItemClick }) {
    return (
        <div className="history">
            <div className="history-top">
                <h3>История</h3>
                {items.length > 0 && <button className="clear-btn" onClick={onClear}>Очистить</button>}
            </div>
            <div className="history-list">
                {items.length === 0 ? (
                    <div className="history-empty">💕 Начните считать</div>
                ) : items.map((item, i) => (
                    <div key={i} className="history-item" onClick={() => onItemClick(item.result.toString())}>
                        <div className="h-expr">{item.expression}</div>
                        <div className="h-result">= {item.result}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
