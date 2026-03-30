import { Link, Navigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboard() {
  const { profile } = useAuth()

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-center mb-10">
          Admin Dashboard
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/admin/students"
            className="bg-white border rounded-xl p-6 shadow hover:shadow-md transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Students</h2>
            <p className="text-gray-500">
              View, edit, and delete student accounts
            </p>
          </Link>

          <Link
            to="/admin/advisors"
            className="bg-white border rounded-xl p-6 shadow hover:shadow-md transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Advisors</h2>
            <p className="text-gray-500">
              Manage advisor accounts
            </p>
          </Link>

          <Link
            to="/admin/mentors"
            className="bg-white border rounded-xl p-6 shadow hover:shadow-md transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Mentors</h2>
            <p className="text-gray-500">
              Manage mentor accounts
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}