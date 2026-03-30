import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, UserRole } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, UserCheck, User, Loader2, Shield } from 'lucide-react'

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
      return '/admin/students'
    default:
      return '/profile'
  }
}

export default function Auth() {
  const { login, register, isAuthenticated, isLoading, profile } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [signupRole, setSignupRole] = useState<'student' | 'advisor' | 'mentor'>('student')
  const [loginRole, setLoginRole] = useState<UserRole>('student')
  const [isLogin, setIsLogin] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (emailError) {
      alert(emailError)
      return
    }

    if (isLogin) {
      if (!password.trim()) {
        alert('Please enter your password')
        return
      }
    } else {
      if (!name.trim()) {
        alert('Please enter your name')
        return
      }

      const passwordError = validatePassword(password)
      if (passwordError) {
        alert(passwordError)
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (isLogin) {
        const loggedInProfile = await login(email.trim(), password, loginRole)
        navigate(getDashboardPath(loggedInProfile?.role), { replace: true })
      } else {
        await register(email.trim(), password, name.trim(), signupRole)
        alert('Account created.\nPlease verify your email before logging in.')
        setIsLogin(true)
        setPassword('')
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loginRoles = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'advisor', label: 'Advisor', icon: UserCheck },
    { value: 'mentor', label: 'Mentor', icon: User },
    { value: 'admin', label: 'Admin', icon: Shield },
  ] as const

  const signupRoles = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'advisor', label: 'Advisor', icon: UserCheck },
    { value: 'mentor', label: 'Mentor', icon: User },
  ] as const

  const roles = isLogin ? loginRoles : signupRoles

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-xl">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Career Recommendation System</h1>
            <p className="text-muted-foreground">Guide your future with smart recommendations</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={isLogin ? 'default' : 'outline'}
              onClick={() => setIsLogin(true)}
              disabled={isSubmitting}
            >
              Login
            </Button>
            <Button
              type="button"
              variant={!isLogin ? 'default' : 'outline'}
              onClick={() => setIsLogin(false)}
              disabled={isSubmitting}
            >
              Sign Up
            </Button>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />

            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />

            {!isLogin && (
              <>
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-muted-foreground">
                  Password must be 8-15 characters and include uppercase, lowercase, number, and special character.
                </p>
              </>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">
              {isLogin ? 'Choose portal' : 'Choose account type'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const Icon = r.icon
                const selected = isLogin ? loginRole === r.value : signupRole === r.value

                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      if (isSubmitting) return

                      if (isLogin) {
                        setLoginRole(r.value as UserRole)
                      } else if (r.value !== 'admin') {
                        setSignupRole(r.value)
                      }
                    }}
                    className={`border rounded-lg p-4 text-left transition ${
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{r.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {!isLogin && (
              <p className="text-xs text-muted-foreground">
                Admin accounts are assigned only from Supabase.
              </p>
            )}
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLogin ? (
              'Login'
            ) : (
              'Create Account'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}