import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Register from './register.jsx'

afterEach(cleanup)
afterEach(() => vi.unstubAllGlobals())

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  )
}

describe('Register', () => {
  it('starts at account creation with an adult-only registration notice', () => {
    renderRegister()

    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Already a member\? Sign in/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Already a member\? Sign in/ }).querySelector('.signin-avatar')).toBeInTheDocument()
    expect(screen.getByText('I confirm I am 18 or older.')).toBeInTheDocument()
    expect(screen.getByText(/never display your phone number publicly/i)).toBeInTheDocument()
  })

  it('requires mock OTP verification and lets an actor defer their profile', async () => {
    renderRegister()

    fireEvent.change(screen.getByPlaceholderText('Your full name'), {
      target: { value: 'Ananya Rao' },
    })
    fireEvent.change(screen.getByPlaceholderText('10-digit mobile number'), {
      target: { value: '9876543210' },
    })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'securepass123' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: /Terms of Service/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /18 or older/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('status')).toHaveTextContent('Verify your mobile number')

    fireEvent.click(screen.getByRole('button', { name: 'Send code' }))
    fireEvent.change(await screen.findByPlaceholderText('6-digit code'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verify number' }))
    await screen.findByText(/Mock API verified your mobile number/)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByRole('heading', { name: 'What do you do?' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /ActorFilm/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByRole('heading', { name: 'Build your actor profile' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Finish later' }))
    expect(await screen.findByRole('status')).toHaveTextContent('mock API saved your account and role')
    expect(await screen.findByRole('heading', { name: 'Take a look around' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }))
    expect(screen.getByRole('heading', { name: 'Build your actor profile' })).toBeInTheDocument()
  })

  it('requires all minimum talent profile fields to publish', async () => {
    renderRegister()
    await completeAccountAndSelectActor()

    fireEvent.click(screen.getByRole('button', { name: 'Preview profile' }))
    expect(screen.getByRole('status')).toHaveTextContent('Add every required profile detail')
    expect(screen.getByRole('heading', { name: 'Build your actor profile' })).toBeInTheDocument()
  })

  it('publishes a completed profile through the API using fetch and cookie credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ status: 'published' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    renderRegister()
    await completeAccountAndSelectActor()

    fireEvent.change(screen.getByLabelText(/Primary role/), { target: { value: 'Actor' } })
    fireEvent.change(screen.getByLabelText('Experience'), { target: { value: 'Theatre' } })
    fireEvent.change(screen.getByLabelText('Skills'), { target: { value: 'Dance, singing' } })
    fireEvent.change(screen.getByLabelText('Height'), { target: { value: '170 cm' } })
    fireEvent.change(screen.getByLabelText('Past projects'), { target: { value: 'Stage Play, Lead, 2025' } })
    fireEvent.change(screen.getByLabelText('Portfolio or social link'), { target: { value: 'https://example.com/portfolio' } })
    fireEvent.change(screen.getByLabelText('Availability'), { target: { value: 'Open to auditions' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Hyderabad'), { target: { value: 'Hyderabad' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Telangana'), { target: { value: 'Telangana' } })
    fireEvent.change(screen.getByPlaceholderText('Telugu, Hindi, English'), { target: { value: 'Telugu, Hindi' } })
    fireEvent.change(screen.getByPlaceholderText(/Tell casting teams/), { target: { value: 'Actor and theatre artist.' } })
    fireEvent.change(screen.getByLabelText(/Profile photo/), {
      target: { files: [new File(['photo'], 'headshot.jpg', { type: 'image/jpeg' })] },
    })
    fireEvent.change(screen.getByLabelText(/Portfolio photo or video/), {
      target: {
        files: [
          new File(['portrait'], 'portrait.jpg', { type: 'image/jpeg' }),
          new File(['reel'], 'showreel.mp4', { type: 'video/mp4' }),
        ],
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Preview profile' }))
    expect(await screen.findByRole('heading', { name: 'Take a look around' })).toBeInTheDocument()
    expect(screen.getByText('PROFILE COMPLETE')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Publish profile' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Your profile was published successfully.')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, request] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/profiles\/demo-profile-\d+\/publish$/)
    expect(request).toEqual(expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }))

    const requestBody = JSON.parse(request.body)
    expect(requestBody).toEqual(expect.objectContaining({
      payload: expect.objectContaining({
      accountId: expect.stringMatching(/^demo-account-\d+$/),
      profileId: expect.stringMatching(/^demo-profile-\d+$/),
      account: {
        fullName: 'Ananya Rao',
        screenName: '',
        mobile: '9876543210',
        email: '',
        acceptedTerms: true,
        adult: true,
      },
      role: 'Actor',
      profile: {
      primaryRole: 'Actor',
      ageRange: '',
      city: 'Hyderabad',
      state: 'Telangana',
      languages: 'Telugu, Hindi',
      bio: 'Actor and theatre artist.',
      experience: 'Theatre',
      skills: 'Dance, singing',
      height: '170 cm',
      pastProjects: 'Stage Play, Lead, 2025',
      portfolioLink: 'https://example.com/portfolio',
      availability: 'Open to auditions',
      contactPreference: 'platform',
      },
      media: {
        photo: {
          fileName: 'headshot.jpg',
          contentType: 'image/jpeg',
          base64Data: 'cGhvdG8=',
        },
        portfolio: [
          { fileName: 'portrait.jpg', contentType: 'image/jpeg', base64Data: 'cG9ydHJhaXQ=' },
          { fileName: 'showreel.mp4', contentType: 'video/mp4', base64Data: 'cmVlbA==' },
        ],
      },
      }),
    }))
    expect(requestBody.payload.account).not.toHaveProperty('password')
  })

  it('displays the API error when profile publishing fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Publishing service is unavailable.' }),
    }))
    renderRegister()
    await completeAccountAndSelectActor()

    fillMinimumProfile()
    fireEvent.click(screen.getByRole('button', { name: 'Preview profile' }))
    await screen.findByRole('button', { name: 'Publish profile' })
    fireEvent.click(screen.getByRole('button', { name: 'Publish profile' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Publishing service is unavailable.')
  })

  it('submits safety actions through the mock API', async () => {
    renderRegister()
    fireEvent.click(screen.getByRole('button', { name: 'Safety & reporting' }))

    expect(await screen.findByRole('dialog', { name: 'Help keep this community safe' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Block a member' })).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Share details so the safety team can review'), {
      target: { value: 'Suspicious casting call asking for money.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send report' }))
    expect(await screen.findByRole('status')).toHaveTextContent('mock API received your request')
  })

  it('shows the additional actor details directly in the profile form', async () => {
    renderRegister()
    await completeAccountAndSelectActor()

    expect(screen.getByLabelText('Experience')).toBeVisible()
    expect(screen.getByLabelText('Skills')).toBeVisible()
    expect(screen.getByLabelText('Height')).toBeVisible()
    expect(screen.getByLabelText('Past projects')).toBeVisible()
    expect(screen.getByLabelText('Portfolio or social link')).toBeVisible()
    expect(screen.getByLabelText('Availability')).toBeVisible()
  })
})

