import { profile, skills, experience, education, projects } from './data.js'

export default function App() {
  const marquee = [...skills, ...skills, ...skills, ...skills]
  const contact = profile.email ? `mailto:${profile.email}` : profile.linkedin
  return (
    <>
      <header className="nav">
        <a className="brand" href="#top">{profile.name}</a>
        <nav>
          <a href="#about">À propos</a>
          <a href="#experience">Parcours</a>
          {projects.length > 0 && <a href="#projects">Réalisations</a>}
          <a href="#contact">Contact</a>
        </nav>
        <a className="btn btn-sm" href={contact}>Me contacter</a>
      </header>

      <main id="top">
        <section className="hero">
          <span className="pill"><i className="dot" />{profile.location}</span>
          <h1 className="rise">{profile.title}</h1>
          <p className="lead rise d1">{profile.bio}</p>
          <div className="actions rise d2">
            <a className="btn" href="#experience">Voir mon parcours</a>
            <a className="btn btn-ghost" href={profile.linkedin}>LinkedIn</a>
          </div>
        </section>

        <div className="marquee" aria-label="Compétences">
          <ul>{marquee.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>

        <section id="about">
          <p className="eyebrow">01 — Compétences</p>
          <h2>Les outils que j’utilise au quotidien.</h2>
          <ul className="chips">
            {skills.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>

        <section id="experience">
          <p className="eyebrow">02 — Parcours</p>
          <h2>Expérience et formation.</h2>
          <div className="cols">
            <div>
              <h3 className="sub">Expérience</h3>
              <ol className="timeline">
                {experience.map((e) => (
                  <li key={e.role + e.period}>
                    <span className="when">{e.period}</span>
                    <strong>{e.role}</strong>
                    <span>{e.company} · {e.type} · {e.place}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="sub">Formation</h3>
              <ol className="timeline">
                {education.map((e) => (
                  <li key={e.degree + e.period}>
                    <span className="when">{e.period}</span>
                    <strong>{e.degree}</strong>
                    <span>{e.school}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {projects.length > 0 && (
        <section id="projects">
          <p className="eyebrow">03 — Réalisations</p>
          <h2>Quelques projets récents.</h2>
          <div className="grid">
            {projects.map((p, i) => (
              <article className="card" key={p.title}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <ul className="chips small">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                <a className="more" href={p.link}>Voir le projet →</a>
              </article>
            ))}
          </div>
        </section>
        )}

        <section id="contact" className="cta">
          <p className="eyebrow">04 — Contact</p>
          <h2>Un projet en tête ? Parlons-en.</h2>
          <a className="btn" href={contact}>{profile.email || 'Me contacter sur LinkedIn'}</a>
          <p className="links"><a href={profile.github}>GitHub</a> · <a href={profile.linkedin}>LinkedIn</a></p>
        </section>
      </main>

      <footer>© {new Date().getFullYear()} {profile.name}</footer>
    </>
  )
}
