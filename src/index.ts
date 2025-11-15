import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

// ヘルスチェック
app.get('/', (c) => {
  return c.json({ message: 'OSS Maintainer Matching Service API' })
})

// プロジェクト関連のエンドポイント
app.get('/api/projects', (c) => {
  return c.json({ projects: [] })
})

app.post('/api/projects', async (c) => {
  const body = await c.req.json()
  return c.json({ message: 'Project created', data: body }, 201)
})

app.get('/api/projects/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ project: { id, name: 'Sample Project' } })
})

// メンテナー関連のエンドポイント
app.get('/api/maintainers', (c) => {
  return c.json({ maintainers: [] })
})

app.post('/api/maintainers', async (c) => {
  const body = await c.req.json()
  return c.json({ message: 'Maintainer profile created', data: body }, 201)
})

app.get('/api/maintainers/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ maintainer: { id, name: 'Sample Maintainer' } })
})

// マッチング関連のエンドポイント
app.get('/api/matches', (c) => {
  return c.json({ matches: [] })
})

app.post('/api/matches', async (c) => {
  const body = await c.req.json()
  return c.json({ message: 'Match created', data: body }, 201)
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
