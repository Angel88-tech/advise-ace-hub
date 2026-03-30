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
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (currentUser: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', currentUser.id)
      .maybeSingle()

    if (error) throw error

    if (data) {
      setProfile(data as Profile)
      return data as Profile
    }

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: currentUser.id,
        name: currentUser.email?.split('@')[0] || 'User',
        role: 'student',
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
      .select()
      .single()

    if (insertError) throw insertError

    setProfile(newProfile as Profile)
    return newProfile as Profile
  }

  const refreshProfile = async () => {
    if (!user) return
    await fetchProfile(user)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    setProfile(data as Profile)
  }

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()

      setSession(data.session)
      setUser(data.session?.user ?? null)

      if (data.session?.user) {
        await fetchProfile(data.session.user)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)

      if (nextSession?.user) {
        await fetchProfile(nextSession.user)
      } else {
        setProfile(null)
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
        throw new Error('Incorrect email or password')
      }

      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please verify your email before logging in')
      }

      throw new Error(error.message)
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
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    })

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('This email is already registered')
      }

      if (error.message.toLowerCase().includes('password')) {
        throw new Error('Password does not meet security requirements')
      }

      throw new Error(error.message)
    }

    const userId = data.user?.id
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

    if (profileError) throw new Error(profileError.message)
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    setUser(null)
    setSession(null)
    setProfile(null)
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
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}