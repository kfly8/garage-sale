export interface User {
  id: string
  github_id: string
  github_username: string
  email: string | null
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  repository_url: string
  languages: string
  maintainer_requirements: string | null
  is_paid: number
  compensation_amount: number | null
  compensation_currency: string | null
  compensation_description: string | null
  owner_id: string
  status: 'open' | 'closed' | 'matched'
  created_at: string
  updated_at: string
}

export interface Maintainer {
  id: string
  github_username: string
  name: string
  bio: string | null
  skills: string
  languages: string
  experience: string | null
  availability: 'full-time' | 'part-time' | 'volunteer'
  interested_in_paid: number
  portfolio_url: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  project_id: string
  maintainer_id: string
  status: 'pending' | 'accepted' | 'rejected'
  message: string | null
  created_at: string
  updated_at: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}
