import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { app } from '../app'

describe('API Tests', () => {
  describe('Health Check', () => {
    it('should return health check message', async () => {
      const res = await app.request('/')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toEqual({ message: 'OSS Maintainer Matching Service API' })
    })
  })

  describe('User API', () => {
    let createdUserId: string

    it('should create a new user', async () => {
      const res = await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubId: 'test-123',
          githubUsername: 'testuser',
          email: 'test@example.com',
        }),
      })

      expect(res.status).toBe(201)

      const data = await res.json()
      expect(data.user).toBeDefined()
      expect(data.user.github_username).toBe('testuser')
      expect(data.user.email).toBe('test@example.com')

      createdUserId = data.user.id
    })

    it('should get all users', async () => {
      const res = await app.request('/api/users')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.users).toBeDefined()
      expect(Array.isArray(data.users)).toBe(true)
    })

    it('should get a user by id', async () => {
      const res = await app.request(`/api/users/${createdUserId}`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.user).toBeDefined()
      expect(data.user.id).toBe(createdUserId)
    })

    it('should return 404 for non-existent user', async () => {
      const res = await app.request('/api/users/non-existent-id')
      expect(res.status).toBe(404)

      const data = await res.json()
      expect(data.error).toBe('User not found')
    })
  })

  describe('Project API', () => {
    let testUserId: string
    let createdProjectId: string

    beforeAll(async () => {
      // Create a test user for projects
      const userRes = await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubId: 'project-owner-123',
          githubUsername: 'projectowner',
          email: 'owner@example.com',
        }),
      })
      const userData = await userRes.json()
      testUserId = userData.user.id
    })

    it('should create a new project', async () => {
      const res = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Project',
          description: 'A test project for unit testing',
          repositoryUrl: 'https://github.com/test/project',
          languages: ['TypeScript', 'JavaScript'],
          maintainerRequirements: 'Experience with testing',
          isPaid: false,
          ownerId: testUserId,
        }),
      })

      expect(res.status).toBe(201)

      const data = await res.json()
      expect(data.project).toBeDefined()
      expect(data.project.name).toBe('Test Project')
      expect(data.project.status).toBe('open')

      createdProjectId = data.project.id
    })

    it('should get all projects', async () => {
      const res = await app.request('/api/projects')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.projects).toBeDefined()
      expect(Array.isArray(data.projects)).toBe(true)
    })

    it('should get a project by id', async () => {
      const res = await app.request(`/api/projects/${createdProjectId}`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.project).toBeDefined()
      expect(data.project.id).toBe(createdProjectId)
    })

    it('should return 404 for non-existent project', async () => {
      const res = await app.request('/api/projects/non-existent-id')
      expect(res.status).toBe(404)

      const data = await res.json()
      expect(data.error).toBe('Project not found')
    })
  })

  describe('Maintainer API', () => {
    let testUserId: string
    let createdMaintainerId: string

    beforeAll(async () => {
      // Create a test user for maintainer
      const userRes = await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubId: 'maintainer-123',
          githubUsername: 'testmaintainer',
          email: 'maintainer@example.com',
        }),
      })
      const userData = await userRes.json()
      testUserId = userData.user.id
    })

    it('should create a new maintainer', async () => {
      const res = await app.request('/api/maintainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: 'testmaintainer',
          name: 'Test Maintainer',
          bio: 'Experienced developer',
          skills: ['TypeScript', 'Node.js'],
          languages: ['TypeScript', 'JavaScript'],
          experience: ['5 years of development'],
          availability: 'part-time',
          interestedInPaid: true,
          portfolioUrl: 'https://example.com',
          userId: testUserId,
        }),
      })

      expect(res.status).toBe(201)

      const data = await res.json()
      expect(data.maintainer).toBeDefined()
      expect(data.maintainer.name).toBe('Test Maintainer')
      expect(data.maintainer.availability).toBe('part-time')

      createdMaintainerId = data.maintainer.id
    })

    it('should get all maintainers', async () => {
      const res = await app.request('/api/maintainers')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.maintainers).toBeDefined()
      expect(Array.isArray(data.maintainers)).toBe(true)
    })

    it('should get a maintainer by id', async () => {
      const res = await app.request(`/api/maintainers/${createdMaintainerId}`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.maintainer).toBeDefined()
      expect(data.maintainer.id).toBe(createdMaintainerId)
    })

    it('should return 404 for non-existent maintainer', async () => {
      const res = await app.request('/api/maintainers/non-existent-id')
      expect(res.status).toBe(404)

      const data = await res.json()
      expect(data.error).toBe('Maintainer not found')
    })
  })

  describe('Match API', () => {
    let testUserId: string
    let testProjectId: string
    let testMaintainerId: string
    let createdMatchId: string

    beforeAll(async () => {
      // Create test user
      const userRes = await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubId: 'match-user-123',
          githubUsername: 'matchuser',
          email: 'match@example.com',
        }),
      })
      const userData = await userRes.json()
      testUserId = userData.user.id

      // Create test project
      const projectRes = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Match Test Project',
          description: 'Project for match testing',
          repositoryUrl: 'https://github.com/test/match-project',
          languages: ['TypeScript'],
          isPaid: false,
          ownerId: testUserId,
        }),
      })
      const projectData = await projectRes.json()
      testProjectId = projectData.project.id

      // Create test maintainer
      const maintainerRes = await app.request('/api/maintainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: 'matchmaintainer',
          name: 'Match Maintainer',
          skills: ['TypeScript'],
          languages: ['TypeScript'],
          availability: 'volunteer',
          interestedInPaid: false,
          userId: testUserId,
        }),
      })
      const maintainerData = await maintainerRes.json()
      testMaintainerId = maintainerData.maintainer.id
    })

    it('should create a new match', async () => {
      const res = await app.request('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: testProjectId,
          maintainerId: testMaintainerId,
          message: 'I would like to help!',
        }),
      })

      expect(res.status).toBe(201)

      const data = await res.json()
      expect(data.match).toBeDefined()
      expect(data.match.project_id).toBe(testProjectId)
      expect(data.match.maintainer_id).toBe(testMaintainerId)
      expect(data.match.status).toBe('pending')

      createdMatchId = data.match.id
    })

    it('should get all matches', async () => {
      const res = await app.request('/api/matches')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.matches).toBeDefined()
      expect(Array.isArray(data.matches)).toBe(true)
    })
  })
})
