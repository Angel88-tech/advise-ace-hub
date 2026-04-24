import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  MessageSquare, 
  Clock,
  Check,
  X,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const pendingRequests = [
  {
    id: '1',
    studentName: 'Alex Johnson',
    major: 'Computer Science',
    year: 3,
    message: 'I\'m interested in transitioning to data science and would love your guidance on building the right skills.',
    requestDate: '2024-01-18',
  },
  {
    id: '2',
    studentName: 'Lisa Park',
    major: 'Statistics',
    year: 4,
    message: 'Looking for mentorship in machine learning applications in finance. Your experience at TechCorp would be invaluable.',
    requestDate: '2024-01-17',
  },
];

const currentMentees = [
  {
    id: '1',
    name: 'Sarah Chen',
    major: 'Data Science',
    year: 3,
    startDate: '2023-09-15',
    lastMeeting: '2024-01-10',
  },
  {
    id: '2',
    name: 'James Wilson',
    major: 'Computer Science',
    year: 4,
    startDate: '2023-11-01',
    lastMeeting: '2024-01-12',
  },
];

export default function MentorDashboard() {
  const { profile } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [requests, setRequests] = useState(pendingRequests);

  const handleAccept = (requestId: string, studentName: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
    toast.success(`Accepted mentorship request from ${studentName}`);
  };

  const handleDecline = (requestId: string, studentName: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
    toast.info(`Declined mentorship request from ${studentName}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Welcome, {profile?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Manage your mentees and mentorship requests
            </p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
            <Label htmlFor="availability" className="text-sm font-medium">
              {isAvailable ? 'Available for mentorship' : 'Not accepting mentees'}
            </Label>
            <Switch
              id="availability"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{currentMentees.length}</div>
                  <div className="text-sm text-muted-foreground">Current Mentees</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{requests.length}</div>
                  <div className="text-sm text-muted-foreground">Pending Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10">
                  <Calendar className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Students requesting your mentorship</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <div 
                    key={request.id} 
                    className="p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {request.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{request.studentName}</h4>
                          <Badge variant="secondary">Year {request.year}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.major}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{request.requestDate}</div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">
                      "{request.message}"
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="gradient" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAccept(request.id, request.studentName)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDecline(request.id, request.studentName)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No pending requests</h3>
                  <p className="text-sm text-muted-foreground">
                    New mentorship requests will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Mentees */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Current Mentees</CardTitle>
              <CardDescription>Students you're currently mentoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentMentees.map((mentee) => (
                <div 
                  key={mentee.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="gradient-primary text-primary-foreground">
                      {mentee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{mentee.name}</h4>
                    <p className="text-sm text-muted-foreground">{mentee.major} • Year {mentee.year}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Since {mentee.startDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last: {mentee.lastMeeting}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
