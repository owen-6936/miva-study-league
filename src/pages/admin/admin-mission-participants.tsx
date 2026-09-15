import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { Loader2, ArrowLeft, Users, Trophy } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface Participant {
  user: {
    id: string;
    _id?: string;
    name: string;
    email: string;
    team: string | null;
    globalPoints?: number;
  };
  completed: boolean;
  score: number;
  taskSubmissionsCount: number;
}

export function AdminMissionParticipantsPage() {
  const { id: missionId } = useParams();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [missionName, setMissionName] = useState<string>('Mission Details');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
  }, [missionId]);

  const fetchParticipants = async () => {
    try {
      const res = await apiClient.get(`/admin/missions/${missionId}/participants`);
      setParticipants(res.data.participants || res.data || []);
      if (res.data.missionName) setMissionName(res.data.missionName);
    } catch (err) {
      toast.error('Failed to load mission participants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const columns: Column<Participant>[] = [
    {
      header: 'Student',
      cell: (row: Participant) => (
        <div>
          <p className="font-medium">{row.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.user.email}</p>
        </div>
      )
    },
    {
      header: 'Team',
      cell: (row: Participant) => (
        <Badge variant="default" className="bg-secondary text-secondary-foreground">
          {row.user.team || 'Unassigned'}
        </Badge>
      )
    },
    {
      header: 'Status',
      cell: (row: Participant) => (
        <Badge variant={row.completed ? 'success' : 'warning'}>
          {row.completed ? 'Completed' : 'In Progress'}
        </Badge>
      )
    },
    {
      header: 'Tasks Answered',
      accessorKey: 'taskSubmissionsCount',
      cell: (row: Participant) => <span className="font-medium">{row.taskSubmissionsCount} tasks</span>
    },
    {
      header: 'Mission XP',
      accessorKey: 'score',
      cell: (row: Participant) => <span className="font-mono text-primary font-bold">{row.score ?? 0} XP</span>
    },
    {
      header: 'Global XP',
      cell: (row: Participant) => <span className="font-mono text-muted-foreground">{row.user.globalPoints ?? '—'} XP</span>
    },
    {
      header: 'Action',
      cell: (row: Participant) => (
        <Link to={`/admin/users/${row.user.id || row.user._id}/progress`}>
          <Button variant="outline" size="sm" className="text-xs">Grade</Button>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/missions">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-heading">Mission Roster</h1>
          <p className="text-muted-foreground">{missionName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20 text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Participants</p>
              <h2 className="text-3xl font-black font-mono">{participants.length}</h2>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20 text-green-500">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Completion Rate</p>
              <h2 className="text-3xl font-black font-mono">
                {participants.length ? Math.round((participants.filter(p => p.completed).length / participants.length) * 100) : 0}%
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participant Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={participants} columns={columns} keyExtractor={(item) => item.user.id || item.user._id!} />
        </CardContent>
      </Card>
    </div>
  );
}
