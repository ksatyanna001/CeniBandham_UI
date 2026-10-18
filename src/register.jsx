import { useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  ProgressBar,
  Row,
} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { registrationApi } from './clientapi.js'

const roles = [
  { name: 'Actor', detail: 'Film, television & theatre', icon: '✳' },
  { name: 'Performer', detail: 'Dance, voice & more', icon: '◇' },
  { name: 'Director', detail: 'Bring stories to life', icon: '◉' },
  { name: 'Writer', detail: 'Create the next story', icon: '✎' },
  { name: 'Producer', detail: 'Make it happen', icon: '▧' },
  { name: 'Technician', detail: 'Power every production', icon: '⌘' },
]

const profileRoles = ['Actor', 'Actress', 'Voice artist', 'Dancer', 'Other performer']
const experienceOptions = ['Beginner', 'Theatre', 'Short films', 'Television', 'Films', 'Web series']
const isTalentRole = (role) => role === 'Actor' || role === 'Performer'

function Register() {
  const [step, setStep] = useState(1)
  const [account, setAccount] = useState({
    fullName: '',
    screenName: '',
    mobile: '',
    email: '',
    password: '',
    acceptedTerms: false,
    adult: false,
  })
  const [role, setRole] = useState('')
  const [profile, setProfile] = useState({
    primaryRole: '',
    ageRange: '',
    city: '',
    state: '',
    languages: '',
    bio: '',
    photo: null,
    portfolio: [],
    experience: '',
    skills: '',
    height: '',
    pastProjects: '',
    portfolioLink: '',
    availability: '',
    contactPreference: 'platform',
  })
  const [otp, setOtp] = useState('')
  const [otpState, setOtpState] = useState('idle')
  const [challengeId, setChallengeId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [profileId, setProfileId] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [safetyAction, setSafetyAction] = useState('Report a casting call')
  const [safetyMessage, setSafetyMessage] = useState('')
  const [safetyError, setSafetyError] = useState('')

  const talentFlow = isTalentRole(role)
  const finalStep = talentFlow ? 4 : 3
  const stepLabels = talentFlow
    ? ['Your account', 'Your role', 'Your profile', 'Preview']
    : ['Your account', 'Your role', 'Preview']
  const profileComplete = Boolean(
    profile.primaryRole &&
      profile.city.trim() &&
      profile.state.trim() &&
      profile.languages.trim() &&
      profile.bio.trim() &&
      profile.photo &&
      profile.portfolio.length > 0,
  )

  useEffect(() => {
    if (!profile.photo) {
      setPhotoPreview('')
      return undefined
    }
    const previewUrl = URL.createObjectURL(profile.photo)
    setPhotoPreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [profile.photo])

  function updateAccount(event) {
    const { name, value, checked, type } = event.target
    setAccount((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'mobile') {
      setOtpState('idle')
      setOtp('')
      setChallengeId('')
    }
  }

  function updateProfile(event) {
    const { name, value, files } = event.target
    setProfile((current) => ({
      ...current,
      [name]: files ? (name === 'portfolio' ? Array.from(files) : files[0]) : value,
    }))
  }

  async function sendDemoCode() {
    setIsBusy(true)
    setNotice('')
    try {
      const result = await registrationApi.requestOtp(account.mobile)
      setChallengeId(result.challengeId)
      setOtpState('sent')
      setNotice(`Mock API: use ${result.demoCode} to verify. No SMS was sent.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  async function verifyDemoCode() {
    setIsBusy(true)
    setNotice('')
    try {
      await registrationApi.verifyOtp(challengeId, otp)
      setOtpState('verified')
      setNotice('Mock API verified your mobile number. No SMS provider is connected.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  async function advanceAccount(event) {
    event.preventDefault()
    if (otpState !== 'verified') {
      setNotice('Verify your mobile number with the mock API to continue.')
      return
    }
    setIsBusy(true)
    setNotice('')
    try {
      const result = await registrationApi.createAccount(account, challengeId)
      setAccountId(result.accountId)
      setStep(2)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  async function advanceRole(event) {
    event.preventDefault()
    if (!role) {
      setNotice('Choose a professional role to continue.')
      return
    }
    setIsBusy(true)
    setNotice('')
    try {
      await registrationApi.saveProfessionalRole(accountId, role)
      setStep(3)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  async function saveProfile(event) {
    event.preventDefault()
    if (!profileComplete) {
      setNotice('Add every required profile detail before publishing, or save and finish later.')
      return
    }
    setIsBusy(true)
    setNotice('')
    try {
      const result = await registrationApi.saveActorProfile(accountId, profile)
      setProfileId(result.profileId)
      setStep(4)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  async function skipProfile() {
    setIsBusy(true)
    setNotice('')
    try {
      await registrationApi.saveProfessionalRole(accountId, role)
      setNotice('Profile skipped. The mock API saved your account and role only.')
      setStep(4)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  function goBack() {
    setNotice('')
    setStep((current) => current - 1)
  }

  async function saveForLater() {
    setIsBusy(true)
    setNotice('')
    try {
      await registrationApi.saveProfessionalRole(accountId, role)
      setNotice('The mock API saved your account and role. No data was sent to a server.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  async function publishProfile() {
    setIsBusy(true)
    setNotice('')
    try {
      await registrationApi.publishActorProfile(accountId, profileId, account, role, profile)
      setNotice('Your profile was published successfully.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  function openSafety() {
    setSafetyMessage('')
    setSafetyError('')
    setSafetyOpen(true)
  }

  return (
    <main className="app-shell">
      <Container fluid="lg">
        <header className="topbar">
          <a className="brand" href="#home" aria-label="CeniBandham home">
            <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
            <span>CeniBandham</span>
          </a>
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

        <Card className="registration-layout my-4 my-lg-5">
          <Row className="g-0 h-100">
            <Col lg={4} className="story-panel">
              <div className="story-kicker"><span className="story-kicker-line" />YOUR NEXT CHAPTER</div>
              <h1>The industry<br />is looking for<br /><span>you.</span></h1>
              <p className="story-copy">Create your account in minutes. Build your professional profile when you&apos;re ready.</p>
              <div className="story-quote">
                <span className="quote-mark" aria-hidden="true">“</span>
                <p>Every great story starts with someone saying yes.</p>
              </div>
              <div className="story-decoration" aria-hidden="true">
                <span className="decoration-ring ring-one" />
                <span className="decoration-ring ring-two" />
                <span className="decoration-star">✳</span>
              </div>
            </Col>
            <Col lg={8} className="form-panel">
              <div className="form-heading">
                <div>
                  <p className="eyebrow">JOIN THE COMMUNITY</p>
                  <h2>{step === 1 ? 'Create your account' : step === 2 ? 'What do you do?' : step === 3 && talentFlow ? 'Build your actor profile' : 'Take a look around'}</h2>
                  <p className="form-subtitle">
                    {step === 1
                      ? 'Start with the essentials. Your profile can come later.'
                      : step === 2
                        ? 'Choose the role that best describes your work.'
                        : step === 3 && talentFlow
                          ? 'A few details help casting teams find you. You can finish this later.'
                          : 'Review what you’ve added and choose what happens next.'}
                  </p>
                </div>
                <span className="step-count">0{step}<span> / 0{finalStep}</span></span>
              </div>

              <nav aria-label="Registration progress" className="stepper">
                {stepLabels.map((label, index) => {
                  const number = index + 1
                  return (
                    <div aria-current={number === step ? 'step' : undefined} className={`step-item ${number === step ? 'active' : ''} ${number < step ? 'complete' : ''}`} key={label}>
                      <span className="step-number">{number < step ? '✓' : number}</span>
                      <span className="step-label">{label}</span>
                    </div>
                  )
                })}
              </nav>
              <ProgressBar aria-label={`Registration progress: step ${step} of ${finalStep}`} className="registration-progress" now={(step / finalStep) * 100} visuallyHidden />
              {notice && <Alert className="notice" role="status" variant={otpState === 'verified' ? 'success' : 'warning'}>{notice}</Alert>}

              {step === 1 && (
                <Form className="form-content" onSubmit={advanceAccount}>
                  <Row className="g-3">
                    <Col sm={6}><Form.Group controlId="full-name"><Form.Label>Full name <em>*</em></Form.Label><Form.Control autoComplete="name" name="fullName" onChange={updateAccount} placeholder="Your full name" required value={account.fullName} /></Form.Group></Col>
                    <Col sm={6}><Form.Group controlId="screen-name"><Form.Label>Professional name <small>OPTIONAL</small></Form.Label><Form.Control name="screenName" onChange={updateAccount} placeholder="Your screen name" value={account.screenName} /></Form.Group></Col>
                  </Row>
                  <Form.Group controlId="mobile">
                    <Form.Label>Mobile number <em>*</em></Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="country-code">🇮🇳 +91</InputGroup.Text>
                      <Form.Control autoComplete="tel-national" inputMode="numeric" maxLength="10" minLength="10" name="mobile" onChange={updateAccount} pattern="[0-9]{10}" placeholder="10-digit mobile number" required type="tel" value={account.mobile} />
                      <Button className="send-code-button" disabled={isBusy} onClick={sendDemoCode} type="button" variant="outline-secondary">{isBusy ? 'Please wait…' : otpState === 'sent' || otpState === 'verified' ? 'Resend code' : 'Send code'}</Button>
                    </InputGroup>
                    <Form.Text>Mobile is private by default. OTP is simulated in this demo.</Form.Text>
                  </Form.Group>
                  {otpState === 'sent' && (
                    <Form.Group className="otp-field" controlId="otp-code">
                      <Form.Label>Enter verification code</Form.Label>
                      <InputGroup>
                        <Form.Control autoComplete="one-time-code" inputMode="numeric" maxLength="6" onChange={(event) => setOtp(event.target.value)} placeholder="6-digit code" value={otp} />
                        <Button disabled={isBusy} onClick={verifyDemoCode} type="button" variant="outline-secondary">Verify number</Button>
                      </InputGroup>
                      <Form.Text>Mock API code: 123456. No SMS is sent.</Form.Text>
                    </Form.Group>
                  )}
                  <Form.Group controlId="email"><Form.Label>Email address <small>RECOMMENDED</small></Form.Label><Form.Control autoComplete="email" name="email" onChange={updateAccount} placeholder="you@example.com" type="email" value={account.email} /></Form.Group>
                  <Form.Group controlId="password"><Form.Label>Create password <em>*</em></Form.Label><Form.Control autoComplete="new-password" minLength="8" name="password" onChange={updateAccount} placeholder="At least 8 characters" required type="password" value={account.password} /><Form.Text>Use at least 8 characters. Passwordless sign-in can be added later.</Form.Text></Form.Group>
                  <div className="consent-list">
                    <Form.Check checked={account.acceptedTerms} id="accept-terms" label={<>I agree to the <a href="#terms" onClick={(event) => event.preventDefault()}>Terms of Service</a> and <a href="#privacy" onClick={(event) => event.preventDefault()}>Privacy Policy</a>. <em>*</em></>} name="acceptedTerms" onChange={updateAccount} required />
                    <Form.Check checked={account.adult} id="adult-confirmation" label={<>I confirm I am 18 or older. <em>*</em></>} name="adult" onChange={updateAccount} required />
                  </div>
                  <div className="form-actions">
                    <span className="required-note"><em>*</em> Required fields</span>
                    <Button className="primary-button" disabled={isBusy} type="submit">Continue <span aria-hidden="true">→</span></Button>
                  </div>
                  <p className="privacy-note"><span aria-hidden="true">⌑</span> Your personal details stay private. We never display your phone number publicly.</p>
                </Form>
              )}

              {step === 2 && (
                <Form className="form-content" onSubmit={advanceRole}>
                  <fieldset className="role-grid">
                    <legend className="visually-hidden">Choose your professional role</legend>
                    {roles.map((item) => (
                      <Button aria-pressed={role === item.name} className={`role-card ${role === item.name ? 'selected' : ''}`} key={item.name} onClick={() => { setRole(item.name); setNotice('') }} type="button" variant="light">
                        <span className="role-icon" aria-hidden="true">{item.icon}</span><span className="role-name">{item.name}</span><span className="role-detail">{item.detail}</span><span className="role-check" aria-hidden="true">{role === item.name ? '✓' : ''}</span>
                      </Button>
                    ))}
                  </fieldset>
                  <p className="role-note"><span aria-hidden="true">✦</span> You can add more roles to your profile later.</p>
                  <div className="form-actions">
                    <Button className="back-button" onClick={goBack} type="button" variant="link">← Back</Button>
                    <Button className="primary-button" disabled={isBusy} type="submit">Continue <span aria-hidden="true">→</span></Button>
                  </div>
                </Form>
              )}

              {step === 3 && talentFlow && (
                <Form className="form-content profile-form" onSubmit={saveProfile}>
                  <Alert className="profile-optional-banner" variant="light"><span aria-hidden="true">✦</span> <strong>No rush.</strong> Your account can be ready before your profile. Add details now or finish later.</Alert>
                  <Row className="g-3">
                    <Col sm={6}><Form.Group controlId="primary-role"><Form.Label>Primary role <em>*</em></Form.Label><Form.Select name="primaryRole" onChange={updateProfile} value={profile.primaryRole}><option value="">Choose a role</option>{profileRoles.map((item) => <option key={item}>{item}</option>)}</Form.Select></Form.Group></Col>
                    <Col sm={6}><Form.Group controlId="age-range"><Form.Label>Age range <small>OPTIONAL</small></Form.Label><Form.Select name="ageRange" onChange={updateProfile} value={profile.ageRange}><option value="">Prefer not to say</option><option>18–24</option><option>25–34</option><option>35–44</option><option>45+</option></Form.Select></Form.Group></Col>
                    <Col sm={6}><Form.Group controlId="city"><Form.Label>Current city <em>*</em></Form.Label><Form.Control name="city" onChange={updateProfile} placeholder="e.g. Hyderabad" value={profile.city} /></Form.Group></Col>
                    <Col sm={6}><Form.Group controlId="state"><Form.Label>State <em>*</em></Form.Label><Form.Control name="state" onChange={updateProfile} placeholder="e.g. Telangana" value={profile.state} /></Form.Group></Col>
                    <Col xs={12}><Form.Group controlId="languages"><Form.Label>Languages known <em>*</em></Form.Label><Form.Control name="languages" onChange={updateProfile} placeholder="Telugu, Hindi, English" value={profile.languages} /></Form.Group></Col>
                    <Col xs={12}><Form.Group controlId="bio"><Form.Label>Professional bio <em>*</em></Form.Label><Form.Control as="textarea" maxLength="500" name="bio" onChange={updateProfile} placeholder="Tell casting teams a little about your craft and what makes you unique…" rows={3} value={profile.bio} /><Form.Text>{profile.bio.length}/500 characters</Form.Text></Form.Group></Col>
                    <Col sm={6}><Form.Group className="file-field" controlId="profile-photo"><Form.Label>Profile photo <em>*</em></Form.Label><Form.Control accept="image/*" name="photo" onChange={updateProfile} type="file" /><Form.Text>{profile.photo ? profile.photo.name : 'Add a clear headshot'}</Form.Text></Form.Group></Col>
                    <Col sm={6}><Form.Group className="file-field" controlId="portfolio-item"><Form.Label>Portfolio photo or video <em>*</em></Form.Label><Form.Control accept="image/*,video/*" multiple name="portfolio" onChange={updateProfile} type="file" /><Form.Text>{profile.portfolio.length ? profile.portfolio.map((file) => file.name).join(', ') : 'Select one or more images or videos'}</Form.Text></Form.Group></Col>
                  </Row>
                  <section className="optional-details" aria-labelledby="additional-profile-heading">
                    <div className="optional-details-heading">
                      <h3 id="additional-profile-heading">Additional profile details</h3>
                      <span>OPTIONAL</span>
                    </div>
                    <Row className="g-3 optional-fields">
                      <Col sm={6}><Form.Group controlId="experience"><Form.Label>Experience</Form.Label><Form.Select name="experience" onChange={updateProfile} value={profile.experience}><option value="">Choose experience</option>{experienceOptions.map((item) => <option key={item}>{item}</option>)}</Form.Select></Form.Group></Col>
                      <Col sm={6}><Form.Group controlId="skills"><Form.Label>Skills</Form.Label><Form.Control name="skills" onChange={updateProfile} placeholder="Dance, singing, martial arts…" value={profile.skills} /></Form.Group></Col>
                      <Col sm={6}><Form.Group controlId="height"><Form.Label>Height</Form.Label><Form.Control name="height" onChange={updateProfile} placeholder="Optional casting detail" value={profile.height} /></Form.Group></Col>
                      <Col sm={6}><Form.Group controlId="past-projects"><Form.Label>Past projects</Form.Label><Form.Control name="pastProjects" onChange={updateProfile} placeholder="Project, role, year" value={profile.pastProjects} /></Form.Group></Col>
                      <Col sm={6}><Form.Group controlId="portfolio-link"><Form.Label>Portfolio or social link</Form.Label><Form.Control name="portfolioLink" onChange={updateProfile} placeholder="https://" type="url" value={profile.portfolioLink} /></Form.Group></Col>
                      <Col sm={6}><Form.Group controlId="availability"><Form.Label>Availability</Form.Label><Form.Select name="availability" onChange={updateProfile} value={profile.availability}><option value="">Choose availability</option><option>Open to auditions</option><option>Open to projects</option><option>Open to relocation</option></Form.Select></Form.Group></Col>
                      <Col xs={12}><Form.Group controlId="contact-preference"><Form.Label>Who can contact you?</Form.Label><Form.Select name="contactPreference" onChange={updateProfile} value={profile.contactPreference}><option value="platform">Platform messages only</option><option value="verified">Verified casting professionals</option><option value="everyone">Anyone on CeniBandham</option></Form.Select></Form.Group></Col>
                    </Row>
                  </section>
                  <p className="profile-privacy"><span aria-hidden="true">♧</span> Your phone number stays private. No government ID is needed to join.</p>
                  <div className="form-actions">
                    <Button className="back-button" onClick={goBack} type="button" variant="link">← Back</Button>
                    <Button className="save-later-button" disabled={isBusy} onClick={skipProfile} type="button" variant="link">Finish later</Button>
                    <Button className="primary-button" disabled={isBusy} type="submit">Preview profile <span aria-hidden="true">→</span></Button>
                  </div>
                  <p className="publish-hint">{profileComplete ? 'Your required profile details are ready to preview.' : 'To publish: complete every field marked * and add a photo or video.'}</p>
                </Form>
              )}

              {((step === 3 && !talentFlow) || (step === 4 && talentFlow)) && (
                <div className="form-content preview-content">
                  <Card className="preview-card">
                    {talentFlow && photoPreview ? <Card.Img alt="Profile preview" className="avatar-preview" src={photoPreview} /> : <span className="avatar-placeholder" aria-hidden="true">{(account.screenName || account.fullName || 'C').charAt(0).toUpperCase()}</span>}
                    <div className="preview-identity"><p className="eyebrow">YOUR PROFILE PREVIEW</p><h3>{account.screenName || account.fullName || 'Your name'}</h3><p>{talentFlow ? profile.primaryRole || role : role}</p></div>
                  </Card>
                  <Row className="preview-details">
                    <Col xs={6}><span>LOCATION</span><strong>{profile.city && profile.state ? `${profile.city}, ${profile.state}` : 'Add location later'}</strong></Col>
                    <Col xs={6}><span>LANGUAGES</span><strong>{profile.languages || 'Add languages later'}</strong></Col>
                    <Col xs={12}><span>CONTACT</span><strong>Phone number private</strong></Col>
                  </Row>
                  {talentFlow && profile.bio && <p className="preview-bio">{profile.bio}</p>}
                  {talentFlow && !profileComplete && <Alert className="incomplete-note" variant="warning">Your profile isn’t published yet. Add the required details whenever you’re ready.</Alert>}
                  <div className="profile-status">
                    <span className="status-icon">✓</span>
                    <span><strong>Registration details ready</strong><small>Mobile verified (mock) · Adults only</small></span>
                    <Badge className="status-badge">REGISTERED</Badge>
                    {profileId && <Badge className="status-badge profile-complete-badge">PROFILE COMPLETE</Badge>}
                  </div>
                  <div className="form-actions preview-actions">
                    <Button className="back-button" onClick={goBack} type="button" variant="link">← Back</Button>
                    {talentFlow && !profileComplete && <Button className="save-later-button" onClick={saveForLater} type="button" variant="link">Finish later</Button>}
                    {talentFlow && profileComplete
                      ? <Button className="primary-button" onClick={publishProfile} type="button">Publish profile <span aria-hidden="true">→</span></Button>
                      : !talentFlow
                        ? <Button className="primary-button" onClick={saveForLater} type="button">Finish registration <span aria-hidden="true">→</span></Button>
                        : <Button className="subtle-button" onClick={() => setStep(3)} type="button" variant="outline-secondary">Complete profile</Button>}
                  </div>
                  <p className="publish-hint">{profileComplete && talentFlow ? 'Your profile details are ready. Publishing will make them searchable.' : 'Your account is registered; your professional profile stays private until you publish it.'}</p>
                </div>
              )}
            </Col>
          </Row>
        </Card>

        <footer className="page-footer">
          <span>© 2025 CeniBandham</span>
          <span className="d-none d-md-inline">Made for the people behind the stories</span>
          <span className="footer-links">
            <Button onClick={openSafety} type="button" variant="link">Safety &amp; reporting</Button>
            <a href="#privacy" onClick={(event) => event.preventDefault()}>Privacy</a>
            <a href="#terms" onClick={(event) => event.preventDefault()}>Terms</a>
          </span>
        </footer>
      </Container>

      <Modal aria-labelledby="safety-title" centered onHide={() => setSafetyOpen(false)} show={safetyOpen}>
        <Modal.Header closeButton>
          <div><p className="eyebrow mb-2">COMMUNITY SAFETY</p><Modal.Title id="safety-title">Help keep this community safe</Modal.Title></div>
        </Modal.Header>
        <Modal.Body>
          <p className="safety-copy">Report suspicious casting calls or profiles, or block someone from contacting you. Reports are private.</p>
          {safetyError && <Alert role="alert" variant="danger">{safetyError}</Alert>}
          {safetyMessage ? (
            <Alert className="safety-confirmation" role="status" variant="success">
              {safetyMessage}
              <div className="mt-3"><Button onClick={() => setSafetyOpen(false)} type="button" variant="outline-success">Done</Button></div>
            </Alert>
          ) : (
            <Form className="safety-form" onSubmit={async (event) => {
              event.preventDefault()
              const details = event.currentTarget.elements.namedItem('safetyDetails').value
              try {
                await registrationApi.submitSafetyReport(safetyAction, details)
                setSafetyError('')
                setSafetyMessage(`The mock API received your request to ${safetyAction.toLowerCase()}. No server was contacted.`)
              } catch (error) {
                setSafetyError(error.message)
              }
            }}>
              <Form.Group controlId="safety-action">
                <Form.Label>What would you like to do?</Form.Label>
                <Form.Select onChange={(event) => setSafetyAction(event.target.value)} value={safetyAction}>
                  <option>Report a casting call</option><option>Report a profile</option><option>Block a member</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="safety-details">
                <Form.Label>{safetyAction === 'Block a member' ? 'Member name or profile link' : 'What happened?'}</Form.Label>
                <Form.Control as="textarea" name="safetyDetails" placeholder={safetyAction === 'Block a member' ? 'Enter the profile to block' : 'Share details so the safety team can review'} required rows={3} />
              </Form.Group>
              <div className="text-end"><Button className="primary-button" type="submit">{safetyAction === 'Block a member' ? 'Block member' : 'Send report'} <span aria-hidden="true">→</span></Button></div>
            </Form>
          )}
          <p className="safety-footnote">Never send money for an audition. CeniBandham will never ask for government ID to create an account.</p>
        </Modal.Body>
      </Modal>
    </main>
  )
}

export default Register
