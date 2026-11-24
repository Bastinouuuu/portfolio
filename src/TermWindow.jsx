import { useRef } from 'react'

// Fenêtre « terminal » : déplaçable par la barre de titre, fermable, passe au premier plan au clic.
export default function TermWindow({ id, title, x, y, width = 380, z, onFocus, onClose, children }) {
  const ref = useRef(null)
  const drag = useRef(null)

  const down = (e) => {
    if (e.target.closest('button')) return
    onFocus(id)
    const el = ref.current
    drag.current = { dx: e.clientX - el.offsetLeft, dy: e.clientY - el.offsetTop }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e) => {
    if (!drag.current) return
    const el = ref.current
    const nx = Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - 80)
    const ny = Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - 40)
    el.style.left = nx + 'px'
    el.style.top = ny + 'px'
  }
  const up = () => { drag.current = null }

  return (
    <section
      ref={ref}
      className="win"
      style={{ left: x, top: y, width, zIndex: z }}
      onPointerDown={() => onFocus(id)}
      aria-label={title}
    >
      <header className="win-bar" onPointerDown={down} onPointerMove={move} onPointerUp={up}>
        <span>{title}</span>
        <button onClick={() => onClose(id)} aria-label={`Fermer ${title}`}>x</button>
      </header>
      <div className="win-body">{children}</div>
    </section>
  )
}
