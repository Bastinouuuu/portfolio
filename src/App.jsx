import { profile, skills, projects } from './data.js'

export default function App() {
  return (
    <>
      <header className="nav">
        <strong>{profile.name}</strong>
        <nav>
          <a href="#about">À propos</a>
          <a href="#projects">Projets</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">Bonjour, je suis</p>
          <h1>{profile.name}</h1>
          <h2>{profile.title}</h2>
          <p className="lead">{profile.bio}</p>
          <a className="btn" href="#projects">Voir mes projets</a>
        </section>

        <section id="about">
          <h3>Compétences</h3>
          <ul className="chips">
            {skills.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>

        <section id="projects">
          <h3>Projets</h3>
          <div className="grid">
            {projects.map((p) => (
              <article className="card" key={p.title}>
                <h4>{p.title}</h4>
                <p>{p.description}</p>
                <ul className="chips small">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                <a href={p.link}>Voir le projet →</a>
              </article>
            ))}
          </div>
        </section>

        <section id="contact">
          <h3>Contact</h3>
          <p>
            <a href={`mailto:${profile.email}`}>{profile.email}</a> ·{' '}
            <a href={profile.github}>GitHub</a> · <a href={profile.linkedin}>LinkedIn</a>
          </p>
        </section>
      </main>

      <footer>© {new Date().getFullYear()} {profile.name}</footer>
    </>
  )
}
