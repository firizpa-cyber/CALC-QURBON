import { useEffect, useRef } from 'react'

export default function AirplaneCursor() {
    const planeRef = useRef(null)

    useEffect(() => {
        const el = planeRef.current
        let mouseX = -100, mouseY = -100
        let planeX = -100, planeY = -100
        let prevX = -100, prevY = -100
        let currentAngle = -45
        let counter = 0
        let rafId

        const onMove = (e) => { mouseX = e.clientX; mouseY = e.clientY }
        const onLeave = () => { el.style.opacity = '0' }
        const onEnter = () => { el.style.opacity = '1' }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseleave', onLeave)
        document.addEventListener('mouseenter', onEnter)

        function lerpAngle(from, to, t) {
            // Shortest path interpolation for angles
            let diff = to - from
            while (diff > 180) diff -= 360
            while (diff < -180) diff += 360
            return from + diff * t
        }

        function animate() {
            // Smooth position follow
            planeX += (mouseX - planeX) * 0.12
            planeY += (mouseY - planeY) * 0.12

            // Direction calculation
            const dx = planeX - prevX
            const dy = planeY - prevY
            const speed = Math.sqrt(dx * dx + dy * dy)

            // Smooth angle rotation with lerp
            if (speed > 0.3) {
                const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI)
                currentAngle = lerpAngle(currentAngle, targetAngle, 0.08)
            }

            // Dynamic tilt based on speed
            const tilt = Math.min(speed * 1.5, 15)

            el.style.left = (planeX - 16) + 'px'
            el.style.top = (planeY - 16) + 'px'
            el.style.transform = `rotate(${currentAngle}deg) scale(${1 + speed * 0.005})`

            // Update SVG wing tilt for realism
            const wings = el.querySelector('.plane-body')
            if (wings) {
                wings.style.transform = `perspective(100px) rotateX(${tilt}deg)`
            }

            // Trail particles
            counter++
            if (speed > 1.2 && counter % 2 === 0) {
                createTrail(planeX, planeY, speed)
            }

            prevX = planeX
            prevY = planeY
            rafId = requestAnimationFrame(animate)
        }

        function createTrail(x, y, speed) {
            const trail = document.createElement('div')
            trail.className = 'airplane-trail'
            const size = 3 + Math.min(speed * 0.5, 5)
            trail.style.width = size + 'px'
            trail.style.height = size + 'px'
            trail.style.left = (x - size / 2) + 'px'
            trail.style.top = (y - size / 2) + 'px'
            trail.style.opacity = Math.min(0.3 + speed * 0.05, 0.8)
            document.body.appendChild(trail)
            setTimeout(() => trail.remove(), 700)
        }

        rafId = requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(rafId)
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseleave', onLeave)
            document.removeEventListener('mouseenter', onEnter)
        }
    }, [])

    return (
        <div className="airplane-cursor" ref={planeRef}>
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="plane-body">
                {/* Shadow / glow */}
                <defs>
                    <linearGradient id="bodyGrad" x1="10" y1="10" x2="55" y2="55">
                        <stop offset="0%" stopColor="#e0e7ff" />
                        <stop offset="50%" stopColor="#c7d2fe" />
                        <stop offset="100%" stopColor="#a5b4fc" />
                    </linearGradient>
                    <linearGradient id="wingGrad" x1="0" y1="20" x2="0" y2="50">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="tailGrad" x1="10" y1="10" x2="20" y2="25">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                {/* Fuselage */}
                <path d="M58 30 L38 26 L10 24 L4 30 L10 36 L38 34 L58 30Z"
                    fill="url(#bodyGrad)" stroke="#818cf8" strokeWidth="0.5" filter="url(#glow)" />
                {/* Top wing */}
                <path d="M30 26 L22 8 L18 8 L24 26Z"
                    fill="url(#wingGrad)" opacity="0.9" />
                {/* Bottom wing */}
                <path d="M30 34 L22 52 L18 52 L24 34Z"
                    fill="url(#wingGrad)" opacity="0.9" />
                {/* Tail fin top */}
                <path d="M12 24 L6 14 L4 15 L10 24Z"
                    fill="url(#tailGrad)" opacity="0.85" />
                {/* Tail fin bottom */}
                <path d="M12 36 L6 46 L4 45 L10 36Z"
                    fill="url(#tailGrad)" opacity="0.85" />
                {/* Cockpit window */}
                <ellipse cx="48" cy="30" rx="4" ry="2.5"
                    fill="#38bdf8" opacity="0.7" />
                {/* Engine glow */}
                <circle cx="5" cy="30" r="2" fill="#f97316" opacity="0.6">
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="0.4s" repeatCount="indefinite" />
                    <animate attributeName="r" values="1.5;2.5;1.5" dur="0.4s" repeatCount="indefinite" />
                </circle>
            </svg>
        </div>
    )
}
