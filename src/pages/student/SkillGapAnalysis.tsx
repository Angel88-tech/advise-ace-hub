import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Target,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface SkillGapItem {
  skill: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  resources: { title: string; provider: string; type: string; url: string }[];
}

const mockSkillGaps: SkillGapItem[] = [
  {
    skill: 'Machine Learning',
    category: 'Technical',
    currentLevel: 30,
    requiredLevel: 80,
    priority: 'high',
    resources: [
      { title: 'Machine Learning Specialization', provider: 'Coursera', type: 'Course', url: '#' },
      { title: 'Hands-On ML with Scikit-Learn', provider: 'O\'Reilly', type: 'Book', url: '#' },
    ],
  },
  {
    skill: 'SQL & Databases',
    category: 'Technical',
    currentLevel: 45,
    requiredLevel: 75,
    priority: 'high',
    resources: [
      { title: 'SQL for Data Science', provider: 'Udemy', type: 'Course', url: '#' },
      { title: 'PostgreSQL Certification', provider: 'EDB', type: 'Certification', url: '#' },
    ],
  },
  {
    skill: 'Data Visualization',
    category: 'Analytical',
    currentLevel: 55,
    requiredLevel: 80,
    priority: 'medium',
    resources: [
      { title: 'Tableau Desktop Specialist', provider: 'Tableau', type: 'Certification', url: '#' },
      { title: 'D3.js in Action', provider: 'Manning', type: 'Book', url: '#' },
    ],
  },
  {
    skill: 'Statistical Analysis',
    category: 'Analytical',
    currentLevel: 60,
    requiredLevel: 85,
    priority: 'medium',
    resources: [
      { title: 'Statistics with R', provider: 'Coursera', type: 'Course', url: '#' },
    ],
  },
  {
    skill: 'Project Management',
    category: 'Soft Skills',
    currentLevel: 40,
    requiredLevel: 60,
    priority: 'low',
    resources: [
      { title: 'Google Project Management Certificate', provider: 'Google', type: 'Certification', url: '#' },
    ],
  },
  {
    skill: 'Public Speaking',
    category: 'Communication',
    currentLevel: 50,
    requiredLevel: 70,
    priority: 'low',
    resources: [
      { title: 'Dynamic Public Speaking', provider: 'Coursera', type: 'Course', url: '#' },
    ],
  },
];

const priorityConfig = {
  high: { label: 'High Priority', variant: 'destructive' as const, color: 'text-destructive' },
  medium: { label: 'Medium', variant: 'warning' as const, color: 'text-chart-4' },
  low: { label: 'Low', variant: 'secondary' as const, color: 'text-muted-foreground' },
};

export default function SkillGapAnalysis() {
  const [careerFilter, setCareerFilter] = useState('data-scientist');
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const gapPercentage = (item: SkillGapItem) => item.requiredLevel - item.currentLevel;
  const overallReadiness = Math.round(
    mockSkillGaps.reduce((acc, g) => acc + (g.currentLevel / g.requiredLevel) * 100, 0) / mockSkillGaps.length
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" /> Skill Gap Analysis
            </h1>
            <p className="text-muted-foreground mt-1">
              Identify skill gaps and find resources to close them
            </p>
          </div>
          <Select value={careerFilter} onValueChange={setCareerFilter}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select career" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data-scientist">Data Scientist</SelectItem>
              <SelectItem value="software-engineer">Software Engineer</SelectItem>
              <SelectItem value="product-manager">Product Manager</SelectItem>
              <SelectItem value="ux-designer">UX Designer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overallReadiness}%</p>
                  <p className="text-sm text-muted-foreground">Overall Readiness</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <TrendingUp className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockSkillGaps.filter(g => g.priority === 'high').length}</p>
                  <p className="text-sm text-muted-foreground">Critical Gaps</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockSkillGaps.reduce((a, g) => a + g.resources.length, 0)}</p>
                  <p className="text-sm text-muted-foreground">Resources Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Readiness Bar */}
        <Card variant="elevated" className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Career Readiness</CardTitle>
            <CardDescription>Your current skill levels vs. what's required</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{overallReadiness}%</span>
              </div>
              <Progress value={overallReadiness} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Skill Gap Details */}
        <div className="space-y-4">
          {mockSkillGaps.map((item) => (
            <Card key={item.skill} variant="elevated">
              <CardContent className="pt-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedSkill(expandedSkill === item.skill ? null : item.skill)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.skill}</h3>
                        <Badge variant={priorityConfig[item.priority].variant}>
                          {priorityConfig[item.priority].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">
                        Gap: <span className={priorityConfig[item.priority].color}>{gapPercentage(item)}%</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.currentLevel}% → {item.requiredLevel}%
                      </p>
                    </div>
                    {expandedSkill === item.skill ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: {item.currentLevel}%</span>
                    <span>Required: {item.requiredLevel}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={item.requiredLevel} className="h-2 opacity-30" />
                    <Progress value={item.currentLevel} className="h-2 absolute top-0 left-0 w-full" />
                  </div>
                </div>

                {/* Expanded Resources */}
                {expandedSkill === item.skill && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-primary" /> Recommended Resources
                    </h4>
                    {item.resources.map((resource, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{resource.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {resource.provider} · {resource.type}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
