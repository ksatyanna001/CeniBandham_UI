import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login.jsx'

afterEach(cleanup)
afterEach(() => vi.unstubAllGlobals())

describe('Login', () => {
  it('submits sign-in credentials through the shared API client', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Welcome back.' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'actor_rao' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'securepass123' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Keep me signed in' }))
    fireEvent.click(screen.getByRole('button', { name: /Sign in/ }))

    expect(await screen.findByRole('status')).toHaveTextContent('You are signed in.')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          payload: {
            username: 'actor_rao',
            password: 'securepass123',
            rememberMe: true,
          },
        }),
      }),
    )
  })

  it('submits password recovery through the shared API client', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Check your inbox.' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'actor_rao' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Check your inbox.')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/forgot-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ payload: { username: 'actor_rao' } }),
      }),
    )
  })

  it('shows API errors when sign-in fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Invalid credentials.' }),
    }))
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'actor_rao' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'incorrectpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials.')
  })
})
