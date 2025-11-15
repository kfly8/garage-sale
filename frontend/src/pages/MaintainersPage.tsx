import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Maintainer, PaginationInfo } from '../types'

export default function MaintainersPage() {
  const [maintainers, setMaintainers] = useState<Maintainer[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    skill: '',
    language: '',
    availability: '',
    interestedInPaid: ''
  })

  useEffect(() => {
    fetchMaintainers()
  }, [filters])

  const fetchMaintainers = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10'
      })

      if (filters.skill) params.append('skill', filters.skill)
      if (filters.language) params.append('language', filters.language)
      if (filters.availability) params.append('availability', filters.availability)
      if (filters.interestedInPaid) params.append('interestedInPaid', filters.interestedInPaid)

      const response = await fetch(`/api/maintainers?${params}`)
      const data = await response.json()
      setMaintainers(data.maintainers)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch maintainers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const parseArray = (jsonString: string): string[] => {
    try {
      return JSON.parse(jsonString)
    } catch {
      return []
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Maintainers</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill
            </label>
            <input
              type="text"
              value={filters.skill}
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
              placeholder="e.g. React"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <input
              type="text"
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              placeholder="e.g. TypeScript"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interested in Paid
            </label>
            <select
              value={filters.interestedInPaid}
              onChange={(e) => setFilters({ ...filters, interestedInPaid: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {maintainers.map((maintainer) => (
              <Link
                key={maintainer.id}
                to={`/maintainers/${maintainer.id}`}
                className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {maintainer.name}
                    </h3>
                    <p className="text-sm text-gray-500">@{maintainer.github_username}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {maintainer.interested_in_paid === 1 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Open to Paid
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {maintainer.availability}
                    </span>
                  </div>
                </div>
                {maintainer.bio && (
                  <p className="text-gray-600 mb-3">{maintainer.bio}</p>
                )}
                <div className="mb-2">
                  <div className="text-xs text-gray-500 mb-1">Skills:</div>
                  <div className="flex flex-wrap gap-2">
                    {parseArray(maintainer.skills).map((skill) => (
                      <span
                        key={skill}
                        className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Languages:</div>
                  <div className="flex flex-wrap gap-2">
                    {parseArray(maintainer.languages).map((lang) => (
                      <span
                        key={lang}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => fetchMaintainers(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchMaintainers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
