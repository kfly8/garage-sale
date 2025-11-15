// プロジェクト（メンテナーを募集しているOSS）
export interface Project {
  id: string
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
  createdAt: Date
  updatedAt: Date
  status: 'open' | 'matched' | 'closed'
}

// メンテナー希望者
export interface Maintainer {
  id: string
  githubUsername: string
  name: string
  bio?: string
  skills: string[]
  languages: string[]
  experience: string[]
  availability: 'full-time' | 'part-time' | 'volunteer'
  interestedInPaid: boolean
  portfolioUrl?: string
  createdAt: Date
  updatedAt: Date
}

// マッチング
export interface Match {
  id: string
  projectId: string
  maintainerId: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  message?: string
  createdAt: Date
  updatedAt: Date
}

// ユーザー
export interface User {
  id: string
  githubId: string
  githubUsername: string
  email?: string
  createdAt: Date
  updatedAt: Date
}
