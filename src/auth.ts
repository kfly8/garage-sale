import { GitHub } from 'arctic'

export interface AuthEnv {
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  APP_URL: string
}

export function getGitHub(env: AuthEnv): GitHub {
  return new GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
    `${env.APP_URL}/auth/callback`
  )
}

export interface GitHubUser {
  id: number
  login: string
  email: string | null
  name: string | null
  avatar_url: string
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'garage-sale'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub user')
  }

  return await response.json()
}

// Session management using simple JWT-like approach
export function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export interface Session {
  userId: string
  githubId: string
  githubUsername: string
  expiresAt: number
}

export function createSession(userId: string, githubId: string, githubUsername: string): Session {
  return {
    userId,
    githubId,
    githubUsername,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}

export function isSessionValid(session: Session): boolean {
  return session.expiresAt > Date.now()
}
