import { Link } from 'react-router-dom'
import { Col, Container, Row } from 'react-bootstrap'

const featureHighlights = [
  {
    title: 'Discover fresh talent',
    text: 'Browse profiles from actors, dancers, writers, technicians, and creators across the industry.',
    icon: '✦',
  },
  {
    title: 'Find meaningful work',
    text: 'Explore opportunities, auditions, and collaborations with teams building memorable stories.',
    icon: '▣',
  },
  {
    title: 'Build a trusted network',
    text: 'Connect with collaborators, producers, and communities that help your work grow.',
    icon: '◎',
  },
]

const platformStats = [
  { value: '2.4k+', label: 'creative profiles' },
  { value: '430', label: 'casting calls' },
  { value: '96%', label: 'member satisfaction' },
]

function HomePage() {
  return (
    <main className="app-shell homepage-shell">
      <Container fluid="lg">
        <header className="topbar">
          <Link className="brand" to="/" aria-label="CeniBandham home">
            <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
            <span>CeniBandham</span>
          </Link>
          <p className="topbar-note mb-0">A community for the stories we tell</p>
          <Link className="signin-link" to="/login">
            <span>Already a member? <strong>Sign in</strong></span>
            <span className="signin-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.25" />
                <path d="M5.5 19c.75-3.1 3.05-4.75 6.5-4.75s5.75 1.65 6.5 4.75" />
              </svg>
            </span>
          </Link>
        </header>

        <section className="hero-section">
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <p className="eyebrow homepage-eyebrow">STORIES THAT MOVE PEOPLE</p>
              <h1 className="homepage-title">Find your next <span>cast, crew, and community</span></h1>
              <p className="homepage-subtitle">
                CeniBandham brings together performers, directors, writers, and production teams to discover opportunities, build careers, and tell powerful stories together.
              </p>

              <div className="homepage-actions">
                <Link className="btn primary-button homepage-primary" to="/register">Join now</Link>
                <Link className="btn homepage-secondary" to="/login">Sign in</Link>
              </div>

              <div className="homepage-stats">
                {platformStats.map((stat) => (
                  <div className="stat-item" key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </Col>

            <Col lg={6}>
              <div className="hero-visual" aria-label="Creative community preview">
                <div className="visual-panel feature-card feature-card-large">
                  <div className="feature-header">
                    <span className="feature-pill">Open casting</span>
                    <span className="feature-time">Today</span>
                  </div>
                  <h2>Featured role</h2>
                  <p>Lead performer / Music video production</p>
                  <div className="mini-tags">
                    <span>On-set</span>
                    <span>Hybrid</span>
                    <span>Hyderabad</span>
                  </div>
                </div>

                <div className="visual-panel profile-card">
                  <div className="profile-badge">A</div>
                  <div>
                    <strong>Aarav R.</strong>
                    <span>Actor • Theatre & film</span>
                  </div>
                </div>

                <div className="visual-panel audience-card">
                  <div className="audience-ring" aria-hidden="true" />
                  <div>
                    <strong>4.8/5</strong>
                    <span>community rating</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </section>

        <section className="homepage-features">
          <div className="section-heading">
            <p className="eyebrow">WHY CENIBANDHAM</p>
            <h2>Built for every creative chapter.</h2>
          </div>

          <Row className="g-4">
            {featureHighlights.map((feature) => (
              <Col md={4} key={feature.title}>
                <div className="feature-tile">
                  <span className="feature-icon" aria-hidden="true">{feature.icon}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </section>

        <section className="homepage-showcase">
          <div className="showcase-copy">
            <p className="eyebrow">CREATIVE OPPORTUNITIES</p>
            <h2>From first auditions to full productions, we help your story find its audience.</h2>
          </div>

          <Row className="g-4">
            <Col md={6}>
              <div className="showcase-item showcase-item-dark">
                <span className="showcase-kicker">For talent</span>
                <h3>Showcase your work, get discovered, and stay visible.</h3>
                <ul>
                  <li>Build a polished profile</li>
                  <li>Track casting calls and auditions</li>
                  <li>Connect with collaborators</li>
                </ul>
              </div>
            </Col>
            <Col md={6}>
              <div className="showcase-item showcase-item-light">
                <span className="showcase-kicker">For teams</span>
                <h3>Find trusted people who can help bring an idea to life.</h3>
                <ul>
                  <li>Shortlist qualified professionals</li>
                  <li>Post production opportunities</li>
                  <li>Collaborate in one place</li>
                </ul>
              </div>
            </Col>
          </Row>
        </section>

        <section className="homepage-cta">
          <div>
            <p className="eyebrow">READY TO BEGIN?</p>
            <h2>Tell your story with the right people behind you.</h2>
          </div>
          <Link className="btn primary-button homepage-primary" to="/register">Create account</Link>
        </section>
      </Container>
    </main>
  )
}

export default HomePage
