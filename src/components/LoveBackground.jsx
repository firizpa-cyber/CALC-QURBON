import { useEffect, useRef } from 'react'

export default function LoveBackground() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let w, h, particles = [], raf

        function resize() {
            w = canvas.width = window.innerWidth
            h = canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        // Create more particles for richer effect
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 5 + Math.random() * 20,
                speed: 0.2 + Math.random() * 0.8,
                opacity: 0.1 + Math.random() * 0.3,
                type: Math.random() > 0.3 ? 'heart' : 'text',
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.005 + Math.random() * 0.015,
                color: ['#e84393', '#fd79a8', '#6c5ce7', '#a29bfe'][Math.floor(Math.random() * 4)]
            })
        }

        function drawHeart(x, y, size, opacity, color) {
            ctx.save()
            ctx.globalAlpha = opacity
            ctx.fillStyle = color
            ctx.translate(x, y)
            ctx.beginPath()
            const s = size / 20
            ctx.moveTo(0, -3 * s)
            ctx.bezierCurveTo(-5 * s, -10 * s, -14 * s, -3 * s, 0, 8 * s)
            ctx.moveTo(0, -3 * s)
            ctx.bezierCurveTo(5 * s, -10 * s, 14 * s, -3 * s, 0, 8 * s)
            ctx.fill()

            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.fill();

            ctx.restore()
        }

        function animate() {
            ctx.clearRect(0, 0, w, h)

            // Gradient background
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, '#1a0a12');
            grad.addColorStop(1, '#2d1b2e');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            particles.forEach(p => {
                p.y -= p.speed
                p.wobble += p.wobbleSpeed
                p.x += Math.sin(p.wobble) * 0.8

                if (p.y < -50) {
                    p.y = h + 50;
                    p.x = Math.random() * w;
                    p.opacity = 0.1 + Math.random() * 0.3;
                }

                if (p.type === 'heart') {
                    drawHeart(p.x, p.y, p.size, p.opacity, p.color)
                } else {
                    ctx.save()
                    ctx.globalAlpha = p.opacity
                    ctx.font = `bold ${p.size}px Inter, sans-serif`
                    ctx.fillStyle = p.color
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = p.color;
                    ctx.fillText('Kami', p.x, p.y)
                    ctx.restore()
                }
            })

            raf = requestAnimationFrame(animate)
        }
        raf = requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return <canvas ref={canvasRef} className="love-bg" />
}
