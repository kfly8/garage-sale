import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user, isLoading, login, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-primary">
                Garage Sale
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/projects"
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Projects
                </Link>
                <Link
                  to="/maintainers"
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Maintainers
                </Link>
                <Link
                  to="/matches"
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Matches
                </Link>
              </div>
            </div>
            <div>
              {isLoading ? (
                <div className="text-gray-500 text-sm">Loading...</div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user.github_username}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Login with GitHub
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
