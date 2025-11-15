import { useState, useEffect } from 'react'
import type { Match } from '../types'

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/matches')
      const data = await response.json()
      setMatches(data.matches)
    } catch (error) {
      console.error('Failed to fetch matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Matches</h1>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-gray-500 mb-4">No matches yet</div>
          <p className="text-sm text-gray-400">
            Browse projects and maintainers to create your first match
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Project ID: {match.project_id}
                  </div>
                  <div className="text-sm text-gray-500">
                    Maintainer ID: {match.maintainer_id}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${getStatusColor(match.status)}`}>
                  {match.status}
                </span>
              </div>

              {match.message && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Message:</div>
                  <p className="text-gray-700">{match.message}</p>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-400">
                Created: {new Date(match.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
