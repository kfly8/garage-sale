import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Maintainer } from '../types'

export default function MaintainerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [maintainer, setMaintainer] = useState<Maintainer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMaintainer()
  }, [id])

  const fetchMaintainer = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/maintainers/${id}`)
      const data = await response.json()
      setMaintainer(data.maintainer)
    } catch (error) {
      console.error('Failed to fetch maintainer:', error)
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!maintainer) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Maintainer not found</div>
        <Link to="/maintainers" className="text-primary hover:underline mt-4 inline-block">
          Back to Maintainers
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/maintainers" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Maintainers
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{maintainer.name}</h1>
            <p className="text-gray-600">@{maintainer.github_username}</p>
          </div>
          <div className="flex items-center space-x-2">
            {maintainer.interested_in_paid === 1 && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                Open to Paid
              </span>
            )}
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
              {maintainer.availability}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {maintainer.bio && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Bio
              </h3>
              <p className="text-gray-700">{maintainer.bio}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {parseArray(maintainer.skills).map((skill) => (
                <span
                  key={skill}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {parseArray(maintainer.languages).map((lang) => (
                <span
                  key={lang}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {maintainer.experience && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Experience
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {parseArray(maintainer.experience).map((exp, idx) => (
                  <li key={idx}>{exp}</li>
                ))}
              </ul>
            </div>
          )}

          {maintainer.portfolio_url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Portfolio
              </h3>
              <a
                href={maintainer.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {maintainer.portfolio_url}
              </a>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium">
              Request as Maintainer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
