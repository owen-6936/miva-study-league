import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, CheckCircle2, FileText, Link as LinkIcon } from 'lucide-react';

const MOCK_MISSION = {
  id: 'm1',
  title: 'Math Wars: Linear Algebra',
  course: 'MTH 101',
  description:
    'Linear algebra is the foundation of modern mathematics. In this mission, your team must complete three tasks related to matrices and vectors.',
  fullDescription: `Welcome to Math Wars! This week's mission challenges you to apply your knowledge of linear algebra to solve complex problems.

You'll need to coordinate with your team to split the work, but remember that everyone must understand the solutions to earn full points.`,
  deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
  progress: 33,
  tasks: [
    { id: 1, title: 'Matrix multiplication exercises', completed: true },
    { id: 2, title: 'Determinant of 3x3 matrices', completed: false },
    { id: 3, title: 'Eigenvalues and Eigenvectors application', completed: false },
  ],
  resources: [
    { title: 'Chapter 4: Matrices', type: 'pdf' },
    { title: 'Video: Understanding Determinants', type: 'link' },
  ],
};

export function MissionDetailPage() {
  const { missionId: _missionId } = useParams();

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" className="mb-4 -ml-4">
        <Link to="/missions">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Missions
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 1, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Badge>{MOCK_MISSION.course}</Badge>
            <h1 className="text-4xl font-bold font-heading">{MOCK_MISSION.title}</h1>
            <p className="text-lg text-muted-foreground whitespace-pre-line">
              {MOCK_MISSION.fullDescription}
            </p>
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading">Tasks</h2>
            <Card className="bg-surface">
              <CardContent className="p-6 space-y-4">
                {MOCK_MISSION.tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-4">
                    {task.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-muted shrink-0 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">{task.id}</span>
                      </div>
                    )}
                    <div
                      className={`pt-0.5 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {task.title}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Mission Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time Remaining</span>
                </div>
                <div className="text-2xl font-bold text-destructive">
                  <CountdownTimer targetDate={MOCK_MISSION.deadline} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Team Progress</span>
                  <span className="font-medium">{MOCK_MISSION.progress}%</span>
                </div>
                <Progress value={MOCK_MISSION.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_MISSION.resources.map((res, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {res.type === 'pdf' ? (
                    <FileText className="h-4 w-4 text-primary" />
                  ) : (
                    <LinkIcon className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">{res.title}</span>
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
