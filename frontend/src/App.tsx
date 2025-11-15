import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import MaintainersPage from './pages/MaintainersPage'
import MaintainerDetailPage from './pages/MaintainerDetailPage'
import MatchesPage from './pages/MatchesPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="maintainers" element={<MaintainersPage />} />
          <Route path="maintainers/:id" element={<MaintainerDetailPage />} />
          <Route path="matches" element={<MatchesPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
