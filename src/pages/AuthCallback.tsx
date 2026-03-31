import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
      }

      navigate('/')
    }

    handleAuth()
  }, [navigate])

  return <div>Loading...</div>
}