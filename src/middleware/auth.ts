import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { getDb } from '../db'

export interface AuthUser {
  id: string
  githubId: string
  githubUsername: string
  email: string | null
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
  }
}

export async function requireAuth(c: Context, next: Next) {
  const db = getDb(c.env)
  const sessionToken = getCookie(c, 'session')

  if (!sessionToken) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const result = await db.execute({
    sql: 'SELECT * FROM sessions WHERE id = ? AND expires_at > ?',
    args: [sessionToken, Date.now()]
  })

  if (result.rows.length === 0) {
    return c.json({ error: 'Session expired' }, 401)
  }

  const session = result.rows[0] as any
  const userResult = await db.execute({
    sql: 'SELECT id, github_id, github_username, email FROM users WHERE id = ?',
    args: [session.user_id]
  })

  if (userResult.rows.length === 0) {
    return c.json({ error: 'User not found' }, 404)
  }

  const user = userResult.rows[0] as any
  c.set('user', {
    id: user.id,
    githubId: user.github_id,
    githubUsername: user.github_username,
    email: user.email
  })

  await next()
}

export async function optionalAuth(c: Context, next: Next) {
  const db = getDb(c.env)
  const sessionToken = getCookie(c, 'session')

  if (sessionToken) {
    const result = await db.execute({
      sql: 'SELECT * FROM sessions WHERE id = ? AND expires_at > ?',
      args: [sessionToken, Date.now()]
    })

    if (result.rows.length > 0) {
      const session = result.rows[0] as any
      const userResult = await db.execute({
        sql: 'SELECT id, github_id, github_username, email FROM users WHERE id = ?',
        args: [session.user_id]
      })

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0] as any
        c.set('user', {
          id: user.id,
          githubId: user.github_id,
          githubUsername: user.github_username,
          email: user.email
        })
      }
    }
  }

  await next()
}
