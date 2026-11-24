import { useEffect, useRef } from 'react'

// Fond sobre : grille de points. Une onde lente la traverse ; autour du curseur les points
// grossissent, s'écartent et passent à l'orange ; un clic lance une onde circulaire.
const GAP = 30
const CREAM = [245, 214, 173]
const ORANGE = [234, 122, 30]

export default function Background() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }
    const ripples = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const onMove = (e) => {
      mouse.tx = e.clientX; mouse.ty = e.clientY
      if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty }
    }
    const onDown = (e) => { if (!e.target.closest('.win, .dock')) ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() }) }
    const onLeave = () => { mouse.tx = mouse.ty = -9999 }

    const draw = (now) => {
      const t = now / 1000
      mouse.x += (mouse.tx - mouse.x) * 0.15
      mouse.y += (mouse.ty - mouse.y) * 0.15
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2
      const cols = Math.ceil(w / GAP) + 1, rows = Math.ceil(h / GAP) + 1
      const ox = (w - (cols - 1) * GAP) / 2, oy = (h - (rows - 1) * GAP) / 2
      for (let r = ripples.length - 1; r >= 0; r--) if (now - ripples[r].t > 1800) ripples.splice(r, 1)

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          let x = ox + i * GAP, y = oy + j * GAP

          // Onde lente depuis le centre
          const dc = Math.hypot(x - cx, y - cy)
          let e = 0.5 + 0.5 * Math.sin(dc * 0.011 - t * 0.7)
          e = e * e * 0.35

          // Curseur
          const dx = x - mouse.x, dy = y - mouse.y
          const dm = Math.hypot(dx, dy)
          const k = Math.exp(-(dm * dm) / (150 * 150))
          if (k > 0.001 && dm > 0.1) { x += (dx / dm) * k * 14; y += (dy / dm) * k * 14 }

          // Clics
          let rip = 0
          for (const rp of ripples) {
            const age = (now - rp.t) / 1000
            const d = Math.hypot(x - rp.x, y - rp.y)
            rip += Math.exp(-(((d - age * 520) / 45) ** 2)) * (1 - age / 1.8)
          }

          const a = Math.min(1, 0.16 + e * 0.5 + k * 0.85 + rip * 0.9)
          const m = Math.min(1, k * 1.1 + rip)
          const rad = 1.1 + e * 0.9 + k * 2.6 + rip * 2.2
          ctx.fillStyle = `rgba(${CREAM[0] + (ORANGE[0] - CREAM[0]) * m | 0},${CREAM[1] + (ORANGE[1] - CREAM[1]) * m | 0},${CREAM[2] + (ORANGE[2] - CREAM[2]) * m | 0},${a.toFixed(3)})`
          ctx.beginPath()
          ctx.arc(x, y, rad, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Vignette
      const g = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.25, cx, cy, Math.max(w, h) * 0.75)
      g.addColorStop(0, 'rgba(5,5,5,0)')
      g.addColorStop(1, 'rgba(5,5,5,.85)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      if (!reduce) raf = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    if (!reduce) {
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerdown', onDown)
      document.addEventListener('pointerleave', onLeave)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="bg" aria-hidden="true" />
}
