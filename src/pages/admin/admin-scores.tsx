import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TeamBadge } from '@/components/ui/team-badge';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const TEAMS = [
  { id: 't1', name: 'Alpha' },
  { id: 't2', name: 'Beta' },
  { id: 't3', name: 'Gamma' },
  { id: 't4', name: 'Delta' },
  { id: 't5', name: 'Epsilon' },
  { id: 't6', name: 'Zeta' },
  { id: 't7', name: 'Eta' },
];

export function AdminScoresPage() {
  const [scores, setScores] = useState<Record<string, string>>({});

  const handleSave = () => {
    toast.success('Scores saved and broadcasted successfully');
    setScores({});
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold font-heading">Score Entry</h1>
        <p className="text-muted-foreground">
          Manually award points for challenges or special events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Event</label>
              <select className="w-full p-2 rounded-md border border-input bg-background">
                <option>Week 3 Saturday Challenge</option>
                <option>Week 3 Mission Bonus</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Round/Category</label>
              <select className="w-full p-2 rounded-md border border-input bg-background">
                <option>Round 1: Quick Fire</option>
                <option>Round 2: Problem Battle</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {TEAMS.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface"
              >
                <TeamBadge teamId={team.id} name={team.name} />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    className="w-24 text-right font-mono"
                    value={scores[team.id] || ''}
                    onChange={(e) => setScores({ ...scores, [team.id]: e.target.value })}
                  />
                  <span className="text-sm text-muted-foreground">pts</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Save Scores
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
