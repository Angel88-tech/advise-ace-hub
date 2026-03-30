import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

export type UserRole = 'student' | 'advisor' | 'mentor' | 'admin'

export interface Profile {
  id: string
  user_id: string
  name: string
  email?: string
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
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<Profile | null>
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<Profile | undefined>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  updateEmail: (newEmail: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  resetPasswordForEmail: (email: string) => Promise<void>
  verifyEmailOtp: (email: string, token: string) => Promise<void>
  resendSignupOtp: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getProfilesTable = () => (supabase as any).from('profiles')
  const getAdminAllowlistTable = () => (supabase as any).from('admin_allowlist')

  const normalizeProfile = (data: any, currentUser?: User): Profile => ({
    id: data?.id ?? '',
    user_id: data?.user_id ?? currentUser?.id ?? '',
    name: data?.name ?? '',
    email: data?.email ?? currentUser?.email ?? '',
    role: (data?.role ?? 'student') as UserRole,
    avatar_url: data?.avatar_url ?? null,
    bio: data?.bio ?? '',
    major: data?.major ?? null,
    year: data?.year ?? null,
    phone: data?.phone ?? null,
    location: data?.location ?? null,
    linkedin_url: data?.linkedin_url ?? null,
    website_url: data?.website_url ?? null,
    language: data?.language ?? 'en',
    theme: data?.theme ?? 'light',
    privacy_profile_public: data?.privacy_profile_public ?? true,
    privacy_show_email: data?.privacy_show_email ?? false,
    accessibility_font_size: data?.accessibility_font_size ?? 'medium',
    accessibility_reduce_motion: data?.accessibility_reduce_motion ?? false,
    accessibility_high_contrast: data?.accessibility_high_contrast ?? false,
    created_at: data?.created_at ?? '',
    updated_at: data?.updated_at ?? '',
  })

  const fetchProfile = async (currentUser: User) => {
    const { data, error } = await getProfilesTable()
      .select('*')
      .eq('user_id', currentUser.id)
      .maybeSingle()

    if (error) throw error

    if (data) {
      const normalized = normalizeProfile(data, currentUser)
      setProfile(normalized)
      return normalized
    }

    const payload = {
      user_id: currentUser.id,
      name: currentUser.email?.split('@')[0] || 'User',
      email: currentUser.email ?? '',
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
    }

    const { data: newProfile, error: insertError } = await getProfilesTable()
      .insert(payload)
      .select('*')
      .single()

    if (insertError) throw insertError

    const normalized = normalizeProfile(newProfile, currentUser)
    setProfile(normalized)
    return normalized
  }

  const refreshProfile = async () => {
    if (!user) return
    return await fetchProfile(user)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    const { data, error } = await getProfilesTable()
      .update(updates)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) throw error

    setProfile(normalizeProfile(data, user))
  }

  const updateEmail = async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (error) throw error

    if (user) {
      await getProfilesTable()
        .update({ email: newEmail })
        .eq('user_id', user.id)

      await refreshProfile()
    }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  }

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    })

    if (error) throw error
  }

  const verifyEmailOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'signup',
    })

    if (error) throw error
  }

  const resendSignupOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    })

    if (error) throw error
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

  const login = async (email: string, password: string, expectedRole?: UserRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({
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

    const currentUser = data.user
    if (!currentUser) return null

    const currentProfile = await fetchProfile(currentUser)

    if (expectedRole === 'admin') {
      const { data: allowlistData, error: allowlistError } = await getAdminAllowlistTable()
        .select('email')
        .eq('email', email.trim())
        .maybeSingle()

      if (allowlistError) {
        await supabase.auth.signOut()
        throw new Error(allowlistError.message)
      }

      if (!allowlistData || currentProfile?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('You are not allowed to access admin panel')
      }

      return currentProfile
    }

    if (expectedRole && currentProfile?.role !== expectedRole) {
      await supabase.auth.signOut()
      throw new Error(`This account is not allowed to enter the ${expectedRole} portal`)
    }

    return currentProfile
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    if (role === 'admin') {
      const { data: allowlistData, error: allowlistError } = await getAdminAllowlistTable()
        .select('email')
        .eq('email', email.trim())
        .maybeSingle()

      if (allowlistError) {
        throw new Error(allowlistError.message)
      }

      if (!allowlistData) {
        throw new Error('This email is not allowed to create an admin account')
      }
    }

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

    const payload = {
      user_id: userId,
      name,
      email,
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
    }

    const { error: profileError } = await getProfilesTable().insert(payload)

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
        updateEmail,
        updatePassword,
        resetPasswordForEmail,
        verifyEmailOtp,
        resendSignupOtp,
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