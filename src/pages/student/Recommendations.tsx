import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Briefcase,
  ChevronRight,
  Sparkles,
  Filter,
  Target
} from 'lucide-react';
import { CareerRecommendation } from '@/types';

const mockRecommendations: CareerRecommendation[] = [
  {
    id: '1',
    title: 'Data Scientist',
    description: 'Analyze complex data sets to help organizations make better decisions. Use machine learning and statistical methods.',
    matchScore: 92,
    requiredSkills: [
      { id: '1', name: 'Python', category: 'technical', level: 'advanced', source: 'verified' },
      { id: '2', name: 'Machine Learning', category: 'technical', level: 'intermediate', source: 'verified' },
      { id: '3', name: 'Statistics', category: 'analytical', level: 'advanced', source: 'verified' },
    ],
    salaryRange: { min: 95000, max: 150000, currency: 'USD' },
    demandTrend: 'growing',
    jobOpenings: 45000,
    industries: ['Technology', 'Finance', 'Healthcare'],
  },
  {
    id: '2',
    title: 'Software Engineer',
    description: 'Design, develop, and maintain software applications. Work with cross-functional teams to deliver high-quality products.',
    matchScore: 87,
    requiredSkills: [
      { id: '4', name: 'JavaScript', category: 'technical', level: 'advanced', source: 'verified' },
      { id: '5', name: 'System Design', category: 'technical', level: 'intermediate', source: 'verified' },
      { id: '6', name: 'Problem Solving', category: 'analytical', level: 'advanced', source: 'verified' },
    ],
    salaryRange: { min: 85000, max: 160000, currency: 'USD' },
    demandTrend: 'growing',
    jobOpenings: 120000,
    industries: ['Technology', 'Finance', 'E-commerce'],
  },
  {
    id: '3',
    title: 'Product Manager',
    description: 'Lead product strategy and development. Bridge technical teams with business goals to create successful products.',
    matchScore: 81,
    requiredSkills: [
      { id: '7', name: 'Strategic Thinking', category: 'analytical', level: 'advanced', source: 'verified' },
      { id: '8', name: 'Communication', category: 'communication', level: 'expert', source: 'verified' },
      { id: '9', name: 'Data Analysis', category: 'analytical', level: 'intermediate', source: 'verified' },
    ],
    salaryRange: { min: 100000, max: 180000, currency: 'USD' },
    demandTrend: 'stable',
    jobOpenings: 35000,
    industries: ['Technology', 'Consumer Goods', 'SaaS'],
  },
  {
    id: '4',
    title: 'UX Designer',
    description: 'Create intuitive and engaging user experiences. Conduct research and design user interfaces.',
    matchScore: 74,
    requiredSkills: [
      { id: '10', name: 'UI Design', category: 'creative', level: 'advanced', source: 'verified' },
      { id: '11', name: 'User Research', category: 'analytical', level: 'intermediate', source: 'verified' },
      { id: '12', name: 'Prototyping', category: 'technical', level: 'intermediate', source: 'verified' },
    ],
    salaryRange: { min: 75000, max: 130000, currency: 'USD' },
    demandTrend: 'growing',
    jobOpenings: 28000,
    industries: ['Technology', 'Design Agencies', 'E-commerce'],
  },
];

const formatSalary = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Recommendations() {
  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Career Recommendations</h1>
            <p className="text-muted-foreground">
              Personalized career paths based on your skills and market demand
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="gradient">
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh Recommendations
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommendations List */}
          <div className="lg:col-span-2 space-y-4">
            {mockRecommendations.map((career, index) => (
              <Card 
                key={career.id} 
                variant={selectedCareer?.id === career.id ? 'elevated' : 'default'}
                className={`cursor-pointer transition-all ${selectedCareer?.id === career.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedCareer(career)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-lg font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold mb-1">{career.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {career.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {career.industries.slice(0, 3).map((industry) => (
                            <Badge key={industry} variant="secondary">{industry}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-primary">{career.matchScore}%</div>
                      <div className="text-xs text-muted-foreground">Match</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div className="font-medium">{formatSalary(career.salaryRange.min)} - {formatSalary(career.salaryRange.max)}</div>
                        <div className="text-xs text-muted-foreground">Salary Range</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div className="font-medium">{career.jobOpenings.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Job Openings</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {career.demandTrend === 'growing' ? (
                        <TrendingUp className="h-4 w-4 text-accent" />
                      ) : career.demandTrend === 'declining' ? (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      ) : (
                        <Target className="h-4 w-4 text-chart-4" />
                      )}
                      <div className="text-sm">
                        <div className="font-medium capitalize">{career.demandTrend}</div>
                        <div className="text-xs text-muted-foreground">Demand Trend</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedCareer ? (
              <Card variant="elevated" className="sticky top-24">
                <CardHeader>
                  <CardTitle>{selectedCareer.title}</CardTitle>
                  <CardDescription>{selectedCareer.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Match Score */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Match Score</span>
                      <span className="font-semibold text-primary">{selectedCareer.matchScore}%</span>
                    </div>
                    <Progress value={selectedCareer.matchScore} className="h-2" />
                  </div>

                  {/* Required Skills */}
                  <div>
                    <h4 className="font-semibold mb-3">Required Skills</h4>
                    <div className="space-y-2">
                      {selectedCareer.requiredSkills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between">
                          <Badge variant="skill">{skill.name}</Badge>
                          <span className="text-xs text-muted-foreground capitalize">{skill.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Industries */}
                  <div>
                    <h4 className="font-semibold mb-3">Industries</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCareer.industries.map((industry) => (
                        <Badge key={industry} variant="outline">{industry}</Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="gradient" className="w-full">
                    View Skill Gap Analysis
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card variant="elevated">
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Select a Career</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a career recommendation to see detailed information
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
