import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, UserCheck, User, Loader2 } from 'lucide-react'

export default function Auth() {
  const { login, register, loginWithMagicLink, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'student' | 'advisor' | 'mentor'>('student')
  const [isLogin, setIsLogin] = useState(true)
  const [cooldown, setCooldown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🔥 مهم: التقاط session من magic link
  useEffect(() => {
    const handleSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        navigate('/profile', { replace: true })
      }
    }

    handleSession()
  }, [])

  // 🔥 redirect بعد login
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/profile', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleSubmit = async () => {
    if (!email.trim()) {
      alert('Please enter your email')
      return
    }

    if (isLogin && !password.trim()) {
      alert('Please enter your password')
      return
    }

    if (!isLogin && !name.trim()) {
      alert('Please enter your name')
      return
    }

    setIsSubmitting(true)

    try {
      if (isLogin) {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), password, name.trim(), role)
        alert('Account created! Please login.')
        setIsLogin(true)
        setPassword('')
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email.trim()) {
      alert('Please enter your email first')
      return
    }

    if (cooldown) {
      alert('Please wait before requesting another link')
      return
    }

    setIsSubmitting(true)

    try {
      await loginWithMagicLink(email.trim())

      alert(
        'Magic link sent!\n\n⚠️ IMPORTANT:\nOpen the link on the SAME device and browser you requested it from.'
      )

      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)
    } catch (err: any) {
      alert(err.message || 'Failed to send magic link')
    } finally {
      setIsSubmitting(false)
    }
  }

  const roles = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'advisor', label: 'Advisor', icon: UserCheck },
    { value: 'mentor', label: 'Mentor', icon: User }
  ] as const

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/2 items-center justify-center p-10 text-white bg-gradient-to-br from-[#6688ecaa] via-[rgba(32,32,176,0.53)] to-orange-500">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-4xl font-extrabold">
            Career Recommendation System
          </h1>
          <p className="text-white/80">
            Guide your future with smart recommendations
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 pt-6">

            <div className="flex gap-2">
              <Button
                className="w-1/2"
                variant={isLogin ? 'default' : 'outline'}
                onClick={() => setIsLogin(true)}
                disabled={isSubmitting}
              >
                Login
              </Button>

              <Button
                className="w-1/2"
                variant={!isLogin ? 'default' : 'outline'}
                onClick={() => setIsLogin(false)}
                disabled={isSubmitting}
              >
                Sign Up
              </Button>
            </div>

            <Input
              placeholder="Email"
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
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />

                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => {
                    const Icon = r.icon

                    return (
                      <div
                        key={r.value}
                        onClick={() => !isSubmitting && setRole(r.value)}
                        className={`border p-3 rounded cursor-pointer text-center transition ${
                          role === r.value ? 'border-primary bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          <Icon size={20} />
                        </div>
                        <div>{r.label}</div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? 'Login' : 'Create Account'}
            </Button>

            <Button
              className="w-full"
              variant="secondary"
              onClick={handleMagicLink}
              disabled={cooldown || isSubmitting}
            >
              {cooldown ? 'Wait 30s...' : 'Magic Link'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              ⚠️ Magic link only works on the same device and browser you requested it from.
            </p>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}