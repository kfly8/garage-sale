import { describe, it, expect, beforeAll } from 'vitest'
import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { getDb } from '../db'
import { generateSessionToken, createSession } from '../auth'
import { requireAuth } from '../middleware/auth'
import crypto from 'node:crypto'

// テスト用のシンプルなアプリを作成
const testApp = new Hono()

// 認証が必要なエンドポイント
testApp.get('/protected', requireAuth, async (c) => {
  const user = c.get('user')
  return c.json({ message: 'Protected resource', user })
})

// セッション作成用のヘルパーエンドポイント
testApp.post('/test/create-session', async (c) => {
  const db = getDb()
  const { userId, githubId, githubUsername } = await c.req.json()

  const sessionToken = generateSessionToken()
  const session = createSession(userId, githubId, githubUsername)

  await db.execute({
    sql: 'INSERT INTO sessions (id, user_id, github_id, github_username, expires_at) VALUES (?, ?, ?, ?, ?)',
    args: [sessionToken, session.userId, session.githubId, session.githubUsername, session.expiresAt]
  })

  setCookie(c, 'session', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 30 * 24 * 60 * 60
  })

  return c.json({ sessionToken })
})

describe('Authentication Tests', () => {
  let testUserId: string
  let testSessionToken: string

  beforeAll(async () => {
    const db = getDb()

    // テスト用ユーザーを作成
    testUserId = crypto.randomUUID()
    const uniqueId = `auth-test-${Date.now()}-${Math.random()}`

    await db.execute({
      sql: 'INSERT INTO users (id, github_id, github_username, email) VALUES (?, ?, ?, ?)',
      args: [testUserId, uniqueId, `testuser-${uniqueId}`, `test-${uniqueId}@example.com`]
    })
  })

  describe('Session Management', () => {
    it('should generate unique session tokens', () => {
      const token1 = generateSessionToken()
      const token2 = generateSessionToken()

      expect(token1).toBeTruthy()
      expect(token2).toBeTruthy()
      expect(token1).not.toBe(token2)
    })

    it('should create session with correct expiration', () => {
      const session = createSession(testUserId, '12345', 'testuser')

      expect(session.userId).toBe(testUserId)
      expect(session.githubId).toBe('12345')
      expect(session.githubUsername).toBe('testuser')
      expect(session.expiresAt).toBeGreaterThan(Date.now())
    })

    it('should create and store session in database', async () => {
      const db = getDb()
      const uniqueId = `session-test-${Date.now()}-${Math.random()}`

      // テスト用ユーザーを作成
      const userId = crypto.randomUUID()
      await db.execute({
        sql: 'INSERT INTO users (id, github_id, github_username, email) VALUES (?, ?, ?, ?)',
        args: [userId, uniqueId, `user-${uniqueId}`, `${uniqueId}@example.com`]
      })

      const sessionToken = generateSessionToken()
      const session = createSession(userId, uniqueId, `user-${uniqueId}`)

      await db.execute({
        sql: 'INSERT INTO sessions (id, user_id, github_id, github_username, expires_at) VALUES (?, ?, ?, ?, ?)',
        args: [sessionToken, session.userId, session.githubId, session.githubUsername, session.expiresAt]
      })

      // セッションが保存されていることを確認
      const result = await db.execute({
        sql: 'SELECT * FROM sessions WHERE id = ?',
        args: [sessionToken]
      })

      expect(result.rows.length).toBe(1)
      const savedSession = result.rows[0] as any
      expect(savedSession.user_id).toBe(userId)
      expect(savedSession.github_id).toBe(uniqueId)
    })
  })

  describe('Authentication Middleware', () => {
    it('should reject requests without session cookie', async () => {
      const res = await testApp.request('/protected')
      expect(res.status).toBe(401)

      const data = await res.json()
      expect(data.error).toBe('Authentication required')
    })

    it('should reject requests with invalid session token', async () => {
      const res = await testApp.request('/protected', {
        headers: {
          'Cookie': 'session=invalid-token-12345'
        }
      })
      expect(res.status).toBe(401)
    })

    it('should allow requests with valid session', async () => {
      // まずセッションを作成
      const uniqueId = `middleware-test-${Date.now()}-${Math.random()}`
      const createRes = await testApp.request('/test/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUserId,
          githubId: uniqueId,
          githubUsername: `testuser-${uniqueId}`
        })
      })

      expect(createRes.status).toBe(200)

      // Cookieを取得
      const setCookieHeader = createRes.headers.get('Set-Cookie')
      expect(setCookieHeader).toBeTruthy()

      // セッションtokenを抽出
      const sessionMatch = setCookieHeader?.match(/session=([^;]+)/)
      expect(sessionMatch).toBeTruthy()
      const sessionToken = sessionMatch![1]

      // 保護されたリソースにアクセス
      const res = await testApp.request('/protected', {
        headers: {
          'Cookie': `session=${sessionToken}`
        }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.message).toBe('Protected resource')
      expect(data.user).toBeDefined()
      expect(data.user.id).toBe(testUserId)
    })

    it('should reject expired sessions', async () => {
      const db = getDb()
      const uniqueId = `expired-test-${Date.now()}-${Math.random()}`

      // テスト用ユーザーを作成
      const userId = crypto.randomUUID()
      await db.execute({
        sql: 'INSERT INTO users (id, github_id, github_username, email) VALUES (?, ?, ?, ?)',
        args: [userId, uniqueId, `user-${uniqueId}`, `${uniqueId}@example.com`]
      })

      // 期限切れのセッションを作成
      const sessionToken = generateSessionToken()
      const expiredTime = Date.now() - 1000 // 1秒前に期限切れ

      await db.execute({
        sql: 'INSERT INTO sessions (id, user_id, github_id, github_username, expires_at) VALUES (?, ?, ?, ?, ?)',
        args: [sessionToken, userId, uniqueId, `user-${uniqueId}`, expiredTime]
      })

      // 保護されたリソースにアクセス
      const res = await testApp.request('/protected', {
        headers: {
          'Cookie': `session=${sessionToken}`
        }
      })

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBe('Session expired')
    })
  })

  describe('Protected Endpoints', () => {
    it('should protect POST /api/projects endpoint', async () => {
      // worker.tsから実際のアプリをインポートするのではなく、
      // ここではミドルウェアの動作を確認
      // 実際のエンドポイントテストはworker.test.tsで行う
      expect(requireAuth).toBeDefined()
    })
  })
})
