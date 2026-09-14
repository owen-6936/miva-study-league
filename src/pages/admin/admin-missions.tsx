import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { Mission, MissionTask, MissionResource } from '@/lib/api/types';
import type { Column } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2, Save, X, Edit, Link as LinkIcon } from 'lucide-react';
import { apiClient, getApiError } from '@/lib/api/client';
import { toast } from 'sonner';

export function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Builder Form State
  const [missionId, setMissionId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [storyBrief, setStoryBrief] = useState('');
  const [resources, setResources] = useState<MissionResource[]>([]);
  const [tasks, setTasks] = useState<MissionTask[]>([]);
  const [basePoints, setBasePoints] = useState(100);
  const [firstBloodBonus, setFirstBloodBonus] = useState(50);
  const [teamSynergyBonus, setTeamSynergyBonus] = useState(200);
  const [deadline, setDeadline] = useState('');

  const fetchMissions = async () => {
    try {
      const res = await apiClient.get('/missions');
      setMissions(res.data.missions || res.data || []);
    } catch (error) {
      toast.error(getApiError(error, 'Failed to load missions'));
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const resetForm = (openBuilder: boolean = false) => {
    setMissionId(null);
    setTitle('');
    setCourseId('');
    setStoryBrief('');
    setResources([]);
    setTasks([]);
    setBasePoints(100);
    setFirstBloodBonus(50);
    setTeamSynergyBonus(200);
    setDeadline('');
    setIsBuilderOpen(openBuilder);
  };

  const handleEdit = (mission: Mission) => {
    setMissionId(mission.id);
    setTitle(mission.title);
    setCourseId(mission.courseId);
    setStoryBrief(mission.storyBrief || '');
    setResources(mission.resources?.length ? mission.resources : []);
    setTasks(mission.tasks || []);
    setBasePoints(mission.basePoints || 100);
    setFirstBloodBonus(mission.firstBloodBonus || 0);
    setTeamSynergyBonus(mission.teamSynergyBonus || 0);
    setDeadline(mission.deadline ? new Date(mission.deadline).toISOString().slice(0, 16) : '');
    setIsBuilderOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        courseId,
        storyBrief,
        resources: resources.filter(r => r.url.trim() !== ''),
        tasks: tasks.map((t, i) => ({ ...t, order: i + 1 })),
        basePoints,
        firstBloodBonus,
        teamSynergyBonus,
        deadline: new Date(deadline).toISOString(),
        status: 'active'
      };

      if (missionId) {
        await apiClient.put(`/missions/${missionId}`, payload);
        toast.success('Mission updated successfully!');
      } else {
        await apiClient.post('/missions/create', payload);
        toast.success('Mission created successfully!');
      }

      fetchMissions();
      resetForm();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to save mission'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mission?')) return;
    try {
      await apiClient.delete(`/missions/${id}`);
      toast.success('Mission deleted');
      fetchMissions();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to delete mission'));
    }
  };

  const addTask = () => {
    setTasks([...tasks, {
      id: Math.random().toString(36).substr(2, 9),
      order: tasks.length + 1,
      title: 'New Task',
      description: '',
      type: 'TEXT_RESPONSE',
      points: 10,
      isRequired: true,
      quizQuestions: [{
        id: Math.random().toString(36).substr(2, 9),
        questionText: 'New Question',
        options: ['Option A', 'Option B'],
        correctAnswer: 'Option A'
      }]
    }]);
  };

  const updateTask = <K extends keyof MissionTask,>(id: string, field: K, value: MissionTask[K]) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const columns: Column<Mission>[] = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (row: Mission) => <span className="font-medium">{row.title}</span>,
    },
    { header: 'Course', accessorKey: 'courseId' },
    {
      header: 'Tasks',
      accessorKey: 'tasks',
      cell: (row: Mission) => `${row.tasks?.length || 0} tasks`,
    },
    {
      header: 'Total XP',
      accessorKey: 'basePoints',
      cell: (row: Mission) => `${(row.basePoints || 0) + (row.tasks?.reduce((a, b) => a + b.points, 0) || 0)} XP`,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: Mission) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-secondary text-muted-foreground'}`}>
          {row.status?.toUpperCase() || 'UPCOMING'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row: Mission) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isBuilderOpen) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading">{missionId ? 'Edit Mission' : 'Mission Builder'}</h1>
            <p className="text-muted-foreground">Design an engaging, gamified study mission.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => resetForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Mission
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>1. The Brief</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mission Title</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Operation Calculus" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Course Code / ID</Label>
                    <Input value={courseId} onChange={e => setCourseId(e.target.value)} placeholder="e.g. MTH101" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Story Brief (Markdown Supported)</Label>
                  <textarea 
                    className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm"
                    value={storyBrief}
                    onChange={e => setStoryBrief(e.target.value)}
                    placeholder="Hackers have encrypted the school's database! To generate the decryption key, you need to solve these 5 calculus integrals..."
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>2. The Objectives (Tasks)</span>
                  <Button size="sm" variant="secondary" onClick={addTask}><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground">No tasks added yet. Click 'Add Task' to create deliverables.</div>
                ) : (
                  tasks.map((task, idx) => (
                    <div key={task.id} className="p-4 border rounded-xl bg-secondary/10 relative space-y-4">
                      <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive" onClick={() => removeTask(task.id)}><X className="w-4 h-4" /></Button>
                      </div>
                      <div className="font-bold text-sm text-primary mb-2">TASK #{idx + 1}</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Task Title</Label>
                          <Input value={task.title} onChange={e => updateTask(task.id, 'title', e.target.value)} placeholder="e.g. Submit Architecture Diagram" />
                        </div>
                        <div className="space-y-2">
                          <Label>Submission Type</Label>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={task.type} onChange={e => updateTask(task.id, 'type', e.target.value as MissionTask['type'])}>
                            <option value="TEXT_RESPONSE">Rich Text Essay / Answer</option>
                            
                            <option value="URL_SUBMISSION">URL Link</option>
                            <option value="QUIZ">Quiz / Multiple Choice</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Instructions</Label>
                        <Input value={task.description} onChange={e => updateTask(task.id, 'description', e.target.value)} placeholder="What exactly do they need to do?" />
                      </div>
                      
                      {task.type === 'QUIZ' && (
                        <div className="space-y-4 p-4 bg-background/50 border rounded-lg mt-2">
                          <Label className="text-primary font-bold">Quiz Module Questions</Label>
                          {(task.quizQuestions || []).map((q, qIndex) => (
                            <div key={q.id} className="p-4 border rounded-md bg-background space-y-3 relative">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="absolute top-2 right-2 text-destructive h-8 w-8"
                                onClick={() => {
                                  const newQs = (task.quizQuestions || []).filter((_, idx) => idx !== qIndex);
                                  updateTask(task.id, 'quizQuestions', newQs);
                                }}
                              ><X className="w-4 h-4" /></Button>
                              <Input 
                                value={q.questionText} 
                                onChange={e => {
                                  const newQs = [...(task.quizQuestions || [])];
                                  newQs[qIndex] = { ...q, questionText: e.target.value };
                                  updateTask(task.id, 'quizQuestions', newQs);
                                }}
                                placeholder="Question Text"
                                className="font-medium"
                              />
                              <div className="pl-4 space-y-2 border-l-2 border-secondary">
                                {q.options.map((opt, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <input 
                                      type="radio" 
                                      name={`correct-${q.id}`} 
                                      checked={q.correctAnswer === opt}
                                      onChange={() => {
                                        const newQs = [...(task.quizQuestions || [])];
                                        newQs[qIndex] = { ...q, correctAnswer: opt };
                                        updateTask(task.id, 'quizQuestions', newQs);
                                      }}
                                    />
                                    <Input 
                                      value={opt}
                                      onChange={e => {
                                        const newQs = [...(task.quizQuestions || [])];
                                        const oldVal = q.options[optIndex];
                                        const newOptions = [...q.options];
                                        newOptions[optIndex] = e.target.value;
                                        newQs[qIndex] = { ...q, options: newOptions };
                                        if (q.correctAnswer === oldVal) {
                                          newQs[qIndex].correctAnswer = e.target.value;
                                        }
                                        updateTask(task.id, 'quizQuestions', newQs);
                                      }}
                                      className="h-8 text-sm"
                                    />
                                    <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive" onClick={() => {
                                      const newQs = [...(task.quizQuestions || [])];
                                      newQs[qIndex] = { ...q, options: q.options.filter((_, i) => i !== optIndex) };
                                      updateTask(task.id, 'quizQuestions', newQs);
                                    }}><X className="w-3 h-3" /></Button>
                                  </div>
                                ))}
                                <Button variant="secondary" size="sm" onClick={() => {
                                  const newQs = [...(task.quizQuestions || [])];
                                  newQs[qIndex] = { ...q, options: [...q.options, `New Option ${q.options.length + 1}`] };
                                  updateTask(task.id, 'quizQuestions', newQs);
                                }}>Add Option</Button>
                              </div>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" className="w-full" onClick={() => {
                            const newQs = [...(task.quizQuestions || []), {
                              id: Math.random().toString(36).substr(2, 9),
                              questionText: 'New Question',
                              options: ['Option A', 'Option B'],
                              correctAnswer: 'Option A'
                            }];
                            updateTask(task.id, 'quizQuestions', newQs);
                          }}><Plus className="w-4 h-4 mr-2" /> Add Question to Module</Button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Points Awarded</Label>
                          <Input type="number" value={task.points} onChange={e => updateTask(task.id, 'points', parseInt(e.target.value))} />
                        </div>
                        <div className="flex items-center space-x-2 mt-8">
                          <input type="checkbox" id={`req-${task.id}`} checked={task.isRequired} onChange={e => updateTask(task.id, 'isRequired', e.target.checked)} className="w-4 h-4" />
                          <Label htmlFor={`req-${task.id}`}>Required to complete mission</Label>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>3. The Loot (Points)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Base Mission Completion XP</Label>
                  <Input type="number" value={basePoints} onChange={e => setBasePoints(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-orange-500">First Blood Bonus (Speed)</Label>
                  <Input type="number" value={firstBloodBonus} onChange={e => setFirstBloodBonus(parseInt(e.target.value) || 0)} />
                  <p className="text-xs text-muted-foreground">Awarded to the first 3 submissions.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-purple-500">Team Synergy Bonus</Label>
                  <Input type="number" value={teamSynergyBonus} onChange={e => setTeamSynergyBonus(parseInt(e.target.value) || 0)} />
                  <p className="text-xs text-muted-foreground">Awarded to all team members if 80% complete it.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>4. Logistics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Deadline (Due Date)</Label>
                  <Input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required />
                </div>
                <div className="space-y-2 pt-4">
                  <Label>Study Materials / Resources</Label>
                  {resources.map((res, i) => (
                    <div key={i} className="p-4 border border-border rounded-lg bg-secondary/20 relative space-y-3">
                      <Button variant="destructive" size="sm" className="absolute top-2 right-2 h-6 w-6 p-0" onClick={() => setResources(resources.filter((_, idx) => idx !== i))}><X className="w-4 h-4"/></Button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={res.type} onChange={e => {
                            const newRes = [...resources];
                            if(newRes[i]) newRes[i].type = e.target.value as "article" | "audio" | "document" | "video";
                            setResources(newRes);
                          }}>
                            <option value="video">Video (YouTube / Drive)</option>
                            <option value="audio">Audio (Podcast / Drive)</option>
                            <option value="article">Article / Link</option>
                            <option value="document">Document (PDF)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Title</Label>
                          <Input className="h-9" value={res.title} onChange={e => {
                            const newRes = [...resources];
                            if(newRes[i]) newRes[i].title = e.target.value;
                            setResources(newRes);
                          }} placeholder="e.g. Intro to Modulo" required />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">URL</Label>
                        <Input className="h-9" value={res.url} onChange={e => {
                          const newRes = [...resources];
                          if(newRes[i]) newRes[i].url = e.target.value;
                          setResources(newRes);
                        }} placeholder="https://..." required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description (Optional)</Label>
                        <Input className="h-9" value={res.description || ''} onChange={e => {
                          const newRes = [...resources];
                          if(newRes[i]) newRes[i].description = e.target.value;
                          setResources(newRes);
                        }} placeholder="Brief summary of this resource..." />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setResources([...resources, { title: '', type: 'video', url: '' }])}><LinkIcon className="w-4 h-4 mr-2" /> Add Resource</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Manage Missions</h1>
          <p className="text-muted-foreground">Create gamified study assignments using the B.R.A.D format.</p>
        </div>
        <Button onClick={() => resetForm(true)}><Plus className="w-4 h-4 mr-2" /> Create Mission</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={missions} keyExtractor={(row) => row.id} />
        </CardContent>
      </Card>
    </div>
  );
}
