import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, ChevronRight, FileText, Link as LinkIcon 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient, getApiError } from '@/lib/api/client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// The Reviewable Mission structure
interface TaskSubmission {
  taskId: string;
  type: string;
  content?: string;
  score: number;
  status: 'graded' | 'pending' | 'rejected';
}

interface UserMission {
  id: string;
  userId: { id: string; fullName: string; teamId: string };
  missionId: { 
    id: string; 
    title: string; 
    tasks: { id?: string; _id?: string; title: string; description: string; type: string; points: number }[];
  };
  status: 'pending_review' | 'completed';
  taskSubmissions: TaskSubmission[];
  createdAt: string;
}

export const AdminSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<UserMission | null>(null);
  const [rejectionHint, setRejectionHint] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await apiClient.get('/missions/submissions');
      setSubmissions(res.data.submissions || res.data || []);
    } catch (error) {
      toast.error(getApiError(error, 'Failed to fetch review queue'));
    } finally {
      setLoading(false);
    }
  };

  const gradeTask = async (taskId: string, approved: boolean, maxPoints: number) => {
    if (!selectedMission) return;
    try {
      await apiClient.post(`/missions/submissions/${selectedMission.id}/grade/${taskId}`, {
        approved,
        pointsAwarded: approved ? maxPoints : 0,
        hint: !approved ? rejectionHint[taskId] : undefined
      });
      toast.success(approved ? 'Task Approved & Points Awarded' : 'Task Rejected');
      
      // Update local state temporarily
      const updatedTasks = selectedMission.taskSubmissions.map(t => 
        t.taskId === taskId ? { ...t, status: approved ? 'graded' as const : 'rejected' as const, score: approved ? maxPoints : 0 } : t
      );
      setSelectedMission({ ...selectedMission, taskSubmissions: updatedTasks });
      
      // Refresh list to remove it if fully completed
      fetchSubmissions();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to grade task'));
    }
  };

  if (selectedMission) {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedMission(null)}>
            <ChevronRight className="rotate-180 mr-2 h-4 w-4" /> Back to Queue
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-heading">{selectedMission.userId.fullName}</h1>
            <p className="text-sm text-muted-foreground">Mission: {selectedMission.missionId.title}</p>
          </div>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="tasks">Mission Submissions</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="space-y-6 mt-6">
            {selectedMission.missionId.tasks.map((task) => {
              const submission = selectedMission.taskSubmissions.find(t => t.taskId === task.id || t.taskId === task._id);
              
              if (!submission) return null;

              return (
                <Card key={task.id} className={submission.status === 'graded' ? 'border-green-500/50' : 'border-primary/50'}>
                  <CardHeader className="bg-secondary/20 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {task.type === 'URL_SUBMISSION' ? <LinkIcon className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
                        {task.title}
                      </CardTitle>
                      <span className="text-sm font-bold bg-secondary px-3 py-1 rounded-full">
                        {task.points} pts
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Prompt:</p>
                      <p className="font-medium">{task.description}</p>
                    </div>
                    
                    <div className="bg-surface p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-2">Student Submitted:</p>
                      {task.type === 'URL_SUBMISSION' ? (
                        <a href={submission.content} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                          {submission.content}
                        </a>
                      ) : task.type === 'QUIZ' ? (
                        <div className="space-y-2">
                          {(() => {
                            try {
                              const answers = JSON.parse(submission.content || '{}');
                              return Object.entries(answers).map(([qId, ans]) => (
                                <div key={qId} className="bg-background p-2 rounded border text-sm">
                                  <span className="text-muted-foreground">Q-ID {qId.slice(-4)}:</span> <span className="font-mono font-bold">{ans as string}</span>
                                </div>
                              ));
                            } catch {
                              return <p className="whitespace-pre-wrap text-destructive">Failed to parse quiz data: {submission.content}</p>;
                            }
                          })()}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{submission.content}</p>
                      )}
                    </div>

                    {submission.status === 'pending' ? (
                      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                        <Button 
                          onClick={() => gradeTask((task.id || task._id)!, true, task.points)}
                          className="flex-1 h-auto py-3 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve & Award Points
                        </Button>
                        <div className="flex-1 flex flex-col gap-2">
                          <textarea 
                            placeholder="Optional hint for rejection..."
                            className="w-full text-sm p-2 rounded-md border border-input bg-background min-h-[60px]"
                            value={rejectionHint[(task.id || task._id)!] || ''}
                            onChange={(e) => setRejectionHint({...rejectionHint, [(task.id || task._id)!]: e.target.value})}
                          />
                          <Button 
                            onClick={() => gradeTask((task.id || task._id)!, false, task.points)}
                            variant="destructive" 
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Reject Task
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-border flex items-center gap-2 text-green-500">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold">Graded ({submission.score}/{task.points} pts)</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-heading">Submissions Review</h1>
          <p className="text-muted-foreground">Grade manual text and URL submissions</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading queue...</div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-500/50 mb-4" />
                <p className="text-lg">Inbox Zero!</p>
                <p className="text-sm">All student submissions have been graded.</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-secondary/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{sub.userId?.fullName || 'Unknown Scholar'}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Mission: <span className="font-medium text-foreground">{sub.missionId?.title || 'Unknown Mission'}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setSelectedMission(sub)} variant="primary" className="shrink-0 w-full sm:w-auto">
                    Review Mission <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
