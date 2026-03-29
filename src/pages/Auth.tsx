import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, UserCheck, User } from 'lucide-react'

export default function Auth() {
  const { login, register, loginWithMagicLink, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'student' | 'advisor' | 'mentor'>('student')
  const [isLogin, setIsLogin] = useState(true)
  const [cooldown, setCooldown] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile')
    }
  }, [isAuthenticated])

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, name, role)
        alert('Account created! Please login.')
        setIsLogin(true)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleMagicLink = async () => {
    if (cooldown) {
      alert('Please wait before requesting another link')
      return
    }

    try {
      await loginWithMagicLink(email)

      alert(
        'Magic link sent!\n\n⚠️ IMPORTANT:\nOpen the link on the SAME device you requested it from.'
      )

      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const roles = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'advisor', label: 'Advisor', icon: UserCheck },
    { value: 'mentor', label: 'Mentor', icon: User }
  ] as const

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

      <div className="w-full md:w-1/2 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 pt-6">

            <div className="flex gap-2">
              <Button className="w-1/2" onClick={() => setIsLogin(true)}>
                Login
              </Button>
              <Button className="w-1/2" onClick={() => setIsLogin(false)}>
                Sign Up
              </Button>
            </div>

            <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />

            {!isLogin && (
              <>
                <Input placeholder="Name" onChange={(e) => setName(e.target.value)} />

                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => {
                    const Icon = r.icon
                    return (
                      <div key={r.value} onClick={() => setRole(r.value)} className="border p-3 rounded cursor-pointer text-center">
                        <Icon size={20} />
                        <div>{r.label}</div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <Button className="w-full" onClick={handleSubmit}>
              {isLogin ? 'Login' : 'Create Account'}
            </Button>

            <Button
              className="w-full"
              onClick={handleMagicLink}
              disabled={cooldown}
            >
              {cooldown ? 'Wait 30s...' : 'Magic Link'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              ⚠️ Magic link only works on the same device you requested it from.
            </p>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}