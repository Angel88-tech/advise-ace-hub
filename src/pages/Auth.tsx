import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, UserRole } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, UserCheck, User, Loader2, Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

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
    document.title = 'CareerPath'
  }, [])

  useEffect(() => {
    const clearAuthStorage = () => {
      Object.keys(localStorage).forEach((key) => {
        if (key.toLowerCase().includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      sessionStorage.clear()
    }

    const hash = window.location.hash.toLowerCase()
    const search = window.location.search.toLowerCase()
    const isRecoveryLink = hash.includes('type=recovery') || search.includes('type=recovery')

    if (!isRecoveryLink) {
      clearAuthStorage()
    }

    if (isRecoveryLink) {
      setIsRecoveryMode(true)
      setIsLogin(false)
    }
  }, [])

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
      toast.error(emailError)
      return
    }

    if (isLogin) {
      if (!password.trim()) {
        toast.error('Please enter your password')
        return
      }
    } else {
      if (!name.trim()) {
        toast.error('Please enter your name')
        return
      }

      const passwordError = validatePassword(password)
      if (passwordError) {
        toast.error(passwordError)
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (isLogin) {
        const loggedInProfile = await login(email.trim(), password)
        toast.success('Welcome back to CareerPath')
        navigate(getDashboardPath(loggedInProfile?.role), { replace: true })
      } else {
        await register(email.trim(), password, name.trim(), signupRole)
        toast.success('Account created successfully. Please check your email to verify your account before logging in.')
        setIsLogin(true)
        setPassword('')
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    const emailError = validateEmail(email)
    if (emailError) {
      toast.error(emailError)
      return
    }

    setIsSubmitting(true)

    try {
      await resetPasswordForEmail(email.trim())
      toast.success('Password reset link has been sent to your email.')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendVerification = async () => {
    const emailError = validateEmail(email)
    if (emailError) {
      toast.error(emailError)
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast.success('Verification email has been sent again.')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecoverySubmit = async () => {
    const passwordError = validatePassword(recoveryPassword)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    if (recoveryPassword !== confirmRecoveryPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      await updatePassword(recoveryPassword)
      await supabase.auth.signOut()

      Object.keys(localStorage).forEach((key) => {
        if (key.toLowerCase().includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      sessionStorage.clear()

      toast.success('Password updated successfully. Please log in.')
      setIsRecoveryMode(false)
      setIsLogin(true)
      setRecoveryPassword('')
      setConfirmRecoveryPassword('')
      setPassword('')
      window.history.replaceState({}, document.title, '/auth')
      navigate('/auth', { replace: true })
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const signupRoles = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'advisor', label: 'Advisor', icon: UserCheck },
    { value: 'mentor', label: 'Mentor', icon: User },
    { value: 'admin', label: 'Admin', icon: Shield },
  ] as const

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">CareerPath</h1>
              <p className="text-sm text-muted-foreground">
                Guide your future with smart recommendations
              </p>
            </div>

            {!isRecoveryMode && (
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
            )}

            <div className="space-y-4">
              {!isRecoveryMode && (
                <>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isSubmitting}
                        className="text-sm text-primary hover:underline text-left"
                      >
                        Forgot your password?
                      </button>

                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isSubmitting}
                        className="text-sm text-primary hover:underline text-left"
                      >
                        Resend verification email
                      </button>
                    </div>
                  )}

                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="Full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Password must be 8-15 characters and include uppercase, lowercase, number, and special character.
                      </p>

                      <div className="space-y-3">
                        <p className="text-sm font-medium">Choose account type</p>

                        <div className="grid grid-cols-2 gap-3">
                          {signupRoles.map((r) => {
                            const Icon = r.icon
                            const selected = signupRole === r.value

                            return (
                              <button
                                key={r.value}
                                type="button"
                                onClick={() => {
                                  if (isSubmitting) return
                                  setSignupRole(r.value as UserRole)
                                }}
                                className={`border rounded-lg p-4 text-left transition ${
                                  selected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span className="font-medium">{r.label}</span>
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Admin account creation is allowed only for emails added in Supabase admin_allowlist.
                        </p>
                      </div>
                    </>
                  )}

                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isLogin ? (
                      'Login'
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </>
              )}

              {isRecoveryMode && (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-semibold">Set a new password</h2>
                    <p className="text-sm text-muted-foreground">
                      Enter your new password below
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showRecoveryPassword ? 'text' : 'password'}
                        placeholder="New password"
                        value={recoveryPassword}
                        onChange={(e) => setRecoveryPassword(e.target.value)}
                        disabled={isSubmitting}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRecoveryPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        disabled={isSubmitting}
                      >
                        {showRecoveryPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      type={showRecoveryPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmRecoveryPassword}
                      onChange={(e) => setConfirmRecoveryPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Password must be 8-15 characters and include uppercase, lowercase, number, and special character.
                  </p>

                  <Button
                    type="button"
                    onClick={handleRecoverySubmit}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Auth