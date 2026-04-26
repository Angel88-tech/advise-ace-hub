import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  BarChart3,
  Users,
  FileText,
  MessageSquare,
  Loader2,
  Trash2,
  Eye,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

type MyMentor = {
  request_id: string
  mentor_id: string
  full_name: string | null
  job_title: string | null
  company: string | null
  specialization: string | null
  bio: string | null
  experience_years: number | null
  department: string | null
}

type StudentProfile = {
  user_id: string
  name: string | null
  full_name?: string | null
  major: string | null
  bio: string | null
  phone: string | null
  location: string | null
  linkedin_url: string | null
  website_url: string | null
}

type CareerMatch = {
  id: string
  occupation_id: string
  match_score: number
  title: string
  description: string | null
}

export default function StudentDashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [careerMatches, setCareerMatches] = useState<CareerMatch[]>([])
  const [myMentors, setMyMentors] = useState<MyMentor[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<MyMentor | null>(null)

  useEffect(() => {
    loadData()
  }, [user?.id])

  const loadCareerMatches = async () => {
    if (!user?.id) return []

    const { data: savedRecommendations } = await (supabase as any)
      .from('recommendations')
      .select('id, occupation_id, match_score')
      .eq('user_id', user.id)
      .order('match_score', { ascending: false })
      .limit(5)

    const rows = savedRecommendations || []
    const occupationIds = rows.map((item: any) => item.occupation_id)

    if (occupationIds.length === 0) return []

    const { data: occupations } = await (supabase as any)
      .from('occupations')
      .select('id, title, description')
      .in('id', occupationIds)

    return rows.map((item: any) => {
      const occupation = occupations?.find((occ: any) => occ.id === item.occupation_id)

      return {
        id: item.id,
        occupation_id: item.occupation_id,
        match_score: item.match_score || 0,
        title: occupation?.title || 'Career',
        description: occupation?.description || null,
      }
    })
  }

  const loadData = async () => {
    if (!user?.id) return

    setLoading(true)

    const { data: profileData } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const matches = await loadCareerMatches()

    const { data: requests } = await (supabase as any)
      .from('connection_requests')
      .select('id, professional_id')
      .eq('student_id', user.id)
      .eq('professional_role', 'mentor')
      .eq('status', 'accepted')

    const mentorIds = (requests || []).map((r: any) => r.professional_id)

    let mentorsData: any[] = []

    if (mentorIds.length > 0) {
      const { data } = await (supabase as any)
        .from('professional_profiles')
        .select('user_id, full_name, job_title, company, specialization, bio, experience_years, department')
        .in('user_id', mentorIds)

      mentorsData = data || []
    }

    const mergedMentors = (requests || []).map((req: any) => {
      const mentor = mentorsData.find((m: any) => m.user_id === req.professional_id)

      return {
        request_id: req.id,
        mentor_id: req.professional_id,
        full_name: mentor?.full_name || 'Mentor',
        job_title: mentor?.job_title || 'Mentor',
        company: mentor?.company || null,
        specialization: mentor?.specialization || null,
        bio: mentor?.bio || null,
        experience_years: mentor?.experience_years || null,
        department: mentor?.department || null,
      }
    })

    setStudentProfile(profileData || null)
    setCareerMatches(matches)
    setMyMentors(mergedMentors)
    setLoading(false)
  }

  const removeMentor = async (mentor: MyMentor) => {
    setRemovingId(mentor.mentor_id)

    await (supabase as any)
      .from('connection_requests')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', mentor.request_id)

    setRemovingId(null)
    await loadData()
  }

  const displayName =
    studentProfile?.name ||
    studentProfile?.full_name ||
    profile?.name ||
    user?.email?.split('@')[0] ||
    'Student'

  const profileItems = [
    { label: 'Full name', value: studentProfile?.name || studentProfile?.full_name },
    { label: 'Major', value: studentProfile?.major },
    { label: 'Bio', value: studentProfile?.bio },
    { label: 'Phone number', value: studentProfile?.phone },
    { label: 'Location', value: studentProfile?.location },
    { label: 'LinkedIn URL', value: studentProfile?.linkedin_url },
    { label: 'Website URL', value: studentProfile?.website_url },
  ]

  const missingItems = profileItems.filter((item) => !item.value || String(item.value).trim() === '')
  const completedItems = profileItems.length - missingItems.length
  const profileProgress = Math.round((completedItems / profileItems.length) * 100)

  const quickActions = [
    {
      title: 'Get Recommendations',
      description: 'AI-powered career suggestions',
      icon: Sparkles,
      href: '/student/recommendations',
    },
    {
      title: 'Skill Gap Analysis',
      description: 'Identify areas to improve',
      icon: BarChart3,
      href: '/student/skill-gap',
    },
    {
      title: 'Find Mentors',
      description: 'Connect with professionals',
      icon: Users,
      href: '/student/mentors',
    },
    {
      title: 'Upload Transcript',
      description: 'Enhance your profile',
      icon: FileText,
      href: '/student/transcript',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, {displayName.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Track your profile, mentors, and saved recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card key={action.title} variant="interactive" asChild>
              <Link to={action.href}>
                <CardHeader className="pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>

                <CardContent>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Mentors</CardTitle>
              <CardDescription>Mentors who accepted your request</CardDescription>
            </div>

            <Button variant="ghost" asChild>
              <Link to="/student/mentors">Find More</Link>
            </Button>
          </CardHeader>

          <CardContent>
            {myMentors.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No mentors yet
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myMentors.map((mentor) => (
                  <div
                    key={mentor.request_id}
                    className="rounded-lg border p-4 flex justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-semibold">{mentor.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {mentor.job_title}
                        {mentor.company ? ` • ${mentor.company}` : ''}
                      </p>

                      {mentor.specialization && (
                        <Badge variant="outline" className="mt-2">
                          {mentor.specialization}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedMentor(mentor)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>

                      <Button size="sm" onClick={() => navigate('/mentor-chat')}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeMentor(mentor)}
                        disabled={removingId === mentor.mentor_id}
                      >
                        {removingId === mentor.mentor_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedMentor && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{selectedMentor.full_name}</CardTitle>
              <CardDescription>
                {selectedMentor.job_title}
                {selectedMentor.company ? ` at ${selectedMentor.company}` : ''}
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMentor.company || 'Not added'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Department</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMentor.department || 'Not added'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Specialization</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMentor.specialization || 'Not added'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Experience</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMentor.experience_years
                    ? `${selectedMentor.experience_years} years`
                    : 'Not added'}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-medium">Bio</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMentor.bio || 'No bio added'}
                </p>
              </div>

              <div className="md:col-span-2">
                <Button variant="outline" onClick={() => setSelectedMentor(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>Based on the profile fields you added</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{profileProgress}%</span>
                </div>

                <Progress value={profileProgress} className="h-2" />
              </div>

              <div className="space-y-2 text-sm">
                {missingItems.length === 0 ? (
                  <div className="rounded-lg border bg-muted/30 p-3 text-muted-foreground">
                    Your profile is complete.
                  </div>
                ) : (
                  missingItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      <span>Add {item.label}</span>
                    </div>
                  ))
                )}
              </div>

              <Button className="w-full" variant="outline" asChild>
                <Link to="/profile">
                  Complete Profile
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Career Matches</CardTitle>
                <CardDescription>From your saved recommendations</CardDescription>
              </div>

              <Button variant="ghost" asChild>
                <Link to="/student/recommendations">View All</Link>
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {careerMatches.length === 0 ? (
                <div className="rounded-lg border bg-muted/30 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No saved recommendations yet.
                  </p>

                  <Button className="mt-4" variant="outline" asChild>
                    <Link to="/student/recommendations">
                      Generate and Save Recommendations
                    </Link>
                  </Button>
                </div>
              ) : (
                careerMatches.map((career, index) => (
                  <div
                    key={career.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                        {index + 1}
                      </div>

                      <div>
                        <div className="font-medium text-sm">{career.title}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          Saved recommendation
                        </div>
                      </div>
                    </div>

                    <Badge>{career.match_score}% match</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}