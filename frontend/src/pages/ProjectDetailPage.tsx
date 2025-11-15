import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Project } from '../types'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${id}`)
      const data = await response.json()
      setProject(data.project)
    } catch (error) {
      console.error('Failed to fetch project:', error)
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Project not found</div>
        <Link to="/projects" className="text-primary hover:underline mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/projects" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Projects
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <div className="flex items-center space-x-2">
            {project.is_paid === 1 && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                Paid
              </span>
            )}
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
              {project.status}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Description
            </h3>
            <p className="text-gray-700">{project.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Repository
            </h3>
            <a
              href={project.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {project.repository_url}
            </a>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {parseLanguages(project.languages).map((lang) => (
                <span
                  key={lang}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {project.maintainer_requirements && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Maintainer Requirements
              </h3>
              <p className="text-gray-700">{project.maintainer_requirements}</p>
            </div>
          )}

          {project.is_paid === 1 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Compensation
              </h3>
              <div className="text-gray-700">
                {project.compensation_amount && project.compensation_currency && (
                  <p className="font-semibold">
                    {project.compensation_amount} {project.compensation_currency}
                  </p>
                )}
                {project.compensation_description && (
                  <p className="mt-1">{project.compensation_description}</p>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium">
              Request to be a Maintainer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
