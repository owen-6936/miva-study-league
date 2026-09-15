import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Save, Edit3, XCircle } from 'lucide-react';
import { apiClient, getApiError } from '@/lib/api/client';
import { toast } from 'sonner';

interface TaskSubmission {
  taskId: string;
  answer: string;
  status: 'pending' | 'approved' | 'rejected' | 'graded';
  pointsEarned: number;
  hint?: string;
}

interface MissionProgress {
  missionId: string;
  missionTitle: string;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    description: string;
    points: number;
    type: string;
  }[];
  taskSubmissions: TaskSubmission[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  matricNumber: string;
  team?: string | null;
  teamId?: { _id: string; name: string } | null;
  points: number;
}

export function AdminUserProgressPage() {
  const { id: userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [missions, setMissions] = useState<MissionProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable states
  const [globalPoints, setGlobalPoints] = useState<string>('');
  const [editingPoints, setEditingPoints] = useState(false);
  const [taskPoints, setTaskPoints] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      // These are the requested backend routes we need
      const [userRes, missionsRes] = await Promise.all([
        apiClient.get(`/admin/users/${userId}`),
        apiClient.get(`/admin/users/${userId}/missions`)
      ]);
      
      const fetchedUser = userRes.data.user;
      const fetchedMissions = missionsRes.data.missions;
      
      setUser(fetchedUser);
      setGlobalPoints(String(fetchedUser.points || 0));
      setMissions(fetchedMissions);
      
      // Initialize local state for task points editing
      const initialTaskPoints: Record<string, string> = {};
      fetchedMissions.forEach((m: MissionProgress) => {
        m.taskSubmissions.forEach(sub => {
          initialTaskPoints[`${m.missionId}-${sub.taskId}`] = String(sub.pointsEarned || 0);
        });
      });
      setTaskPoints(initialTaskPoints);
      
    } catch (err) {
      toast.error('Failed to load user progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGlobalPoints = async () => {
    try {
      await apiClient.patch(`/admin/users/${userId}/points`, {
        totalPoints: Number(globalPoints)
      });
      toast.success('User overall points updated successfully');
      setEditingPoints(false);
      setUser(prev => prev ? { ...prev, points: Number(globalPoints) } : null);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update points'));
    }
  };

  const handleUpdateTaskPoints = async (missionId: string, taskId: string) => {
    const points = Number(taskPoints[`${missionId}-${taskId}`]);
    try {
      await apiClient.patch(`/admin/users/${userId}/missions/${missionId}/tasks/${taskId}`, {
        pointsEarned: points
      });
      toast.success('Task points updated successfully');
      
      // Opt UI update
      setMissions(prev => prev.map(m => {
        if (m.missionId === missionId) {
          return {
            ...m,
            taskSubmissions: m.taskSubmissions.map(s => s.taskId === taskId ? { ...s, pointsEarned: points } : s)
          };
        }
        return m;
      }));
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update task points'));
    }
  };

  if (loading) {
    return <div className="flex h-100 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link to="/admin/users">
          <Button  size="sm" className="w-8 h-8 p-0 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-heading">{user.name}'s Progress</h1>
          <p className="text-muted-foreground">{user.email} • {user.matricNumber}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-primary/20 bg-primary/5 h-fit">
          <CardHeader>
            <CardTitle>Global Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Team</p>
              <Badge variant="default" className="text-sm px-3 py-1 bg-secondary text-secondary-foreground">
                {user.teamId?.name || user.team || 'Unassigned'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Accumulated Points</p>
              {editingPoints ? (
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={globalPoints} 
                    onChange={e => setGlobalPoints(e.target.value)}
                    className="font-mono"
                  />
                  <Button size="sm" className="w-8 h-8 p-0 shrink-0" onClick={handleUpdateGlobalPoints}><Save className="h-4 w-4" /></Button>
                  <Button size="sm" className="w-8 h-8 p-0 shrink-0" variant="ghost" onClick={() => setEditingPoints(false)}><XCircle className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-surface p-3 rounded-lg border border-border">
                  <span className="text-2xl font-black text-primary font-mono">{user.points || 0} XP</span>
                  <Button variant="ghost" size="sm" onClick={() => setEditingPoints(true)}>
                    <Edit3 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold font-heading">Mission Submissions</h2>
          
          {missions.length === 0 ? (
            <div className="text-center p-8 bg-surface border border-dashed rounded-lg">
              <p className="text-muted-foreground">This student has not submitted any missions yet.</p>
            </div>
          ) : (
            missions.map((mission) => (
              <Card key={mission.missionId} className="border-border">
                <CardHeader className="bg-secondary/10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{mission.missionTitle}</CardTitle>
                    <Badge variant={mission.completed ? "success" : "default"} className={mission.completed ? "bg-green-500" : ""}>
                      {mission.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {mission.tasks.map(task => {
                    const submission = mission.taskSubmissions.find(s => s.taskId === task.id);
                    const stateKey = `${mission.missionId}-${task.id}`;
                    
                    return (
                      <div key={task.id} className="p-4 bg-surface border border-border rounded-lg space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-bold text-sm">Task: {task.title}</p>
                            <p className="text-xs text-muted-foreground">Max Points: {task.points}</p>
                          </div>
                          {submission && (
                            <Badge  className={submission.status === 'pending' ? 'border-amber-500 text-amber-500' : 'border-green-500 text-green-500'}>
                              {submission.status}
                            </Badge>
                          )}
                        </div>

                        {submission ? (
                          <>
                            <div className="bg-background p-3 rounded border text-sm overflow-x-auto">
                              <p className="text-xs text-muted-foreground mb-1 font-semibold">Student Answer:</p>
                              {(() => {
                                try {
                                  const parsed = JSON.parse(submission.answer);
                                  return (
                                    <pre className="font-mono text-xs text-foreground/80 whitespace-pre-wrap">
                                      {JSON.stringify(parsed, null, 2)}
                                    </pre>
                                  );
                                } catch {
                                  return <span className="font-mono whitespace-pre-wrap break-all text-foreground/80">{submission.answer}</span>;
                                }
                              })()}
                            </div>
                            
                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                              <span className="text-sm font-medium">Awarded XP:</span>
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="number" 
                                  className="w-20 text-right font-mono h-8"
                                  value={taskPoints[stateKey] || ''}
                                  onChange={e => setTaskPoints({ ...taskPoints, [stateKey]: e.target.value })}
                                />
                                <Button size="sm" onClick={() => handleUpdateTaskPoints(mission.missionId, task.id)} disabled={Number(taskPoints[stateKey]) === submission.pointsEarned}>
                                  Update
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="bg-background/50 p-3 rounded border border-dashed text-sm text-muted-foreground text-center">
                            No submission recorded for this task yet.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
