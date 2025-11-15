import { Hono } from 'hono'
import { db } from './db'
import crypto from 'node:crypto'

export const app = new Hono()

// ヘルスチェック
app.get('/', (c) => {
  return c.json({ message: 'OSS Maintainer Matching Service API' })
})

// ユーザー関連のエンドポイント
app.get('/api/users', async (c) => {
  const result = await db.execute('SELECT * FROM users ORDER BY created_at DESC')
  return c.json({ users: result.rows })
})

app.post('/api/users', async (c) => {
  const body = await c.req.json<{
    githubId: string
    githubUsername: string
    email?: string
  }>()

  const id = crypto.randomUUID()

  await db.execute({
    sql: 'INSERT INTO users (id, github_id, github_username, email) VALUES (?, ?, ?, ?)',
    args: [id, body.githubId, body.githubUsername, body.email || null]
  })

  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  })

  return c.json({ user: result.rows[0] }, 201)
})

app.get('/api/users/:id', async (c) => {
  const id = c.req.param('id')
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  })

  if (result.rows.length === 0) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user: result.rows[0] })
})

// プロジェクト関連のエンドポイント
app.get('/api/projects', async (c) => {
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

app.post('/api/projects', async (c) => {
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
    ownerId: string
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
      body.ownerId,
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

// メンテナー関連のエンドポイント
app.get('/api/maintainers', async (c) => {
  // クエリパラメータの取得
  const skill = c.req.query('skill')
  const language = c.req.query('language')
  const availability = c.req.query('availability')
  const interestedInPaid = c.req.query('interestedInPaid')
  const sortBy = c.req.query('sortBy') || 'created_at'
  const order = c.req.query('order') || 'DESC'
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')
  const offset = (page - 1) * limit

  // SQLクエリの構築
  let sql = 'SELECT * FROM maintainers WHERE 1=1'
  const args: any[] = []

  if (skill) {
    sql += ' AND skills LIKE ?'
    args.push(`%"${skill}"%`)
  }

  if (language) {
    sql += ' AND languages LIKE ?'
    args.push(`%"${language}"%`)
  }

  if (availability) {
    sql += ' AND availability = ?'
    args.push(availability)
  }

  if (interestedInPaid !== undefined) {
    sql += ' AND interested_in_paid = ?'
    args.push(interestedInPaid === 'true' ? 1 : 0)
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
  let countSql = 'SELECT COUNT(*) as total FROM maintainers WHERE 1=1'
  const countArgs: any[] = []

  if (skill) {
    countSql += ' AND skills LIKE ?'
    countArgs.push(`%"${skill}"%`)
  }

  if (language) {
    countSql += ' AND languages LIKE ?'
    countArgs.push(`%"${language}"%`)
  }

  if (availability) {
    countSql += ' AND availability = ?'
    countArgs.push(availability)
  }

  if (interestedInPaid !== undefined) {
    countSql += ' AND interested_in_paid = ?'
    countArgs.push(interestedInPaid === 'true' ? 1 : 0)
  }

  const countResult = await db.execute({ sql: countSql, args: countArgs })
  const total = (countResult.rows[0] as any).total

  return c.json({
    maintainers: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})

app.post('/api/maintainers', async (c) => {
  const body = await c.req.json<{
    githubUsername: string
    name: string
    bio?: string
    skills: string[]
    languages: string[]
    experience?: string[]
    availability: 'full-time' | 'part-time' | 'volunteer'
    interestedInPaid: boolean
    portfolioUrl?: string
    userId: string
  }>()

  const id = crypto.randomUUID()

  await db.execute({
    sql: `INSERT INTO maintainers (
      id, github_username, name, bio, skills, languages,
      experience, availability, interested_in_paid, portfolio_url, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      body.githubUsername,
      body.name,
      body.bio || null,
      JSON.stringify(body.skills),
      JSON.stringify(body.languages),
      body.experience ? JSON.stringify(body.experience) : null,
      body.availability,
      body.interestedInPaid ? 1 : 0,
      body.portfolioUrl || null,
      body.userId
    ]
  })

  const result = await db.execute({
    sql: 'SELECT * FROM maintainers WHERE id = ?',
    args: [id]
  })

  return c.json({ maintainer: result.rows[0] }, 201)
})

app.get('/api/maintainers/:id', async (c) => {
  const id = c.req.param('id')
  const result = await db.execute({
    sql: 'SELECT * FROM maintainers WHERE id = ?',
    args: [id]
  })

  if (result.rows.length === 0) {
    return c.json({ error: 'Maintainer not found' }, 404)
  }

  return c.json({ maintainer: result.rows[0] })
})

// マッチング関連のエンドポイント
app.get('/api/matches', async (c) => {
  const result = await db.execute('SELECT * FROM matches ORDER BY created_at DESC')
  return c.json({ matches: result.rows })
})

app.post('/api/matches', async (c) => {
  const body = await c.req.json<{
    projectId: string
    maintainerId: string
    message?: string
  }>()

  const id = crypto.randomUUID()

  await db.execute({
    sql: `INSERT INTO matches (
      id, project_id, maintainer_id, status, message
    ) VALUES (?, ?, ?, ?, ?)`,
    args: [
      id,
      body.projectId,
      body.maintainerId,
      'pending',
      body.message || null
    ]
  })

  const result = await db.execute({
    sql: 'SELECT * FROM matches WHERE id = ?',
    args: [id]
  })

  return c.json({ match: result.rows[0] }, 201)
})
