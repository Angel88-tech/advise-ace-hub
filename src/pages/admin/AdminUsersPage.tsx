import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

type ManagedRole = 'student' | 'advisor' | 'mentor'

type AdminUsersPageProps = {
  type: ManagedRole
}

interface UserRow {
  id: string
  user_id: string
  name: string
  email: string
  role: 'student' | 'advisor' | 'mentor' | 'admin'
}

export default function AdminUsersPage({ type }: AdminUsersPageProps) {
  const { profile } = useAuth()
  const [users, setUsers] = useState<UserRow[]>([])
  const [selected, setSelected] = useState<UserRow | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<ManagedRole>(type)
  const [loading, setLoading] = useState(true)

  const titleMap: Record<ManagedRole, string> = {
    student: 'Student controller',
    advisor: 'Advisor controller',
    mentor: 'Mentor controller',
  }

  const fetchUsers = async () => {
    setLoading(true)

    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('role', type)
      .order('created_at', { ascending: true })

    if (error) {
      alert(error.message)
    } else {
      const formattedUsers: UserRow[] = ((data || []) as any[]).map((user) => ({
        id: user.id ?? '',
        user_id: user.user_id ?? '',
        name: user.name ?? '',
        email: user.email ?? '',
        role: (user.role ?? type) as UserRow['role'],
      }))

      setUsers(formattedUsers)
    }

    setLoading(false)
  }

  useEffect(() => {
    void fetchUsers()
  }, [type])

  const selectUser = (user: UserRow) => {
    setSelected(user)
    setName(user.name || '')
    setEmail(user.email || '')
    setRole((user.role === 'admin' ? type : user.role) as ManagedRole)
  }

  const clearForm = () => {
    setSelected(null)
    setName('')
    setEmail('')
    setRole(type)
  }

  const handleUpdate = async () => {
    if (!selected) {
      alert('Choose a user first')
      return
    }

    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        name,
        email,
        role,
      })
      .eq('user_id', selected.user_id)

    if (error) {
      alert(error.message)
      return
    }

    alert('User updated')
    clearForm()
    void fetchUsers()
  }

  const handleDelete = async () => {
    if (!selected) {
      alert('Choose a user first')
      return
    }

    const ok = window.confirm('Delete this user from profiles?')
    if (!ok) return

    const { error } = await (supabase as any)
      .from('profiles')
      .delete()
      .eq('user_id', selected.user_id)

    if (error) {
      alert(error.message)
      return
    }

    alert('User deleted from profiles')
    clearForm()
    void fetchUsers()
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center gap-4 mb-10">
          <Link
            to="/admin/students"
            className={`px-5 py-2 rounded-md border ${
              type === 'student' ? 'bg-slate-700 text-white' : 'bg-white'
            }`}
          >
            Students
          </Link>
          <Link
            to="/admin/advisors"
            className={`px-5 py-2 rounded-md border ${
              type === 'advisor' ? 'bg-slate-700 text-white' : 'bg-white'
            }`}
          >
            Advisors
          </Link>
          <Link
            to="/admin/mentors"
            className={`px-5 py-2 rounded-md border ${
              type === 'mentor' ? 'bg-slate-700 text-white' : 'bg-white'
            }`}
          >
            Mentors
          </Link>
        </div>

        <h1 className="text-5xl font-bold text-center mb-10">{titleMap[type]}</h1>

        <div className="bg-white border rounded-sm p-6 shadow-sm">
          <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-8 items-start">
            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b font-semibold">
                    <th className="text-left py-3 px-2">ID</th>
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">User ID</th>
                    <th className="text-left py-3 px-2">User Type</th>
                    <th className="text-left py-3 px-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-2 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-2 text-center">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr
                        key={user.id}
                        onClick={() => selectUser(user)}
                        className={`border-b cursor-pointer hover:bg-gray-50 ${
                          selected?.id === user.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <td className="py-3 px-2">{index + 1}</td>
                        <td className="py-3 px-2">{user.name}</td>
                        <td className="py-3 px-2 break-all">{user.user_id}</td>
                        <td className="py-3 px-2 capitalize">{user.role}</td>
                        <td className="py-3 px-2 break-all">{user.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <input
                className="w-full border rounded-md px-4 py-3 outline-none"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full border rounded-md px-4 py-3 outline-none"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="w-full border rounded-md px-4 py-3 outline-none bg-gray-50"
                placeholder="User ID"
                value={selected?.user_id || ''}
                readOnly
              />

              <select
                className="w-full border rounded-md px-4 py-3 outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value as ManagedRole)}
              >
                <option value="student">Student</option>
                <option value="advisor">Advisor</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <button
              type="button"
              onClick={handleUpdate}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-md"
            >
              Update user
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-md"
            >
              Delete user
            </button>

            <button
              type="button"
              onClick={clearForm}
              className="w-full bg-slate-500 hover:bg-slate-600 text-white py-3 rounded-md"
            >
              Clear selection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}