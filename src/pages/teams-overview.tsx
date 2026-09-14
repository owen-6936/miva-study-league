import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TEAM_COLORS, TEAM_EMOJIS, cn } from '@/lib/utils';
import { ArrowRight, Swords, Trophy, Users, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { getApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { toast } from 'sonner';

const DEFAULT_TEAM_COLOR = {
  bg: 'bg-red-500/10',
  text: 'text-red-500',
  border: 'border-red-500',
} as const;

const TEAM_FILL_COLORS: Record<string, string> = {
  Alpha: '#ef4444',
  Beta: '#3b82f6',
  Gamma: '#22c55e',
  Delta: '#a855f7',
  Omega: '#f59e0b',
  Sigma: '#06b6d4',
  Zeta: '#ec4899',
};

const TEAM_SLOGANS: Record<string, string> = {
  Alpha: 'Lead the pack',
  Beta: 'Soar above',
  Gamma: 'Unleash the dragon',
  Delta: 'King of the jungle',
  Omega: 'Strike fast',
  Sigma: 'Deep depths',
  Zeta: 'Winds of change',
};

interface Team {
  id: string;
  name: string;
  members: string[];
  maxMembers: number;
  points?: number; point?: number;
}

export function TeamsOverview() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await apiClient.get('/teams');
      const fetchedTeams = res.data.teams || res.data || [];

      // Sort teams by points descending to determine rank
      fetchedTeams.sort((a: Team, b: Team) => (b.points || b.point || 0) - (a.points || a.point || 0));
      setTeams(fetchedTeams);
    } catch (error: unknown) {
      console.error(getApiError(error));
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (teamId: string, teamName: string) => {
    if (!user) return;

    setJoiningId(teamId);
    try {
      await apiClient.post(`/teams/${teamId}/join`);
      toast.success(`Welcome to Team ${teamName}!`);

      // Optimistically update the user's auth store
      updateUser({ teamId, team: teamName });

      // Navigate to their new team hub
      navigate(`/teams/${teamId}`);
    } catch (error) {
      toast.error(getApiError(error, 'Failed to join team'));
      console.error(getApiError(error));
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading The Arena...</p>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">The Arena is Empty</h2>
          <p className="text-muted-foreground">Teams have not been seeded yet.</p>
        </div>
      </div>
    );
  }

  const totalMembers = teams.reduce((sum, team) => sum + (team.members?.length || 0), 0);
  const leader = teams[0]; // Already sorted by points

  return (
    <div className="space-y-8 pb-8">
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient inline-block">The Arena</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Seven teams enter. Only one claims the championship. Explore the factions of the MIVA
          Study League.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Badge className="border-primary/25 bg-primary/10 text-primary">
            <Swords className="h-3.5 w-3.5" />
            {teams.length} Factions
          </Badge>
          <Badge className="border-border bg-surface/80 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {totalMembers} Active Members
          </Badge>
          {leader && (leader.points || leader.point || 0) > 0 && (
            <Badge className="border-primary/25 bg-primary/10 text-primary">
              <Trophy className="h-3.5 w-3.5" />
              Team {leader.name} leads
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
        {teams.map((team, i) => {
          const teamColor = TEAM_COLORS[team.name] ?? DEFAULT_TEAM_COLOR;
          const memberCount = team.members?.length || 0;
          const memberRatio = Math.round((memberCount / team.maxMembers) * 100);
          const rank = i + 1;
          const isMyTeam = user?.teamId === team.id;
          const slogan = TEAM_SLOGANS[team.name] || 'MIVA Study League';

          return (
            <div key={team.id}>
              <Card
                className={cn(
                  'flex h-full flex-col overflow-hidden border-l-4 bg-bg-card/85 transition-all group hover:-translate-y-1 hover:shadow-lg',
                  teamColor.border,
                  isMyTeam ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg' : '',
                )}
              >
                <CardContent className="flex flex-1 flex-col items-center space-y-4 p-6 text-center relative">
                  {isMyTeam && (
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                      Your Team
                    </Badge>
                  )}
                  <div className="text-6xl transition-transform duration-300 group-hover:scale-110">
                    {TEAM_EMOJIS[team.name] || '🛡️'}
                  </div>
                  <div>
                    <h2 className="mb-1 text-2xl font-bold">Team {team.name}</h2>
                    <p className="italic text-muted-foreground">"{slogan}"</p>
                  </div>

                  <div className="mt-auto w-full space-y-3 pt-4">
                    <div className="flex items-center justify-center gap-3">
                      <Badge variant="default" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {memberCount}/{team.maxMembers}
                      </Badge>
                      <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/20">
                        Rank #{rank}
                      </Badge>
                      <Badge className="border border-border/50 bg-transparent text-muted-foreground hover:bg-transparent">
                        {team.points || team.point || 0} pts
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-secondary/15 p-3 text-left">
                      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Roster Capacity</span>
                        <span>{memberRatio}% full</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-border/60">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(memberRatio, 100)}%`,
                            backgroundColor: TEAM_FILL_COLORS[team.name] ?? 'var(--color-primary)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex w-full gap-2 border-t border-border/60 bg-secondary/15 p-4">
                  <Link
                    to={`/teams/${team.id}`}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-md bg-secondary px-4 py-2 font-medium text-foreground transition-opacity hover:opacity-90 border border-border/50"
                  >
                    View Team
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  {user?.teamId === team.id ||
                  user?.teamId?.toLowerCase() === team.name.toLowerCase() ||
                  user?.team?.toLowerCase() === team.name.toLowerCase() ? (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => navigate(`/teams/${team.id}`)}
                    >
                      Your Hub
                    </Button>
                  ) : user?.teamId ? (
                    <Button
                      variant="outline"
                      className="flex-1 border-dashed"
                      disabled
                      title="Coming Soon: Switch teams using your Team Transfer Tokens!"
                    >
                      Switch (Coming Soon)
                    </Button>
                  ) : memberCount >= team.maxMembers ? (
                    <Button variant="outline" className="flex-1" disabled>
                      Full
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      disabled={joiningId === (team.id)}
                      onClick={() => handleJoinTeam(team.id, team.name)}
                    >
                      {joiningId === (team.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Join'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
