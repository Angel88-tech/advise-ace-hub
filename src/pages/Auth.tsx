import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, UserRole } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, UserCheck, User, Loader2, Shield, Eye, EyeOff } from 'lucide-react'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,15}$/

const getDashboardPath = (role?: UserRole) => {
  switch (role) {
    case 'student': return '/student/dashboard'
    case 'advisor': return '/advisor/dashboard'
    case 'mentor': return '/mentor/dashboard'
    case 'admin': return '/admin/dashboard'
    default: return '/profile'
  }
}

function Auth() {
  const {
    login,
    register,
    isAuthenticated,
    isLoading,
    profile,
    resetPasswordForEmail,
    updatePassword,
  } = useAuth()

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [signupRole, setSignupRole] = useState<UserRole>('student')
  const [isLogin, setIsLogin] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [confirmRecoveryPassword, setConfirmRecoveryPassword] = useState('')

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(getDashboardPath(profile?.role), { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, profile?.role])

  const handleSubmit = async () => {
    if (!email) return alert('Enter email')

    setIsSubmitting(true)

    try {
      if (isLogin) {
        const res = await login(email, password)
        navigate(getDashboardPath(res?.role))
      } else {
        await register(email, password, name, signupRole)
        alert('Check your email to verify')
        setIsLogin(true)
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) return alert('Enter email')

    try {
      await resetPasswordForEmail(email)
      alert('Reset email sent')
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleResendVerification = async () => {
    if (!email) return alert('Enter email')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      })

      if (error) throw error

      alert('Verification email sent again')
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <Card className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl">
          <CardContent className="p-6 space-y-5">

            <h1 className="text-2xl font-bold text-gray-800 text-center">
              Welcome
            </h1>

            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {!isLogin && (
              <Input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border-gray-300"
              />
            )}

            <Button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isSubmitting}
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>

            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <button onClick={handleForgotPassword} className="hover:underline">
                Forgot password?
              </button>

              <button onClick={handleResendVerification} className="hover:underline">
                Resend verification email
              </button>

              <button onClick={() => setIsLogin(!isLogin)} className="hover:underline">
                {isLogin ? 'Create account' : 'Already have account'}
              </button>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default Auth