async function completeAccountAndSelectActor() {
  fireEvent.change(screen.getByPlaceholderText('Your full name'), {
    target: { value: 'Ananya Rao' },
  })
  fireEvent.change(screen.getByPlaceholderText('10-digit mobile number'), {
    target: { value: '9876543210' },
  })
  fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
    target: { value: 'securepass123' },
  })
  fireEvent.click(screen.getByRole('checkbox', { name: /Terms of Service/ }))
  fireEvent.click(screen.getByRole('checkbox', { name: /18 or older/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Send code' }))
  fireEvent.change(await screen.findByPlaceholderText('6-digit code'), {
    target: { value: '123456' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Verify number' }))
  await screen.findByText(/Mock API verified your mobile number/)
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await screen.findByRole('heading', { name: 'What do you do?' })
  fireEvent.click(screen.getByRole('button', { name: /ActorFilm/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await screen.findByRole('heading', { name: 'Build your actor profile' })
}

function fillMinimumProfile() {
  fireEvent.change(screen.getByLabelText(/Primary role/), { target: { value: 'Actor' } })
  fireEvent.change(screen.getByPlaceholderText('e.g. Hyderabad'), { target: { value: 'Hyderabad' } })
  fireEvent.change(screen.getByPlaceholderText('e.g. Telangana'), { target: { value: 'Telangana' } })
  fireEvent.change(screen.getByPlaceholderText('Telugu, Hindi, English'), { target: { value: 'Telugu, Hindi' } })
  fireEvent.change(screen.getByPlaceholderText(/Tell casting teams/), { target: { value: 'Actor and theatre artist.' } })
  fireEvent.change(screen.getByLabelText(/Profile photo/), {
    target: { files: [new File(['photo'], 'headshot.jpg', { type: 'image/jpeg' })] },
  })
  fireEvent.change(screen.getByLabelText(/Portfolio photo or video/), {
    target: {
      files: [
        new File(['portrait'], 'portrait.jpg', { type: 'image/jpeg' }),
        new File(['reel'], 'showreel.mp4', { type: 'video/mp4' }),
      ],
    },
  })
}
