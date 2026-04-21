import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div style={{ color: 'var(--color-text)', padding: '2rem' }}>
              Dashboard coming soon
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}