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
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [confirmRecoveryPassword, setConfirmRecoveryPassword] = useState('')

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(getDashboardPath(profile?.role), { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, profile?.role])

  const validateEmail = (value: string) => {
    if (!value.trim()) return 'Please enter your email'
    if (!emailRegex.test(value.trim())) return 'Please enter a valid email address'
    return null
  }

  const validatePassword = (value: string) => {
    if (!value.trim()) return 'Please enter your password'
    if (!passwordRegex.test(value)) {
      return 'Password must be 8-15 characters and include uppercase, lowercase, number, and special character'
    }
    return null
  }

  const handleSubmit = async () => {
    const emailError = validateEmail(email)
    if (emailError) return alert(emailError)

    setIsSubmitting(true)

    try {
      if (isLogin) {
        const loggedInProfile = await login(email.trim(), password)
        navigate(getDashboardPath(loggedInProfile?.role), { replace: true })
      } else {
        await register(email.trim(), password, name.trim(), signupRole)
        alert('Account created. Please check your email.')
        setIsLogin(true)
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    const emailError = validateEmail(email)
    if (emailError) return alert(emailError)

    setIsSubmitting(true)

    try {
      await resetPasswordForEmail(email.trim())
      alert('Password reset link sent')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email.trim()) {
      alert('Please enter your email')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      })

      if (error) throw error

      alert('Verification email sent again')
    } catch (err: any) {
      alert(err.message || 'Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 p-6">

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>

          <button onClick={handleForgotPassword} className="text-sm text-blue-500">
            Forgot password?
          </button>

          <button onClick={handleResendVerification} className="text-sm text-blue-500">
            Resend verification email
          </button>

        </CardContent>
      </Card>
    </div>
  )
}

export default Auth