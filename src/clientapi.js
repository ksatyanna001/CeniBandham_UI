const DEMO_OTP = '123456'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '')
const challenges = new Map()
const accounts = new Set()
const profiles = new Set()
let nextId = 1

function createId(prefix) {
  const id = `${prefix}-${nextId}`
  nextId += 1
  return id
}

function requireValid(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function requestJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  let result = null
  if (response.status !== 204) {
    const contentType = response.headers.get('content-type') || ''
    result = contentType.includes('application/json')
      ? await response.json()
      : await response.text()
  }

  if (!response.ok) {
    const message = typeof result === 'string' ? result : result?.message
    throw new Error(message || `Request failed with HTTP ${response.status}.`)
  }

  return result
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error(`Could not read ${file.name} as a data URL.`))
        return
      }
      resolve(reader.result.split(',')[1])
    }
    reader.onerror = () => reject(reader.error || new Error(`Could not read ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

async function createPublishPayload(accountId, profileId, account, role, profile) {
  const [photoData, portfolio] = await Promise.all([
    fileToBase64(profile.photo),
    Promise.all(profile.portfolio.map(async (file) => ({
      fileName: file.name,
      contentType: file.type,
      base64Data: await fileToBase64(file),
    }))),
  ])

  return {
    payload: {
      accountId,
      profileId,
      account: {
        fullName: account.fullName,
        screenName: account.screenName,
        mobile: account.mobile,
        email: account.email,
        acceptedTerms: account.acceptedTerms,
        adult: account.adult,
      },
      role,
      profile: {
        primaryRole: profile.primaryRole,
        ageRange: profile.ageRange,
        city: profile.city,
        state: profile.state,
        languages: profile.languages,
        bio: profile.bio,
        experience: profile.experience,
        skills: profile.skills,
        height: profile.height,
        pastProjects: profile.pastProjects,
        portfolioLink: profile.portfolioLink,
        availability: profile.availability,
        contactPreference: profile.contactPreference,
      },
      media: {
        photo: {
          fileName: profile.photo.name,
          contentType: profile.photo.type,
          base64Data: photoData,
        },
        portfolio,
      },
    },
  }
}

export const registrationApi = {
  mode: 'mock',

  async requestOtp(mobile) {
    requireValid(/^[0-9]{10}$/.test(mobile), 'Enter a valid 10-digit mobile number.')
    const challengeId = createId('challenge')
    challenges.set(challengeId, false)
    return { challengeId, demoCode: DEMO_OTP }
  },

  async verifyOtp(challengeId, code) {
    requireValid(challenges.has(challengeId), 'Request a new verification code and try again.')
    requireValid(code === DEMO_OTP, 'That demo code is not correct. Enter 123456 to continue.')
    challenges.set(challengeId, true)
    return { verified: true }
  },

  async createAccount(account, challengeId) {
    requireValid(challenges.get(challengeId) === true, 'Verify your mobile number before creating an account.')
    requireValid(account.fullName.trim(), 'Enter your full name.')
    requireValid(account.password.length >= 8, 'Password must be at least 8 characters.')
    requireValid(account.acceptedTerms && account.adult, 'Accept the terms and confirm you are 18 or older.')

    const accountId = createId('demo-account')
    accounts.add(accountId)
    return { accountId, status: 'created' }
  },

  async saveProfessionalRole(accountId, role) {
    requireValid(accounts.has(accountId), 'Create your account before saving a professional role.')
    requireValid(Boolean(role), 'Choose a professional role.')
    return { accountId, role, status: 'saved' }
  },

  async saveActorProfile(accountId, profile) {
    requireValid(accounts.has(accountId), 'Create your account before saving an actor profile.')
    requireValid(Boolean(
      profile.primaryRole &&
        profile.city &&
        profile.state &&
        profile.languages &&
        profile.bio &&
        profile.photo &&
        profile.portfolio?.length,
    ), 'Complete all required actor profile details.')

    const profileId = createId('demo-profile')
    profiles.add(profileId)
    return { accountId, profileId, status: 'saved' }
  },

  async publishActorProfile(accountId, profileId, account, role, profile) {
    requireValid(accounts.has(accountId) && profiles.has(profileId), 'Save a complete actor profile before publishing.')
    const payload = await createPublishPayload(accountId, profileId, account, role, profile)
    const result = await requestJson(`/profiles/${encodeURIComponent(profileId)}/publish`, payload)
    return { accountId, profileId, status: 'published', result }
  },

  async submitSafetyReport(action, details) {
    requireValid(Boolean(action && details.trim()), 'Provide details for the safety report.')
    return { status: 'received' }
  },
}

export const loginApi = {
  async signIn({ username, password, rememberMe }) {
    requireValid(Boolean(username.trim()), 'Enter your username.')
    requireValid(Boolean(password), 'Enter your password.')
    return requestJson('/auth/login', {
      payload: { username: username.trim(), password, rememberMe },
    })
  },

  async requestPasswordReset(username) {
    requireValid(Boolean(username.trim()), 'Enter your username first.')
    return requestJson('/auth/forgot-password', {
      payload: { username: username.trim() },
    })
  },
}
