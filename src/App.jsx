import { useState } from 'react'
import Liquid from './Liquid.jsx'
import TermWindow from './TermWindow.jsx'
import { profile, skills, projects } from './data.js'

const W = () => (typeof window === 'undefined' ? 1280 : window.innerWidth)
const H = () => (typeof window === 'undefined' ? 800 : window.innerHeight)

const wins = [
  { id: 'about', title: 'about.txt', width: 400, pos: () => [W() * 0.08, H() * 0.14] },
  { id: 'projects', title: 'projects/', width: 440, pos: () => [W() * 0.5, H() * 0.2] },
  { id: 'contact', title: 'contact.sh', width: 360, pos: () => [W() * 0.3, H() * 0.55] },
]

const content = {
  about: (
    <>
      <p><b>{profile.title}.</b></p>
      <p>{profile.bio}</p>
      <hr />
      <p className="dim">stack</p>
      <ul className="inline">{skills.map((s) => <li key={s}>{s}</li>)}</ul>
    </>
  ),
  projects: (
    <ol className="list">
      {projects.map((p, i) => (
        <li key={p.title}>
          <span className="dim">{String(i + 1).padStart(2, '0')}</span>{' '}
          <a href={p.link}><b>{p.title}</b></a>
          <p>{p.description}</p>
          <p className="dim">{p.tags.join(' · ')}</p>
        </li>
      ))}
    </ol>
  ),
  contact: (
    <>
      <p>Un projet en tête ? Parlons-en.</p>
      <ul className="links">
        <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
        <li><a href={profile.github}>github</a></li>
        <li><a href={profile.linkedin}>linkedin</a></li>
      </ul>
    </>
  ),
}

export default function App() {
  const [open, setOpen] = useState(() => ({ about: true, projects: true, contact: false }))
  const [order, setOrder] = useState(['contact', 'projects', 'about']) // dernier = au-dessus
  const [pos] = useState(() => Object.fromEntries(wins.map((w) => [w.id, w.pos()])))

  const focus = (id) => setOrder((o) => [...o.filter((x) => x !== id), id])
  const close = (id) => setOpen((s) => ({ ...s, [id]: false }))
  const toggle = (id) => {
    setOpen((s) => ({ ...s, [id]: !s[id] }))
    focus(id)
  }

  return (
    <>
      <Liquid />

      <div className="intro">
        <h1>{profile.name}</h1>
        <p>{profile.title}<span className="caret" /></p>
      </div>

      <div className="desk">
        {wins.map((w) =>
          open[w.id] ? (
            <TermWindow
              key={w.id}
              id={w.id}
              title={w.title}
              x={pos[w.id][0]}
              y={pos[w.id][1]}
              width={w.width}
              z={10 + order.indexOf(w.id)}
              onFocus={focus}
              onClose={close}
            >
              {content[w.id]}
            </TermWindow>
          ) : null
        )}
      </div>

      <nav className="dock" aria-label="Fenêtres">
        {wins.map((w) => (
          <button key={w.id} className={open[w.id] ? 'on' : ''} onClick={() => toggle(w.id)}>
            {w.title}
          </button>
        ))}
      </nav>
    </>
  )
}
