import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Camera, Loader2, Save, User, MapPin, Phone, Briefcase, Globe, Linkedin, LogOut } from 'lucide-react'

export default function Account() {
  const { user, profile, refreshProfile, logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    major: '',
    year: '',
    phone: '',
    location: '',
    linkedin_url: '',
    website_url: '',
  })

  useEffect(() => {
    setFormData({
      name: profile?.name || '',
      bio: profile?.bio || '',
      major: profile?.major || '',
      year: profile?.year?.toString() || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      linkedin_url: profile?.linkedin_url || '',
      website_url: profile?.website_url || '',
    })
  }, [profile])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setIsUploading(true)

    try {
      const ext = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const avatarUrl = `${publicUrl}?v=${Date.now()}`

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      await refreshProfile()
      toast.success('Avatar updated!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          bio: formData.bio,
          major: formData.major || null,
          year: formData.year ? parseInt(formData.year) : null,
          phone: formData.phone || null,
          location: formData.location || null,
          linkedin_url: formData.linkedin_url || null,
          website_url: formData.website_url || null,
        })
        .eq('user_id', user.id)

      if (error) throw error

      await refreshProfile()
      toast.success('Profile saved!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await logout()
      toast.success('Logged out successfully')
      window.location.href = '/auth'
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="font-display text-3xl font-bold">My Account</h1>

          <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            Logout
          </Button>
        </div>

        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Profile Photo</CardTitle>
            <CardDescription>Click the avatar to upload a new photo</CardDescription>
          </CardHeader>

          <CardContent className="flex items-center gap-6">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-primary-foreground" />
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <div>
              <p className="font-medium">{profile?.name || 'Your Name'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">{profile?.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="City, State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major" className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Major / Field
                </Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Links
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-1">
                <Linkedin className="h-3 w-3" />
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                value={formData.linkedin_url}
                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Website
              </Label>
              <Input
                id="website"
                value={formData.website_url}
                onChange={(e) => handleChange('website_url', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        <Button variant="gradient" className="w-full" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </main>
    </div>
  )
}