import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error('exchangeCodeForSession error:', error)
            navigate('/auth', { replace: true })
            return
          }
        }

        navigate('/auth', { replace: true })
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/auth', { replace: true })
      }
    }

    handleAuthCallback()
  }, [navigate])

  return <div className="min-h-screen flex items-center justify-center">Loading...</div>
}

export default AuthCallback