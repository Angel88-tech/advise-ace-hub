import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import AuthCallback from './pages/AuthCallback'

<Route path="/auth/callback" element={<AuthCallback />} />

import Landing from './pages/Landing'
import Auth from './pages/Auth'
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

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsersPage from './pages/admin/AdminUsersPage'

const queryClient = new QueryClient()

function getDashboardPath(role?: string) {
  switch (role) {
    case 'student':
      return '/student/dashboard'
    case 'advisor':
      return '/advisor/dashboard'
    case 'mentor':
      return '/mentor/dashboard'
    case 'admin':
      return '/admin/dashboard'
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

  if (isLoading) {
    return <FullPageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={getDashboardPath(profile.role)} replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, profile, isLoading } = useAuth()

  if (isLoading) {
    return <FullPageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(profile?.role)} replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
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

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersPage type="student" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/advisors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersPage type="advisor" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/mentors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersPage type="mentor" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}