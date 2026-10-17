import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import { AppShell } from './components/AppShell'
import { PageLoader } from './components/ui'
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
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Notifications from './pages/Notifications'
import PriceAlerts from './pages/PriceAlerts'

function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen"><PageLoader label="Loading ThinkStack…" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <AppShell />
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wizard" element={<Wizard />} />
              <Route path="/decisions/:sessionId" element={<DecisionDetail />} />
              <Route path="/decisions/:sessionId/wizard" element={<Wizard />} />
              <Route path="/decisions/:sessionId/recommendations" element={<Recommendations />} />
              <Route path="/decisions/:sessionId/compare" element={<Compare />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/price-alerts" element={<PriceAlerts />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
