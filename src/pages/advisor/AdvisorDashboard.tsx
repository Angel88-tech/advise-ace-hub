import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Eye,
  Clock
} from 'lucide-react';

const assignedStudents = [
  {
    id: '1',
    name: 'Alex Johnson',
    major: 'Computer Science',
    year: 3,
    lastActivity: '2 hours ago',
    profileCompletion: 85,
    topCareerMatch: 'Data Scientist',
    matchScore: 92,
  },
  {
    id: '2',
    name: 'Emma Wilson',
    major: 'Business Administration',
    year: 4,
    lastActivity: '1 day ago',
    profileCompletion: 72,
    topCareerMatch: 'Product Manager',
    matchScore: 87,
  },
  {
    id: '3',
    name: 'Ryan Kim',
    major: 'Information Systems',
    year: 2,
    lastActivity: '3 days ago',
    profileCompletion: 45,
    topCareerMatch: 'Software Engineer',
    matchScore: 78,
  },
];

const recentReports = [
  { id: '1', studentName: 'Alex Johnson', date: '2024-01-15', type: 'Career Planning' },
  { id: '2', studentName: 'Emma Wilson', date: '2024-01-12', type: 'Skill Assessment' },
  { id: '3', studentName: 'Ryan Kim', date: '2024-01-10', type: 'Initial Consultation' },
];

export default function AdvisorDashboard() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome, {profile?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your students and guide their career journeys
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{assignedStudents.length}</div>
                  <div className="text-sm text-muted-foreground">Assigned Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Reports Generated</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10">
                  <TrendingUp className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-sm text-muted-foreground">Avg. Profile Completion</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/10">
                  <Calendar className="h-6 w-6 text-chart-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm text-muted-foreground">Upcoming Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned Students */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Assigned Students</CardTitle>
                  <CardDescription>Students under your guidance</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignedStudents.map((student) => (
                  <div 
                    key={student.id} 
                    className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{student.name}</h4>
                        <Badge variant="secondary" className="shrink-0">Year {student.year}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{student.major}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {student.lastActivity}
                        </div>
                        <div className="flex-1 max-w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Profile</span>
                            <span>{student.profileCompletion}%</span>
                          </div>
                          <Progress value={student.profileCompletion} className="h-1" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-primary">{student.matchScore}%</div>
                      <div className="text-xs text-muted-foreground">{student.topCareerMatch}</div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div className="lg:col-span-1">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Counseling reports generated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentReports.map((report) => (
                  <div 
                    key={report.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{report.studentName}</div>
                      <div className="text-xs text-muted-foreground">{report.type}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{report.date}</div>
                  </div>
                ))}
                <Button variant="gradient" className="w-full mt-4">
                  Generate New Report
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
