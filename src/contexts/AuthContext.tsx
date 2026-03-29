import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

export type UserRole = 'student' | 'advisor' | 'mentor'

export interface Profile {
  id: string
  user_id: string
  name: string
  role: UserRole
  avatar_url: string | null
  bio: string
  major: string | null
  year: number | null
  phone: string | null
  location: string | null
  linkedin_url: string | null
  website_url: string | null
  language: string
  theme: string
  privacy_profile_public: boolean
  privacy_show_email: boolean
  accessibility_font_size: string
  accessibility_reduce_motion: boolean
  accessibility_high_contrast: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  loginWithMagicLink: (email: string) => Promise<void>

  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (data) setProfile(data as Profile)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      }
    )

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Wrong email or password')
      }
      throw error
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/auth'
      }
    })

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('This email already has an account. Please login.')
      }
      throw error
    }

    const userId = data.user?.id

    // إذا فيه تأكيد إيميل → ما نكمل
    if (!userId) return

    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: userId,
      name,
      role,
      bio: '',
      avatar_url: null,
      major: null,
      year: null,
      phone: null,
      location: null,
      linkedin_url: null,
      website_url: null,
      language: 'en',
      theme: 'light',
      privacy_profile_public: true,
      privacy_show_email: false,
      accessibility_font_size: 'medium',
      accessibility_reduce_motion: false,
      accessibility_high_contrast: false,
    })

    if (profileError) throw profileError
  }

  const loginWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/auth'
      }
    })

    if (error) throw error
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAuthenticated: !!session,
        login,
        register,
        loginWithMagicLink,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}