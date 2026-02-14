import { useState, useEffect, useCallback, useRef } from 'react'

const OPS = { add: '+', subtract: '−', multiply: '×', divide: '÷', power: '^', exp: '×10^' }
function fmt(num) {
    if (isNaN(num)) return num
    const s = num.toString()
    if (s.includes('e')) return s
    const p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return p.join('.')
}
const rd = v => Math.round(v * 1e12) / 1e12
function fact(n) { if (n < 0 || n > 170 || n !== Math.floor(n)) return NaN; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r }

export default function Calculator({ addHistory, onShowInfo }) {
    const [cur, setCur] = useState('0')
    const [prev, setPrev] = useState('')
    const [op, setOp] = useState(null)
    const [expr, setExpr] = useState('')
    const [reset, setReset] = useState(false)
    const [deg, setDeg] = useState(true)
    const [sci, setSci] = useState(false)
    const [activeOp, setActiveOp] = useState(null)
    const [pressed, setPressed] = useState(null)
    const ref = useRef({})
    ref.current = { cur, prev, op, reset, deg }

    // ... (Calculation logic same as before) ...
    useEffect(() => { window.__calcSetValue = v => { setCur(v.toString()); setReset(true) }; return () => { delete window.__calcSetValue } }, [])
    const inputNum = useCallback(n => { setCur(p => { if (ref.current.reset) { setReset(false); return n } return p === '0' ? n : p + n }); setReset(false) }, [])
    const inputDec = useCallback(() => { setCur(p => { if (ref.current.reset) { setReset(false); return '0.' } return p.includes('.') ? p : p + '.' }); setReset(false) }, [])
    const calc = useCallback((pv, o, cv, hist = true) => {
        const p = parseFloat(pv), c = parseFloat(cv); let r
        switch (o) { case 'add': r = p + c; break; case 'subtract': r = p - c; break; case 'multiply': r = p * c; break; case 'divide': if (c === 0) { setCur('Err'); setReset(true); return } r = p / c; break; case 'power': r = Math.pow(p, c); break; case 'exp': r = p * Math.pow(10, c); break; default: return }
        r = rd(r); if (!isFinite(r)) { setCur('Err'); setReset(true); return }
        const e = `${fmt(p)}${OPS[o]}${fmt(c)}`; if (hist) addHistory(e, r); setExpr(e); setCur(r.toString()); setOp(null); setPrev(''); setReset(true); setActiveOp(null)
    }, [addHistory])
    const inputOp = useCallback(o => { setCur(c => { const s = ref.current; if (s.op && !s.reset) calc(s.prev, s.op, c, false); setPrev(c); setOp(o); setReset(true); setActiveOp(o); setExpr(`${fmt(parseFloat(c))} ${OPS[o]}`); return c }) }, [calc])
    const equals = useCallback(() => { const s = ref.current; if (!s.op || s.prev === '') return; setCur(c => { calc(s.prev, s.op, c); return c }) }, [calc])
    const clear = useCallback(() => { setCur('0'); setPrev(''); setOp(null); setReset(false); setExpr(''); setActiveOp(null) }, [])
    const back = useCallback(() => { setCur(p => { if (ref.current.reset || p === 'Err') { clear(); return '0' } return p.slice(0, -1) || '0' }) }, [clear])
    const sign = useCallback(() => setCur(p => (parseFloat(p) * -1).toString()), [])
    const pct = useCallback(() => { setCur(p => { const v = parseFloat(p), s = ref.current; return s.op && s.prev ? (parseFloat(s.prev) * v / 100).toString() : (v / 100).toString() }) }, [])
    const unary = useCallback((lbl, fn, post) => { setCur(p => { const v = parseFloat(p), r = rd(fn(v)); if (isNaN(r)) return 'Err'; addHistory(post ? `${fmt(v)}${lbl}` : `${lbl}(${fmt(v)})`, r); setReset(true); return r.toString() }) }, [addHistory])
    const trig = useCallback(fn => { setCur(p => { const v = parseFloat(p), r = rd(['sin', 'cos', 'tan'].includes(fn) ? Math[fn](ref.current.deg ? v * Math.PI / 180 : v) : (Math[fn](v) * (ref.current.deg ? 180 / Math.PI : 1))); if (isNaN(r)) return 'Err'; addHistory(`${fn}(${fmt(v)})`, r); setReset(true); return r.toString() }) }, [addHistory])

    const handle = useCallback(a => {
        if (a >= '0' && a <= '9') return inputNum(a); if (a === '.') return inputDec();
        const ops = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' }; if (ops[a]) return inputOp(ops[a])
        if (['add', 'subtract', 'multiply', 'divide'].includes(a)) return inputOp(a); if (a === '=') return equals()
        if (a === 'clear') return clear(); if (a === 'back') return back(); if (a === 'sign') return sign(); if (a === 'pct') return pct()
        // ... basic handlers ...
    }, [inputNum, inputDec, inputOp, equals, clear, back, sign, pct])

    const press = (action) => { setPressed(action); setTimeout(() => setPressed(null), 150); handle(action) }
    const B = (action, label, type = '') => (
        <button key={action} className={`btn ${type}${action === activeOp ? ' active' : ''}${action === pressed ? ' pressing' : ''}`} onPointerDown={() => press(action)}>{label}</button>
    )

    const dv = ['Err', 'Infinity'].includes(cur) ? cur : fmt(parseFloat(cur)) + (cur.endsWith('.') ? '.' : '')

    return (
        <div className={`calc${sci ? ' sci-open' : ''}`}>
            <div className="calc-top">
                <div className="brand">Kami Calc 💕</div>
                <div className="top-actions">
                    <div className="seg-ctrl">
                        <button className={`seg${!sci ? ' on' : ''}`} onClick={() => setSci(false)}>123</button>
                        <button className={`seg${sci ? ' on' : ''}`} onClick={() => setSci(true)}>ƒ(x)</button>
                    </div>
                </div>
            </div>

            <div className="display">
                {sci && <span className="deg-badge">{deg ? 'DEG' : 'RAD'}</span>}
                <div className="expr">{expr}</div>
                <div className={`val${cur.length > 9 ? ' sm' : ''}`}>{dv}</div>
            </div>

            {sci && (
                <div className="sci-grid">
                    {B('sin', 'sin', 's')}{B('cos', 'cos', 's')}{B('tan', 'tan', 's')}{B('pi', 'π', 's')}{B('e', 'e', 's')}
                    {B('sqrt', '√', 's')}{B('power', '^', 's')}{B('ln', 'ln', 's')}{B('log', 'log', 's')}{B('inv', '1/x', 's')}
                </div>
            )}

            <div className="grid">
                {B('clear', 'AC', 'f')}{B('back', '⌫', 'f')}{B('pct', '%', 'f')}{B('divide', '÷', 'op')}
                {B('7', '7', 'n')}{B('8', '8', 'n')}{B('9', '9', 'n')}{B('multiply', '×', 'op')}
                {B('4', '4', 'n')}{B('5', '5', 'n')}{B('6', '6', 'n')}{B('subtract', '−', 'op')}
                {B('1', '1', 'n')}{B('2', '2', 'n')}{B('3', '3', 'n')}{B('add', '+', 'op')}
                {B('sign', '±', 'n')}{B('0', '0', 'n')}{B('.', '·', 'n')}{B('equals', '=', 'eq')}
            </div>
        </div>
    )
}
