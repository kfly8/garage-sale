import { Hono } from 'hono'
import { db } from './db'
import crypto from 'crypto'

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
  const result = await db.execute('SELECT * FROM projects ORDER BY created_at DESC')
  return c.json({ projects: result.rows })
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
  const result = await db.execute('SELECT * FROM maintainers ORDER BY created_at DESC')
  return c.json({ maintainers: result.rows })
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
