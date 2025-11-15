import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => void
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const response = await fetch('/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = () => {
    window.location.href = '/auth/login'
  }

  const logout = async () => {
    try {
      await fetch('/auth/logout')
      setUser(null)
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  const refetch = async () => {
    setIsLoading(true)
    await fetchUser()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
