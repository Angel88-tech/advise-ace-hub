import { Link, Navigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboard() {
  const { profile } = useAuth()

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/admin/students" className="border rounded-xl p-6 hover:bg-muted transition">
            <h2 className="text-2xl font-semibold mb-2">Students</h2>
            <p className="text-muted-foreground">Manage student accounts</p>
          </Link>

          <Link to="/admin/advisors" className="border rounded-xl p-6 hover:bg-muted transition">
            <h2 className="text-2xl font-semibold mb-2">Advisors</h2>
            <p className="text-muted-foreground">Manage advisor accounts</p>
          </Link>

          <Link to="/admin/mentors" className="border rounded-xl p-6 hover:bg-muted transition">
            <h2 className="text-2xl font-semibold mb-2">Mentors</h2>
            <p className="text-muted-foreground">Manage mentor accounts</p>
          </Link>
        </div>
      </div>
    </div>
  )
}