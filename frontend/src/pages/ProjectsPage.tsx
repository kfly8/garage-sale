import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Project, PaginationInfo } from '../types'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    language: '',
    status: '',
    isPaid: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [filters])

  const fetchProjects = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10'
      })

      if (filters.language) params.append('language', filters.language)
      if (filters.status) params.append('status', filters.status)
      if (filters.isPaid) params.append('isPaid', filters.isPaid)

      const response = await fetch(`/api/projects?${params}`)
      const data = await response.json()
      setProjects(data.projects)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const parseLanguages = (languagesJson: string): string[] => {
    try {
      return JSON.parse(languagesJson)
    } catch {
      return []
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid md:grid-cols-3 gap-4">
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
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="matched">Matched</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compensation
            </label>
            <select
              value={filters.isPaid}
              onChange={(e) => setFilters({ ...filters, isPaid: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="true">Paid</option>
              <option value="false">Volunteer</option>
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
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {project.is_paid === 1 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Paid
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {project.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {parseLanguages(project.languages).map((lang) => (
                    <span
                      key={lang}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {project.repository_url}
                  </a>
                </div>
              </Link>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => fetchProjects(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchProjects(pagination.page + 1)}
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
