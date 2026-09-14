import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { ArrowLeft, Link as LinkIcon, BookOpen, AlertCircle, Send } from 'lucide-react';
import { apiClient, getApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import { PageLoader } from '@/components/ui/page-loader';
import type { Mission } from '@/lib/api/types';
import { Input } from '@/components/ui/input';

export function MissionDetailPage() {
  const { missionId } = useParams();
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Minimal local state for submissions
  const [submissions, setSubmissions] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const res = await apiClient.get(`/missions/${missionId}`);
        setMission(res.data.mission || res.data);
      } catch (error) {
        toast.error(getApiError(error, 'Failed to load mission'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchMission();
  }, [missionId]);

  if (isLoading) return <PageLoader />;

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Mission Not Found</h2>
        <p className="text-muted-foreground mb-6">This mission may have been deleted or is not available.</p>
        <Link to="/missions"><Button>Back to Missions</Button></Link>
      </div>
    );
  }

  const handleSubmitTask = async (taskId: string) => {
    try {
      const answerPayload = submissions[taskId];
      const res = await apiClient.post(`/missions/${missionId}/tasks/${taskId}/submit`, {
        answer: answerPayload
      });
      
      toast.success(res.data.message || 'Task submitted successfully!');
      if (res.data.totalXP > 0) {
        toast.success(`You earned ${res.data.totalXP} XP!`);
      }
      
      // Update local state to reflect submission so the button can disable
      // Optionally re-fetch the mission to get the latest progress
    } catch (error) {
      toast.error(getApiError(error, 'Failed to submit task'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <Link to="/missions">
        <Button variant="ghost" className="-ml-4 mb-2 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to HQ
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Brief & Resources */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-sm py-1 border-primary/20">
                {mission.courseId}
              </Badge>
              <Badge className="bg-orange-500/10 text-orange-500 text-sm py-1 border-orange-500/20">
                {mission.basePoints} Base XP
              </Badge>
              {mission.teamSynergyBonus > 0 && (
                <Badge className="bg-purple-500/10 text-purple-500 text-sm py-1 border-purple-500/20">
                  Team Synergy: +{mission.teamSynergyBonus} XP
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl font-bold font-heading">{mission.title}</h1>
            
            <Card className="border-l-4 border-l-primary bg-primary/5 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 text-primary font-heading">Mission Briefing</h3>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {mission.storyBrief}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {mission.resources && mission.resources.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Intelligence & Resources
              </h2>
              <div className="grid gap-3">
                {mission.resources.map((res, i) => (
                  <a key={i} href={res} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-xl border bg-surface hover:border-primary/50 hover:shadow-sm transition-all group">
                    <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors mr-4">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium flex-1 truncate">{res}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Deliverables */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="sticky top-20 border-border">
            <CardHeader className="border-b bg-secondary/30">
              <CardTitle className="flex justify-between items-center">
                <span>Deliverables</span>
                {mission.deadline && <CountdownTimer targetDate={mission.deadline} />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mission.tasks?.map((task) => (
                  <div key={task.id} className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            Task {task.order}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {task.points} XP
                          </span>
                        </div>
                        <h4 className="font-bold text-lg">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      {task.type === 'TEXT_RESPONSE' && (
                        <textarea 
                          placeholder="Type your answer here..."
                          className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-sm"
                          value={submissions[task.id] || ''}
                          onChange={(e) => setSubmissions({ ...submissions, [task.id]: e.target.value })}
                        />
                      )}
                      
                      {task.type === 'URL_SUBMISSION' && (
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="https://" 
                            className="pl-9"
                            value={submissions[task.id] || ''}
                            onChange={(e) => setSubmissions({ ...submissions, [task.id]: e.target.value })}
                          />
                        </div>
                      )}



                      {task.type === 'QUIZ' && task.quizQuestions && (
                        <div className="space-y-6 mt-4">
                          {task.quizQuestions.map((q, qIndex) => {
                            // Submissions[task.id] holds a JSON string of { q1Id: "answer", q2Id: "answer" }
                            let currentAnswers: Record<string, string> = {};
                            try {
                              currentAnswers = submissions[task.id] ? JSON.parse(submissions[task.id] || '{}') : {};
                            } catch { /* ignore */ }

                            return (
                              <div key={q.id} className="space-y-3">
                                <h5 className="font-bold text-md">{qIndex + 1}. {q.questionText}</h5>
                                <div className="space-y-2">
                                  {q.options.map((opt, optIndex) => (
                                    <label key={optIndex} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors group">
                                      <input 
                                        type="radio" 
                                        name={`task-${task.id}-q-${q.id}`} 
                                        value={opt}
                                        checked={currentAnswers[q.id] === opt}
                                        onChange={(e) => {
                                          const newAnswers = { ...currentAnswers, [q.id]: e.target.value };
                                          setSubmissions({ ...submissions, [task.id]: JSON.stringify(newAnswers) });
                                        }}
                                        className="w-4 h-4 text-primary"
                                      />
                                      <span className="text-sm group-hover:text-primary transition-colors">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <Button 
                        className="w-full mt-4" 
                        onClick={() => handleSubmitTask(task.id)}
                        disabled={!submissions[task.id]}
                      >
                        <Send className="w-4 h-4 mr-2" /> Submit Task
                      </Button>
                    </div>
                  </div>
                ))}

                {(!mission.tasks || mission.tasks.length === 0) && (
                  <div className="p-8 text-center text-muted-foreground">
                    No deliverables required for this mission.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
