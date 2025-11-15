import { Hono } from 'hono'
import { getDb } from './db'
import crypto from 'node:crypto'

type Bindings = {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ヘルスチェック
app.get('/', (c) => {
  return c.json({ message: 'OSS Maintainer Matching Service API' })
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

app.post('/api/projects', async (c) => {
  const db = getDb(c.env)
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
