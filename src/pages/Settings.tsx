import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Loader2,
  Globe,
  Lock,
  Eye,
  Accessibility,
  KeyRound,
  Mail,
  User,
} from 'lucide-react';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(15, 'Password must be at most 15 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain special character');

export default function Settings() {
  const { user, profile, updatePassword, updateEmail, refreshProfile } = useAuth();

  // Name
  const [newName, setNewName] = useState(profile?.name || '');
  const [savingName, setSavingName] = useState(false);

  // Email
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Preferences
  const [language, setLanguage] = useState(profile?.language || 'en');
  const [profilePublic, setProfilePublic] = useState(profile?.privacy_profile_public ?? true);
  const [showEmail, setShowEmail] = useState(profile?.privacy_show_email ?? false);
  const [fontSize, setFontSize] = useState(profile?.accessibility_font_size || 'medium');
  const [reduceMotion, setReduceMotion] = useState(profile?.accessibility_reduce_motion ?? false);
  const [highContrast, setHighContrast] = useState(profile?.accessibility_high_contrast ?? false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const handleChangeName = async () => {
    if (!user || !newName.trim()) return;
    setSavingName(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: newName.trim() })
        .eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Name updated!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    try {
      await updateEmail(newEmail.trim());
      toast.success('Verification email sent to your new address. Please confirm it.');
      setNewEmail('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update email');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    setSavingPassword(true);
    try {
      await updatePassword(newPassword);
      toast.success('Password updated!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setSavingPrefs(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          language,
          privacy_profile_public: profilePublic,
          privacy_show_email: showEmail,
          accessibility_font_size: fontSize,
          accessibility_reduce_motion: reduceMotion,
          accessibility_high_contrast: highContrast,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Preferences saved!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>

        {/* Change Name */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Display Name
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Your name" className="flex-1" />
              <Button onClick={handleChangeName} disabled={savingName}>
                {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Email */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Email Address
            </CardTitle>
            <CardDescription>Current: {user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@email.com"
                type="email"
                className="flex-1"
              />
              <Button onClick={handleChangeEmail} disabled={savingEmail}>
                {savingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                placeholder="••••••••"
              />
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            <p className="text-xs text-muted-foreground">8-15 characters, uppercase, lowercase, number, and special character</p>
            <Button onClick={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
            </Button>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Language */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Public Profile</p>
                <p className="text-xs text-muted-foreground">Allow others to see your profile</p>
              </div>
              <Switch checked={profilePublic} onCheckedChange={setProfilePublic} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Show Email</p>
                <p className="text-xs text-muted-foreground">Display email on your profile</p>
              </div>
              <Switch checked={showEmail} onCheckedChange={setShowEmail} />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-primary" /> Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Font Size</p>
                <p className="text-xs text-muted-foreground">Adjust text size across the app</p>
              </div>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Reduce Motion</p>
                <p className="text-xs text-muted-foreground">Minimize animations</p>
              </div>
              <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">High Contrast</p>
                <p className="text-xs text-muted-foreground">Increase contrast for better visibility</p>
              </div>
              <Switch checked={highContrast} onCheckedChange={setHighContrast} />
            </div>
          </CardContent>
        </Card>

        <Button variant="gradient" className="w-full" onClick={handleSavePreferences} disabled={savingPrefs}>
          {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
          Save Preferences
        </Button>
      </main>
    </div>
  );
}
