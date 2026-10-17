import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Wizard from './pages/Wizard'
import Recommendations from './pages/Recommendations'
import Compare from './pages/Compare'
import DecisionDetail from './pages/DecisionDetail'
import Profile from './pages/Profile'
import Bookmarks from './pages/Bookmarks'
import Journal from './pages/Journal'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/decisions/:sessionId"
            element={<ProtectedRoute><DecisionDetail /></ProtectedRoute>}
          />
          <Route
            path="/decisions/:sessionId/wizard"
            element={<ProtectedRoute><Wizard /></ProtectedRoute>}
          />
          <Route
            path="/decisions/:sessionId/recommendations"
            element={<ProtectedRoute><Recommendations /></ProtectedRoute>}
          />
          <Route
            path="/decisions/:sessionId/compare"
            element={<ProtectedRoute><Compare /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/bookmarks"
            element={<ProtectedRoute><Bookmarks /></ProtectedRoute>}
          />
          <Route
            path="/journal"
            element={<ProtectedRoute><Journal /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
