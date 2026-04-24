import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Briefcase, 
  MapPin, 
  Clock,
  MessageSquare,
  Linkedin,
  CheckCircle2
} from 'lucide-react';
import { MentorProfile } from '@/types';
import { toast } from 'sonner';

const mockMentors: MentorProfile[] = [
  {
    id: '1',
    email: 'michael.chen@tech.com',
    name: 'Michael Chen',
    role: 'mentor',
    title: 'Senior Data Scientist',
    company: 'TechCorp',
    industry: 'Technology',
    yearsExperience: 8,
    expertise: ['Machine Learning', 'Python', 'Data Analytics', 'AI'],
    bio: 'Passionate about helping students break into data science. Previously at Google and Amazon.',
    linkedinUrl: 'https://linkedin.com/in/michaelchen',
    availability: 'available',
    menteeCount: 3,
    maxMentees: 5,
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'sarah.j@finance.com',
    name: 'Sarah Johnson',
    role: 'mentor',
    title: 'Product Manager',
    company: 'FinanceHub',
    industry: 'Finance',
    yearsExperience: 6,
    expertise: ['Product Strategy', 'Agile', 'User Research', 'Leadership'],
    bio: 'Love mentoring aspiring PMs. Focus on building user-centric products.',
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    availability: 'limited',
    menteeCount: 4,
    maxMentees: 4,
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'david.w@startup.io',
    name: 'David Williams',
    role: 'mentor',
    title: 'Engineering Manager',
    company: 'StartupIO',
    industry: 'Technology',
    yearsExperience: 10,
    expertise: ['System Design', 'Team Leadership', 'Software Architecture', 'Career Growth'],
    bio: 'Building and scaling engineering teams. Happy to share insights on technical career paths.',
    linkedinUrl: 'https://linkedin.com/in/davidwilliams',
    availability: 'available',
    menteeCount: 2,
    maxMentees: 4,
    createdAt: new Date(),
  },
  {
    id: '4',
    email: 'emily.r@design.co',
    name: 'Emily Rodriguez',
    role: 'mentor',
    title: 'UX Design Lead',
    company: 'DesignCo',
    industry: 'Design',
    yearsExperience: 7,
    expertise: ['UX Design', 'User Research', 'Design Systems', 'Prototyping'],
    bio: 'Helping designers grow their careers. Expertise in B2B and consumer products.',
    availability: 'available',
    menteeCount: 1,
    maxMentees: 3,
    createdAt: new Date(),
  },
];

const getAvailabilityColor = (availability: string) => {
  switch (availability) {
    case 'available':
      return 'success';
    case 'limited':
      return 'warning';
    default:
      return 'secondary';
  }
};

export default function Mentors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [requestedMentors, setRequestedMentors] = useState<string[]>([]);

  const filteredMentors = mockMentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
    mentor.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestMentorship = (mentorId: string, mentorName: string) => {
    setRequestedMentors([...requestedMentors, mentorId]);
    toast.success(`Mentorship request sent to ${mentorName}!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Find a Mentor</h1>
          <p className="text-muted-foreground">
            Connect with industry professionals who can guide your career journey
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, expertise, or industry..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="gradient-primary text-primary-foreground text-xl">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg font-semibold truncate">{mentor.name}</h3>
                      <Badge variant={getAvailabilityColor(mentor.availability) as any} className="shrink-0">
                        {mentor.availability === 'available' ? 'Available' : 
                         mentor.availability === 'limited' ? 'Limited' : 'Unavailable'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{mentor.title}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {mentor.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {mentor.yearsExperience} years
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                  {mentor.bio}
                </p>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                      <Badge key={skill} variant="skill">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {mentor.menteeCount}/{mentor.maxMentees} mentees
                  </div>
                  <div className="flex gap-2">
                    {mentor.linkedinUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {requestedMentors.includes(mentor.id) ? (
                      <Button variant="secondary" size="sm" disabled>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Requested
                      </Button>
                    ) : (
                      <Button 
                        variant="gradient" 
                        size="sm"
                        onClick={() => handleRequestMentorship(mentor.id, mentor.name)}
                        disabled={mentor.availability === 'unavailable' || mentor.menteeCount >= mentor.maxMentees}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Mentorship
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <Card variant="elevated" className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No mentors found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
