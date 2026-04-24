import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import Chat from './pages/Chat'
import Account from './pages/Account'
import Settings from './pages/Settings'

import StudentDashboard from './pages/student/StudentDashboard'
import Recommendations from './pages/student/Recommendations'
import Mentors from './pages/student/Mentors'
import SkillGapAnalysis from './pages/student/SkillGapAnalysis'

import AdvisorDashboard from './pages/advisor/AdvisorDashboard'
import MentorDashboard from './pages/mentor/MentorDashboard'

import ThemeToggle from './components/ThemeToggle'
import { CareerChatWidget } from './components/CareerChatWidget'

function getDashboardPath(role?: string) {
  switch (role) {
    case 'student':
      return '/student/dashboard'
    case 'advisor':
      return '/advisor/dashboard'
    case 'mentor':
      return '/mentor/dashboard'
    default:
      return '/profile'
  }
}

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-lg font-medium text-slate-600">Loading...</div>
    </div>
  )
}

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const { isAuthenticated, profile, isLoading } = useAuth()

  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (!profile) return <Navigate to="/auth" replace />
  if (profile.role === 'admin') return <Navigate to="/auth" replace />

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={getDashboardPath(profile.role)} replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, profile, isLoading } = useAuth()

  if (isLoading) return <FullPageLoader />

  const skipRedirect = sessionStorage.getItem('skip-auth-redirect') === '1'

  if (!skipRedirect && isAuthenticated && profile && profile.role !== 'admin') {
    return <Navigate to={getDashboardPath(profile.role)} replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeToggle />
        <Toaster richColors position="top-center" />

        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />

          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/recommendations"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Recommendations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/mentors"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Mentors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/skill-gap"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <SkillGapAnalysis />
              </ProtectedRoute>
            }
          />

          <Route
            path="/advisor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['advisor']}>
                <AdvisorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>

        <CareerChatWidget />
      </BrowserRouter>
    </AuthProvider>
  )
}