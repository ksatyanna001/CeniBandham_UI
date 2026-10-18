import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Container, Form } from 'react-bootstrap'
import { loginApi } from './clientapi.js'

function Login() {
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    setError('')
    setIsSubmitting(true)
    try {
      await loginApi.signIn({ username, password, rememberMe })
      setNotice('You are signed in.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePasswordReset() {
    setNotice('')
    setError('')
    try {
      const result = await loginApi.requestPasswordReset(username)
      setNotice(result?.message || 'If an account matches, password reset instructions will be sent.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="app-shell login-page">
      <Container fluid="lg">
        <header className="topbar">
          <Link className="brand" to="/" aria-label="CeniBandham home">
            <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
            <span>CeniBandham</span>
          </Link>
          <p className="topbar-note mb-0">A community for the stories we tell</p>
          <Link className="signin-link login-signup-link" to="/register">
            <span>New here? <strong>Create account</strong></span>
          </Link>
        </header>

        <section className="login-content" aria-labelledby="login-heading">
          <Card className="login-card">
            <div className="login-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.25" />
                <path d="M5.5 19c.75-3.1 3.05-4.75 6.5-4.75s5.75 1.65 6.5 4.75" />
              </svg>
            </div>
            <p className="eyebrow">WELCOME BACK</p>
            <h1 id="login-heading">Sign in to your account</h1>
            <p className="login-subtitle">Pick up where your next story begins.</p>

            {notice && <Alert className="notice" role="status" variant="info">{notice}</Alert>}
            {error && <Alert className="notice" role="alert" variant="danger">{error}</Alert>}

            <Form className="login-form" onSubmit={handleSubmit}>
              <Form.Group controlId="login-username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  autoComplete="username"
                  name="username"
                  placeholder="Enter your username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="login-password">
                <div className="login-password-label">
                  <Form.Label>Password</Form.Label>
                  <button className="forgot-password" onClick={handlePasswordReset} type="button">
                    Forgot password?
                  </button>
                </div>
                <Form.Control
                  autoComplete="current-password"
                  minLength="8"
                  name="password"
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Form.Group>
              <Form.Check
                id="remember-me"
                label="Keep me signed in"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <Button className="primary-button login-submit" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span>
              </Button>
            </Form>

            <p className="login-register-prompt">
              Don&apos;t have an account? <Link to="/register">Join CeniBandham</Link>
            </p>
            <p className="login-privacy">Your account is private and secure.</p>
          </Card>
        </section>
      </Container>
    </main>
  )
}

export default Login
