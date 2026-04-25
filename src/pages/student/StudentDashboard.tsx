import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { 
  Target, 
  TrendingUp, 
  Users, 
  FileText, 
  ChevronRight,
  Sparkles,
  BookOpen,
  BarChart3
} from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();

  const quickActions = [
    { 
      title: 'Get Recommendations', 
      description: 'AI-powered career suggestions',
      icon: Sparkles,
      href: '/student/recommendations',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      title: 'Skill Gap Analysis', 
      description: 'Identify areas to improve',
      icon: BarChart3,
      href: '/student/skill-gap',
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    { 
      title: 'Find Mentors', 
      description: 'Connect with professionals',
      icon: Users,
      href: '/student/mentors',
      color: 'text-chart-3',
      bg: 'bg-chart-3/10'
    },
    { 
      title: 'Upload Transcript', 
      description: 'Enhance your profile',
      icon: FileText,
      href: '/student/transcript',
      color: 'text-chart-4',
      bg: 'bg-chart-4/10'
    },
  ];

  const recentSkills = [
    { name: 'Python', level: 75 },
    { name: 'Data Analysis', level: 60 },
    { name: 'Communication', level: 85 },
    { name: 'Problem Solving', level: 70 },
  ];

  const topCareers = [
    { title: 'Data Scientist', match: 92, trend: 'growing' },
    { title: 'Software Engineer', match: 87, trend: 'growing' },
    { title: 'Product Manager', match: 81, trend: 'stable' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, {profile?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Track your progress and discover new career opportunities.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card key={action.title} variant="interactive" asChild>
              <Link to={action.href}>
                <CardHeader className="pb-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bg}`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Completion */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Profile Completion</CardTitle>
              <CardDescription>Complete your profile for better recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  Add academic transcript
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  Complete skills assessment
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/profile">
                  Complete Profile
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Your Skills */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Your Skills</CardTitle>
                <CardDescription>Self-reported skill levels</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/skills">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSkills.map((skill) => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Career Matches */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Top Career Matches</CardTitle>
                <CardDescription>Based on your profile</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/recommendations">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCareers.map((career, index) => (
                <div 
                  key={career.title} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{career.title}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 text-accent" />
                        {career.trend}
                      </div>
                    </div>
                  </div>
                  <Badge variant="info">{career.match}% match</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card variant="elevated" className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p>Completed skills assessment</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                  <Target className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p>Received 3 new career recommendations</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-3/10">
                  <Users className="h-4 w-4 text-chart-3" />
                </div>
                <div className="flex-1">
                  <p>Sent mentorship request to Michael Chen</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
