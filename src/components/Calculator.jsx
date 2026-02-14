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

function calculate(pVal, op, cVal) {
    const p = parseFloat(pVal), c = parseFloat(cVal)
    let r
    switch (op) {
        case 'add': r = p + c; break
        case 'subtract': r = p - c; break
        case 'multiply': r = p * c; break
        case 'divide': if (c === 0) return 'Error'; r = p / c; break
        case 'power': r = Math.pow(p, c); break
        case 'exp': r = p * Math.pow(10, c); break
        default: return cVal
    }
    r = rd(r)
    return isFinite(r) ? r : 'Error'
}

export default function Calculator({ addHistory, onShowInfo }) {
    console.log("Calculator Component Rendered")
    const [cur, setCur] = useState('0')
    const [prev, setPrev] = useState('')
    const [op, setOp] = useState(null)
    const [expr, setExpr] = useState('')
    const [reset, setReset] = useState(false)
    const [deg, setDeg] = useState(true)
    const [sci, setSci] = useState(true)
    const [activeOp, setActiveOp] = useState(null)
    const [pressed, setPressed] = useState(null)

    const ref = useRef({})
    useEffect(() => { ref.current = { cur, prev, op, reset, deg } }) // Update ref on every render

    useEffect(() => {
        window.__calcSetValue = v => { setCur(v.toString()); setReset(true) }
        return () => { delete window.__calcSetValue }
    }, [])

    const inputNum = useCallback(n => {
        setCur(p => {
            const s = ref.current
            if (s.reset) { setReset(false); return n }
            return p === '0' ? n : p + n
        })
        setReset(false)
    }, [])

    const inputDec = useCallback(() => {
        setCur(p => {
            const s = ref.current
            if (s.reset) { setReset(false); return '0.' }
            return p.includes('.') ? p : p + '.'
        })
        setReset(false)
    }, [])

    const inputOp = useCallback(o => {
        const s = ref.current
        let val = s.cur

        if (s.op && !s.reset) {
            const result = calculate(s.prev, s.op, s.cur)
            if (result === 'Error') {
                setCur('Error'); setReset(true); setOp(null); setPrev(''); return
            }
            setCur(result.toString())
            setPrev(result.toString())
            val = result.toString()
            // Optional: add to history for intermediate steps? usually not for chaining
        } else {
            setPrev(val)
        }

        setOp(o)
        setReset(true)
        setActiveOp(o)
        setExpr(`${fmt(parseFloat(val))} ${OPS[o]}`)
    }, [])

    const equals = useCallback(() => {
        const s = ref.current
        if (!s.op || s.prev === '') return

        const result = calculate(s.prev, s.op, s.cur)
        if (result === 'Error') {
            setCur('Error'); setReset(true); setOp(null); setPrev(''); setExpr(''); return
        }

        const e = `${fmt(parseFloat(s.prev))} ${OPS[s.op]} ${fmt(parseFloat(s.cur))}`
        addHistory(e, result)
        setExpr(e)
        setCur(result.toString())
        setOp(null)
        setPrev('')
        setReset(true)
        setActiveOp(null)
    }, [addHistory])

    const clear = useCallback(() => {
        setCur('0'); setPrev(''); setOp(null); setReset(false); setExpr(''); setActiveOp(null)
    }, [])

    const back = useCallback(() => {
        const s = ref.current
        if (s.reset || s.cur === 'Error') { clear(); return }
        setCur(p => p.slice(0, -1) || '0')
    }, [clear])

    const sign = useCallback(() => setCur(p => (parseFloat(p) * -1).toString()), [])

    const pct = useCallback(() => {
        const s = ref.current
        const v = parseFloat(s.cur)
        if (s.op && s.prev) {
            const res = (parseFloat(s.prev) * v / 100).toString()
            setCur(res)
        } else {
            setCur((v / 100).toString())
        }
        setReset(true)
    }, [])

    const unary = useCallback((lbl, fn, post) => {
        const s = ref.current
        const v = parseFloat(s.cur)
        const r = rd(fn(v))
        if (isNaN(r) || !isFinite(r)) { setCur('Error'); setReset(true); return }
        const resStr = r.toString()
        addHistory(post ? `${fmt(v)}${lbl}` : `${lbl}(${fmt(v)})`, r)
        setCur(resStr)
        setReset(true)
    }, [addHistory])

    const trig = useCallback(fn => {
        const s = ref.current
        const v = parseFloat(s.cur)
        const angle = s.deg ? v * Math.PI / 180 : v
        const val = ['sin', 'cos', 'tan'].includes(fn) ? Math[fn](angle) : (Math[fn](v) * (180 / Math.PI))
        const r = rd(val)
        if (isNaN(r) || !isFinite(r)) { setCur('Error'); setReset(true); return }
        addHistory(`${fn}(${fmt(v)})`, r)
        setCur(r.toString())
        setReset(true)
    }, [addHistory])

    const handle = useCallback(a => {
        if (a >= '0' && a <= '9') return inputNum(a); if (a === '.') return inputDec();
        const ops = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' }; if (ops[a]) return inputOp(ops[a])
        if (['add', 'subtract', 'multiply', 'divide'].includes(a)) return inputOp(a); if (a === '=') return equals()
        if (a === 'clear') return clear(); if (a === 'back') return back(); if (a === 'sign') return sign(); if (a === 'pct') return pct()
        if (a === 'sin' || a === 'cos' || a === 'tan' || a === 'asin' || a === 'acos' || a === 'atan') return trig(a)
        if (a === 'ln') return unary('ln', Math.log); if (a === 'log') return unary('log', Math.log10)
        if (a === 'sqrt') return unary('√', Math.sqrt); if (a === 'cbrt') return unary('³√', Math.cbrt)
        if (a === 'sq') return unary('²', x => x * x, true); if (a === 'cube') return unary('³', x => x * x * x, true)
        if (a === 'inv') return unary('⁻¹', x => 1 / x, true); if (a === 'abs') return unary('|', Math.abs)
        if (a === 'fact') return unary('!', fact, true); if (a === 'exp') return inputOp('exp'); if (a === 'power') return inputOp('power')
        if (a === 'pi') { setCur(Math.PI.toString()); setReset(true) }
        if (a === 'e') { setCur(Math.E.toString()); setReset(true) }
    }, [inputNum, inputDec, inputOp, equals, clear, back, sign, pct, unary, trig])

    useEffect(() => {
        const h = e => {
            const k = e.key
            if ((k >= '0' && k <= '9') || k === '.' || ['+', '-', '*', '/'].includes(k)) { e.preventDefault(); handle(k) }
            else if (k === 'Enter' || k === '=') { e.preventDefault(); handle('=') }
            else if (k === 'Escape') { e.preventDefault(); handle('clear') }
            else if (k === 'Backspace') { e.preventDefault(); handle('back') }
            else if (k === '%') { e.preventDefault(); handle('pct') }
        }
        document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h)
    }, [handle])

    const press = (action) => { setPressed(action); setTimeout(() => setPressed(null), 150); handle(action) }
    const B = (action, label, type = '') => (
        <button key={action} className={`btn ${type}${action === activeOp ? ' active' : ''}${action === pressed ? ' active' : ''}`} onClick={() => press(action)}>{label}</button>
    )

    const dv = ['Error', 'Infinity', 'NaN'].includes(cur) ? cur : fmt(parseFloat(cur)) + (cur.endsWith('.') ? '.' : '')

    return (
        <div className="calc">
            <div className="calc-top">
                <div className="brand">Scientific Calculator v3</div>
                <div className="top-actions">
                    <button className="icon-btn" onClick={onShowInfo}>ℹ️</button>
                    <div className="seg-ctrl">
                        <button className={`seg${!sci ? ' on' : ''}`} onClick={() => setSci(false)}>Basic</button>
                        <button className={`seg${sci ? ' on' : ''}`} onClick={() => setSci(true)}>Sci</button>
                    </div>
                </div>
            </div>

            <div className="display">
                {sci && <span className="deg-badge">{deg ? 'DEG' : 'RAD'}</span>}
                <div className="expr">{expr}</div>
                <div className={`val${cur.length > 10 ? ' sm' : ''}`}>{dv}</div>
            </div>

            {sci && (
                <div className="sci-grid">
                    {B('sin', 'sin', 's')}{B('cos', 'cos', 's')}{B('tan', 'tan', 's')}{B('pi', 'π', 's')}{B('e', 'e', 's')}
                    {B('asin', 'sin⁻¹', 's')}{B('acos', 'cos⁻¹', 's')}{B('atan', 'tan⁻¹', 's')}{B('ln', 'ln', 's')}{B('log', 'log', 's')}
                    {B('sqrt', '√', 's')}{B('cbrt', '³√', 's')}{B('power', 'xⁿ', 's')}{B('sq', 'x²', 's')}{B('cube', 'x³', 's')}
                    {B('fact', 'x!', 's')}{B('abs', '|x|', 's')}{B('inv', '1/x', 's')}{B('exp', 'EXP', 's')}
                    <button className="btn s" onClick={() => setDeg(d => !d)}>{deg ? 'RAD' : 'DEG'}</button>
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
