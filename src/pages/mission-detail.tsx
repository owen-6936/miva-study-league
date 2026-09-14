import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { ArrowLeft, Link as LinkIcon, BookOpen, AlertCircle, Send, PlayCircle, FileText, Headphones } from 'lucide-react';
import { apiClient, getApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import { PageLoader } from '@/components/ui/page-loader';
import type { Mission, MissionResource } from '@/lib/api/types';
import { Input } from '@/components/ui/input';


const getDrivePreviewUrl = (url: string) => {
  let parsedUrl = url;
  if (!parsedUrl.startsWith('http://') && !parsedUrl.startsWith('https://')) {
    parsedUrl = 'https://' + parsedUrl;
  }
  
  if (parsedUrl.includes('drive.google.com/file/d/')) {
    return parsedUrl.replace('/view', '/preview').split('?')[0] + '/preview';
  }
  if (parsedUrl.includes('youtube.com/watch?v=')) {
    return parsedUrl.replace('watch?v=', 'embed/').split('&')[0];
  }
  if (parsedUrl.includes('youtu.be/')) {
    return parsedUrl.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];
  }
  return parsedUrl;
};

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

            <Tabs defaultValue="briefing" className="w-full space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="briefing" className="gap-2"><BookOpen className="w-4 h-4 mr-2" /> The Briefing Room</TabsTrigger>
          <TabsTrigger value="arena" className="gap-2"><Send className="w-4 h-4 mr-2" /> The Arena (Tasks)</TabsTrigger>
        </TabsList>

        <TabsContent value="briefing" className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-4xl mx-auto">
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
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{mission.storyBrief}</p>
              </CardContent>
            </Card>
          </motion.div>

          {mission.resources && mission.resources.length > 0 && (
            <div className="space-y-6 max-w-4xl mx-auto mt-12 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Intelligence & Resources
              </h2>
              <div className="grid gap-6">
                {mission.resources.map((res: MissionResource, i: number) => (
                  <Card key={i} className="overflow-hidden border border-border bg-surface">
                    <CardHeader className="bg-secondary/20 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                          {res.type === 'video' ? <PlayCircle className="w-5 h-5" /> : 
                           res.type === 'audio' ? <Headphones className="w-5 h-5" /> : 
                           res.type === 'article' ? <LinkIcon className="w-5 h-5" /> : 
                           <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{res.title || 'Untitled Resource'}</CardTitle>
                          {res.description && <p className="text-sm text-muted-foreground mt-1">{res.description}</p>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {(res.type === 'video' || res.type === 'audio') ? (
                        <div className="w-full aspect-video border-t border-border bg-black/5 flex items-center justify-center">
                          <iframe 
                            src={getDrivePreviewUrl(res.url)} 
                            className="w-full h-full min-h-[300px]"
                            allow="autoplay; encrypted-media" 
                            allowFullScreen 
                          />
                        </div>
                      ) : (
                        <div className="p-6 border-t border-border flex justify-between items-center bg-secondary/5">
                          <span className="text-sm font-medium text-muted-foreground truncate mr-4">{res.url}</span>
                          <a href={res.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                            Open Link <LinkIcon className="w-4 h-4 ml-2"/>
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="arena" className="max-w-4xl mx-auto">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
