import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { getDb } from './db'
import { getGitHub, getGitHubUser, generateSessionToken, createSession, type AuthEnv } from './auth'
import { requireAuth } from './middleware/auth'
import crypto from 'node:crypto'

type Bindings = {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  APP_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ヘルスチェック
app.get('/', (c) => {
  return c.json({ message: 'OSS Maintainer Matching Service API' })
})

// 認証エンドポイント
app.get('/auth/login', async (c) => {
  const github = getGitHub(c.env as AuthEnv)
  const state = generateSessionToken()
  const url = github.createAuthorizationURL(state, ['user:email'])

  // stateをセッションに保存（簡易的にcookieに保存）
  setCookie(c, 'github_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 600 // 10分
  })

  return c.redirect(url.toString())
})

app.get('/auth/callback', async (c) => {
  const db = getDb(c.env)
  const code = c.req.query('code')
  const state = c.req.query('state')
  const storedState = getCookie(c, 'github_oauth_state')

  if (!code || !state || !storedState || state !== storedState) {
    return c.json({ error: 'Invalid OAuth callback' }, 400)
  }

  try {
    const github = getGitHub(c.env as AuthEnv)
    const { accessToken } = await github.validateAuthorizationCode(code)
    const githubUser = await getGitHubUser(accessToken)

    // ユーザーを検索または作成
    let userResult = await db.execute({
      sql: 'SELECT * FROM users WHERE github_id = ?',
      args: [String(githubUser.id)]
    })

    let userId: string
    if (userResult.rows.length === 0) {
      // 新規ユーザーを作成
      userId = crypto.randomUUID()
      await db.execute({
        sql: 'INSERT INTO users (id, github_id, github_username, email) VALUES (?, ?, ?, ?)',
        args: [userId, String(githubUser.id), githubUser.login, githubUser.email]
      })
    } else {
      userId = (userResult.rows[0] as any).id
    }

    // セッションを作成
    const sessionToken = generateSessionToken()
    const session = createSession(userId, String(githubUser.id), githubUser.login)

    await db.execute({
      sql: 'INSERT INTO sessions (id, user_id, github_id, github_username, expires_at) VALUES (?, ?, ?, ?, ?)',
      args: [sessionToken, session.userId, session.githubId, session.githubUsername, session.expiresAt]
    })

    // セッションtokenをcookieに保存
    setCookie(c, 'session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 30 * 24 * 60 * 60 // 30日
    })

    // stateのcookieを削除
    setCookie(c, 'github_oauth_state', '', { maxAge: 0 })

    return c.redirect('/')
  } catch (error) {
    console.error('OAuth error:', error)
    return c.json({ error: 'Authentication failed' }, 500)
  }
})

app.get('/auth/logout', async (c) => {
  const db = getDb(c.env)
  const sessionToken = getCookie(c, 'session')

  if (sessionToken) {
    await db.execute({
      sql: 'DELETE FROM sessions WHERE id = ?',
      args: [sessionToken]
    })
  }

  setCookie(c, 'session', '', { maxAge: 0 })
  return c.json({ message: 'Logged out successfully' })
})

app.get('/auth/me', async (c) => {
  const db = getDb(c.env)
  const sessionToken = getCookie(c, 'session')

  if (!sessionToken) {
    return c.json({ error: 'Not authenticated' }, 401)
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
    sql: 'SELECT id, github_id, github_username, email, created_at FROM users WHERE id = ?',
    args: [session.user_id]
  })

  if (userResult.rows.length === 0) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user: userResult.rows[0] })
})

// プロジェクト関連のエンドポイント
app.get('/api/projects', async (c) => {
  const db = getDb(c.env)

  // クエリパラメータの取得
  const language = c.req.query('language')
  const status = c.req.query('status')
  const isPaid = c.req.query('isPaid')
  const sortBy = c.req.query('sortBy') || 'created_at'
  const order = c.req.query('order') || 'DESC'
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')
  const offset = (page - 1) * limit

  // SQLクエリの構築
  let sql = 'SELECT * FROM projects WHERE 1=1'
  const args: any[] = []

  if (language) {
    sql += ' AND languages LIKE ?'
    args.push(`%"${language}"%`)
  }

  if (status) {
    sql += ' AND status = ?'
    args.push(status)
  }

  if (isPaid !== undefined) {
    sql += ' AND is_paid = ?'
    args.push(isPaid === 'true' ? 1 : 0)
  }

  // ソート
  const validSortColumns = ['created_at', 'updated_at', 'name']
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
  sql += ` ORDER BY ${sortColumn} ${sortOrder}`

  // ページネーション
  sql += ' LIMIT ? OFFSET ?'
  args.push(limit, offset)

  const result = await db.execute({ sql, args })

  // 総数の取得
  let countSql = 'SELECT COUNT(*) as total FROM projects WHERE 1=1'
  const countArgs: any[] = []

  if (language) {
    countSql += ' AND languages LIKE ?'
    countArgs.push(`%"${language}"%`)
  }

  if (status) {
    countSql += ' AND status = ?'
    countArgs.push(status)
  }

  if (isPaid !== undefined) {
    countSql += ' AND is_paid = ?'
    countArgs.push(isPaid === 'true' ? 1 : 0)
  }

  const countResult = await db.execute({ sql: countSql, args: countArgs })
  const total = (countResult.rows[0] as any).total

  return c.json({
    projects: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})

app.post('/api/projects', requireAuth, async (c) => {
  const db = getDb(c.env)
  const user = c.get('user')
  const body = await c.req.json<{
    name: string
    description: string
    repositoryUrl: string
    languages: string[]
    maintainerRequirements?: string
    isPaid: boolean
    compensation?: {
      amount?: number
      currency?: string
      description?: string
    }
  }>()

  const id = crypto.randomUUID()

  await db.execute({
    sql: `INSERT INTO projects (
      id, name, description, repository_url, languages,
      maintainer_requirements, is_paid, compensation_amount,
      compensation_currency, compensation_description, owner_id, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      body.name,
      body.description,
      body.repositoryUrl,
      JSON.stringify(body.languages),
      body.maintainerRequirements || null,
      body.isPaid ? 1 : 0,
      body.compensation?.amount || null,
      body.compensation?.currency || null,
      body.compensation?.description || null,
      user.id, // 認証されたユーザーのIDを使用
      'open'
    ]
  })

  const result = await db.execute({
    sql: 'SELECT * FROM projects WHERE id = ?',
    args: [id]
  })

  return c.json({ project: result.rows[0] }, 201)
})

app.get('/api/projects/:id', async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  const result = await db.execute({
    sql: 'SELECT * FROM projects WHERE id = ?',
    args: [id]
  })

  if (result.rows.length === 0) {
    return c.json({ error: 'Project not found' }, 404)
  }

  return c.json({ project: result.rows[0] })
})

// Add minimal endpoints for other resources
app.get('/api/users', async (c) => {
  const db = getDb(c.env)
  const result = await db.execute('SELECT * FROM users ORDER BY created_at DESC')
  return c.json({ users: result.rows })
})

app.get('/api/maintainers', async (c) => {
  const db = getDb(c.env)
  const result = await db.execute('SELECT * FROM maintainers ORDER BY created_at DESC')
  return c.json({ maintainers: result.rows })
})

app.get('/api/matches', async (c) => {
  const db = getDb(c.env)
  const result = await db.execute('SELECT * FROM matches ORDER BY created_at DESC')
  return c.json({ matches: result.rows })
})

export default app
