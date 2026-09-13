import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play, Settings, Plus } from 'lucide-react';

const MOCK_CHALLENGES = [
  {
    id: 'c1',
    title: 'Week 3 Saturday Showdown',
    date: '2023-10-21T10:00:00Z',
    status: 'ready',
    rounds: 4,
  },
  {
    id: 'c2',
    title: 'Week 4 Saturday Showdown',
    date: '2023-10-28T10:00:00Z',
    status: 'draft',
    rounds: 0,
  },
  {
    id: 'c0',
    title: 'Week 2 Saturday Showdown',
    date: '2023-10-14T10:00:00Z',
    status: 'completed',
    rounds: 4,
  },
];

export function AdminChallengesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading">Live Challenges</h1>
          <p className="text-muted-foreground">Manage Saturday synchronous challenge sessions.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Challenge
        </Button>
      </div>

      <div className="grid gap-4">
        {MOCK_CHALLENGES.map((challenge) => (
          <Card
            key={challenge.id}
            className={challenge.status === 'ready' ? 'border-primary/50 bg-primary/5' : ''}
          >
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-xl">{challenge.title}</h3>
                  <Badge variant="default">{challenge.status.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {new Date(challenge.date).toLocaleDateString()}
                  </span>
                  <span>{challenge.rounds} Rounds configured</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" /> Manage Rounds
                </Button>
                {challenge.status === 'ready' && (
                  <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <Play className="h-4 w-4" /> Start Challenge
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
