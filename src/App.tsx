import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Account from "./pages/Account";
import Settings from "./pages/Settings";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import Recommendations from "./pages/student/Recommendations";
import Mentors from "./pages/student/Mentors";
import SkillGapAnalysis from "./pages/student/SkillGapAnalysis";

// Advisor Pages
import AdvisorDashboard from "./pages/advisor/AdvisorDashboard";

// Mentor Pages
import MentorDashboard from "./pages/mentor/MentorDashboard";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated && profile) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/chat" element={<Chat />} />

      {/* Auth (prevent logged-in users from accessing) */}
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

      {/* Protected Routes (any role) */}
      <Route path="/profile" element={<ProtectedRoute><Account /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>}
      />
      <Route
        path="/student/recommendations"
        element={<ProtectedRoute allowedRoles={['student']}><Recommendations /></ProtectedRoute>}
      />
      <Route
        path="/student/mentors"
        element={<ProtectedRoute allowedRoles={['student']}><Mentors /></ProtectedRoute>}
      />
      <Route
        path="/student/skills"
        element={<ProtectedRoute allowedRoles={['student']}><SkillGapAnalysis /></ProtectedRoute>}
      />

      {/* Advisor Routes */}
      <Route
        path="/advisor/dashboard"
        element={<ProtectedRoute allowedRoles={['advisor']}><AdvisorDashboard /></ProtectedRoute>}
      />

      {/* Mentor Routes */}
      <Route
        path="/mentor/dashboard"
        element={<ProtectedRoute allowedRoles={['mentor']}><MentorDashboard /></ProtectedRoute>}
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
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
);

export default App;