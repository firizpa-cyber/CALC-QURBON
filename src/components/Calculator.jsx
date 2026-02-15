import { useState, useEffect, useCallback, useRef } from 'react'

const OPS = { add: '+', subtract: '−', multiply: '×', divide: '÷', power: '^', exp: '×10^' }

function formatNumber(num) {
    if (isNaN(num)) return num
    const str = num.toString()
    if (str.includes('e')) return str
    const parts = str.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    return parts.join('.')
}

function roundResult(v) { return Math.round(v * 1e12) / 1e12 }

function factorial(n) {
    if (n < 0 || n > 170 || n !== Math.floor(n)) return NaN
    let r = 1; for (let i = 2; i <= n; i++) r *= i; return r
}

export default function Calculator({ addHistory, onShowInfo }) {
    const [current, setCurrent] = useState('0')
    const [previous, setPrevious] = useState('')
    const [operator, setOperator] = useState(null)
    const [expression, setExpression] = useState('')
    const [shouldReset, setShouldReset] = useState(false)
    const [useDeg, setUseDeg] = useState(true)
    const [sciMode, setSciMode] = useState(false)
    const [activeOp, setActiveOp] = useState(null)

    const stateRef = useRef({})
    stateRef.current = { current, previous, operator, shouldReset, useDeg }

    useEffect(() => {
        window.__calcSetValue = (val) => { setCurrent(val.toString()); setShouldReset(true) }
        return () => { delete window.__calcSetValue }
    }, [])

    const inputNumber = useCallback((num) => {
        setCurrent(prev => {
            if (stateRef.current.shouldReset) { setShouldReset(false); return num }
            return prev === '0' ? num : prev + num
        })
        setShouldReset(false)
    }, [])

    const inputDecimal = useCallback(() => {
        setCurrent(prev => {
            if (stateRef.current.shouldReset) { setShouldReset(false); return '0.' }
            return prev.includes('.') ? prev : prev + '.'
        })
        setShouldReset(false)
    }, [])

    const doCalc = useCallback((prevVal, op, currVal, toHistory = true) => {
        const prev = parseFloat(prevVal), curr = parseFloat(currVal)
        let result
        switch (op) {
            case 'add': result = prev + curr; break
            case 'subtract': result = prev - curr; break
            case 'multiply': result = prev * curr; break
            case 'divide':
                if (curr === 0) { setCurrent('Деление на 0'); setExpression(''); setOperator(null); setPrevious(''); setShouldReset(true); setActiveOp(null); return }
                result = prev / curr; break
            case 'power': result = Math.pow(prev, curr); break
            case 'exp': result = prev * Math.pow(10, curr); break
            default: return
        }
        result = roundResult(result)
        if (!isFinite(result)) { setCurrent('Ошибка'); setExpression(''); setOperator(null); setPrevious(''); setShouldReset(true); setActiveOp(null); return }
        const fullExpr = `${formatNumber(prev)} ${OPS[op]} ${formatNumber(curr)}`
        if (toHistory) addHistory(fullExpr, result)
        setExpression(`${fullExpr} =`); setCurrent(result.toString()); setOperator(null); setPrevious(''); setShouldReset(true); setActiveOp(null)
    }, [addHistory])

    const inputOperator = useCallback((op) => {
        setCurrent(curr => {
            const st = stateRef.current
            if (st.operator && !st.shouldReset) doCalc(st.previous, st.operator, curr, false)
            setPrevious(curr); setOperator(op); setShouldReset(true); setActiveOp(op)
            setExpression(`${formatNumber(parseFloat(curr))} ${OPS[op]}`)
            return curr
        })
    }, [doCalc])

    const calculate = useCallback(() => {
        const st = stateRef.current
        if (!st.operator || st.previous === '') return
        setCurrent(curr => { doCalc(st.previous, st.operator, curr, true); return curr })
    }, [doCalc])

    const clear = useCallback(() => {
        setCurrent('0'); setPrevious(''); setOperator(null); setShouldReset(false); setExpression(''); setActiveOp(null)
    }, [])

    const backspace = useCallback(() => {
        setCurrent(prev => {
            if (stateRef.current.shouldReset || prev === 'Ошибка' || prev === 'Деление на 0') { clear(); return '0' }
            return prev.slice(0, -1) || '0'
        })
    }, [clear])

    const toggleSign = useCallback(() => {
        setCurrent(prev => (prev === '0' || prev === 'Ошибка') ? prev : (parseFloat(prev) * -1).toString())
    }, [])

    const percent = useCallback(() => {
        setCurrent(prev => {
            if (prev === 'Ошибка') return prev
            const val = parseFloat(prev), st = stateRef.current
            return st.operator && st.previous ? (parseFloat(st.previous) * val / 100).toString() : (val / 100).toString()
        })
    }, [])

    const applyUnary = useCallback((label, fn, isPost = false) => {
        setCurrent(prev => {
            const val = parseFloat(prev); if (isNaN(val)) return prev
            let result = roundResult(fn(val))
            if (isNaN(result) || !isFinite(result)) { setExpression(''); setShouldReset(true); return 'Ошибка' }
            const expr = isPost ? `${formatNumber(val)}${label}` : `${label}(${formatNumber(val)})`
            addHistory(expr, result); setExpression(`${expr} =`); setShouldReset(true); return result.toString()
        })
    }, [addHistory])

    const trigFn = useCallback((fn) => {
        setCurrent(prev => {
            const val = parseFloat(prev); if (isNaN(val)) return prev
            let result
            if (['sin', 'cos', 'tan'].includes(fn)) {
                result = Math[fn](stateRef.current.useDeg ? val * Math.PI / 180 : val)
            } else { result = Math[fn](val); if (stateRef.current.useDeg) result *= 180 / Math.PI }
            result = roundResult(result)
            if (isNaN(result) || !isFinite(result)) { setExpression(''); setShouldReset(true); return 'Ошибка' }
            const expr = `${fn}(${formatNumber(val)})`
            addHistory(expr, result); setExpression(`${expr} =`); setShouldReset(true); return result.toString()
        })
    }, [addHistory])

    const doFactorial = useCallback(() => {
        setCurrent(prev => {
            const val = parseFloat(prev); const result = factorial(val)
            if (isNaN(result)) { setExpression(''); setShouldReset(true); return 'Ошибка' }
            const expr = `${formatNumber(val)}!`
            addHistory(expr, result); setExpression(`${expr} =`); setShouldReset(true); return result.toString()
        })
    }, [addHistory])

    const handleBtn = useCallback((action) => {
        if (action >= '0' && action <= '9') return inputNumber(action)
        if (action === 'decimal') return inputDecimal()
        if (['add', 'subtract', 'multiply', 'divide'].includes(action)) return inputOperator(action)
        if (action === 'equals') return calculate()
        if (action === 'clear') return clear()
        if (action === 'backspace') return backspace()
        if (action === 'toggle-sign') return toggleSign()
        if (action === 'percent') return percent()
        if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(action)) return trigFn(action)
        if (action === 'ln') return applyUnary('ln', Math.log)
        if (action === 'log') return applyUnary('log', Math.log10)
        if (action === 'sqrt') return applyUnary('√', Math.sqrt)
        if (action === 'cbrt') return applyUnary('³√', Math.cbrt)
        if (action === 'square') return applyUnary('²', v => v * v, true)
        if (action === 'cube') return applyUnary('³', v => v * v * v, true)
        if (action === 'factorial') return doFactorial()
        if (action === 'abs') return applyUnary('|x|', Math.abs)
        if (action === 'inverse') return applyUnary('1/', v => 1 / v)
        if (action === 'pi') { setCurrent(Math.PI.toString()); setShouldReset(true); return }
        if (action === 'e') { setCurrent(Math.E.toString()); setShouldReset(true); return }
        if (action === 'power') return inputOperator('power')
        if (action === 'exp') return inputOperator('exp')
    }, [inputNumber, inputDecimal, inputOperator, calculate, clear, backspace, toggleSign, percent, trigFn, applyUnary, doFactorial])

    useEffect(() => {
        const handler = (e) => {
            const k = e.key
            if (k >= '0' && k <= '9') { e.preventDefault(); handleBtn(k) }
            else if (k === '.') { e.preventDefault(); handleBtn('decimal') }
            else if (k === '+') { e.preventDefault(); handleBtn('add') }
            else if (k === '-') { e.preventDefault(); handleBtn('subtract') }
            else if (k === '*') { e.preventDefault(); handleBtn('multiply') }
            else if (k === '/') { e.preventDefault(); handleBtn('divide') }
            else if (k === 'Enter' || k === '=') { e.preventDefault(); handleBtn('equals') }
            else if (k === 'Escape' || k === 'Delete') { e.preventDefault(); handleBtn('clear') }
            else if (k === 'Backspace') { e.preventDefault(); handleBtn('backspace') }
            else if (k === '%') { e.preventDefault(); handleBtn('percent') }
            else if (k === '^') { e.preventDefault(); handleBtn('power') }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [handleBtn])

    const ripple = (e) => {
        const btn = e.currentTarget, rect = btn.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const r = document.createElement('span'); r.className = 'ripple'
        r.style.width = r.style.height = size + 'px'
        r.style.left = (e.clientX - rect.left - size / 2) + 'px'
        r.style.top = (e.clientY - rect.top - size / 2) + 'px'
        btn.appendChild(r); setTimeout(() => r.remove(), 500)
    }

    const B = (action, label, cls) => (
        <button key={action} className={`btn ${cls}${action === activeOp ? ' active' : ''}`}
            onClick={(e) => { ripple(e); handleBtn(action) }}>{label}</button>
    )

    const displayValue = ['Ошибка', 'Деление на 0'].includes(current)
        ? current : (current.endsWith('.') ? formatNumber(parseFloat(current)) + '.' : formatNumber(parseFloat(current)))

    return (
        <div className={`calculator${sciMode ? ' scientific-mode' : ''}`}>
            <div className="calc-header">
                <div className="brand">Курбон</div>
                <div className="header-actions">
                    <button className="info-trigger" onClick={onShowInfo} title="Почему React?">⚛️</button>
                    <div className="mode-toggle">
                        <button className={`mode-btn${!sciMode ? ' active' : ''}`} onClick={() => setSciMode(false)}>Обычный</button>
                        <button className={`mode-btn${sciMode ? ' active' : ''}`} onClick={() => setSciMode(true)}>Научный</button>
                    </div>
                </div>
            </div>

            <div className="display">
                <div className={`angle-indicator${sciMode ? ' visible' : ''}`}>{useDeg ? 'DEG' : 'RAD'}</div>
                <div className="expression">{expression}</div>
                <div className={`result${current.length > 10 ? ' shrink' : ''}`}>{displayValue}</div>
            </div>

            <div className={`sci-panel${sciMode ? ' open' : ''}`}>
                <div className="sci-row">
                    {B('sin', 'sin', 'btn-sci')}{B('cos', 'cos', 'btn-sci')}{B('tan', 'tan', 'btn-sci')}{B('pi', 'π', 'btn-sci')}{B('e', 'e', 'btn-sci')}
                </div>
                <div className="sci-row">
                    {B('asin', 'sin⁻¹', 'btn-sci')}{B('acos', 'cos⁻¹', 'btn-sci')}{B('atan', 'tan⁻¹', 'btn-sci')}{B('ln', 'ln', 'btn-sci')}{B('log', 'log', 'btn-sci')}
                </div>
                <div className="sci-row">
                    {B('sqrt', '√x', 'btn-sci')}{B('cbrt', '³√x', 'btn-sci')}{B('power', 'xⁿ', 'btn-sci')}{B('square', 'x²', 'btn-sci')}{B('cube', 'x³', 'btn-sci')}
                </div>
                <div className="sci-row">
                    {B('factorial', 'x!', 'btn-sci')}{B('abs', '|x|', 'btn-sci')}{B('inverse', '1/x', 'btn-sci')}{B('exp', 'EXP', 'btn-sci')}
                    <button className="btn btn-sci" onClick={(e) => { ripple(e); setUseDeg(d => !d) }}>{useDeg ? 'RAD' : 'DEG'}</button>
                </div>
            </div>

            <div className="buttons">
                {B('clear', 'AC', 'btn-function')}{B('backspace', '⌫', 'btn-function')}{B('percent', '%', 'btn-function')}{B('divide', '÷', 'btn-operator')}
                {B('7', '7', 'btn-number')}{B('8', '8', 'btn-number')}{B('9', '9', 'btn-number')}{B('multiply', '×', 'btn-operator')}
                {B('4', '4', 'btn-number')}{B('5', '5', 'btn-number')}{B('6', '6', 'btn-number')}{B('subtract', '−', 'btn-operator')}
                {B('1', '1', 'btn-number')}{B('2', '2', 'btn-number')}{B('3', '3', 'btn-number')}{B('add', '+', 'btn-operator')}
                {B('toggle-sign', '±', 'btn-number')}{B('0', '0', 'btn-number')}{B('decimal', '.', 'btn-number')}{B('equals', '=', 'btn-equals')}
            </div>
        </div>
    )
}
