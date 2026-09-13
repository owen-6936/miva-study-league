import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { getApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { TEAM_EMOJIS, cn } from '@/lib/utils';
import { Users, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  emoji: string;
  color: string;
  members: string[];
  maxMembers: number;
}

// Global cache to prevent visual UI flickering during React Router double-mounts
let cachedTeams: Team[] | null = null;

export function TeamSelectionModal() {
  const { user, updateUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>(cachedTeams || []);
  const [loading, setLoading] = useState(cachedTeams === null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Only show if user has no team and hasn't explicitly skipped in this session
    const hasSkipped = sessionStorage.getItem('msl-skip-team');
    if (user && !user.teamId && !hasSkipped && !hasFetched) {
      setIsOpen(true);
      setHasFetched(true);
      fetchTeams();
    }
  }, [user, hasFetched]);

  const fetchTeams = async () => {
    console.count('fetchTeams called');
    try {
      const res = await apiClient.get('/teams');
      const fetchedTeams = res.data.teams || res.data || [];
      cachedTeams = fetchedTeams;
      setTeams(fetchedTeams);
    } catch (error: unknown) {
      console.error('Failed to fetch teams', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('msl-skip-team', 'true');
    setIsOpen(false);
  };

  const handleJoin = async (teamId: string) => {
    setJoiningId(teamId);
    try {
      const res = await apiClient.post(`/teams/${teamId}/join`);
      toast.success('Welcome to the team!');
      if (res.data?.user) {
        updateUser(res.data.user);
      } else {
        // Fallback optimistic update
        const team = teams.find((t) => t.id === teamId);
        if (team) {
          updateUser({ teamId: teamId, team: team.name });
        }
      }
      setIsOpen(false);
    } catch (error) {
      toast.error(getApiError(error, 'Failed to join team'));
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      title="Choose Your Faction"
      className="max-w-2xl"
      closeOnOutsideClick={false}
      footer={
        <div className="flex justify-between items-center w-full">
          <p className="text-sm text-muted-foreground">You can also join a team later.</p>
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-muted-foreground mb-6">
          Welcome to the MIVA Study League! To participate in missions, earn points, and climb the
          leaderboard, you need to align yourself with a team. Choose wisely!
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No teams are currently open. Please check back later or contact an Admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams.map((team) => {
              const currentMembers = team.members?.length || 0;
              const isFull = currentMembers >= (team.maxMembers || 6);
              const teamId = team.id;

              return (
                <div
                  key={teamId}
                  className={cn(
                    'border rounded-xl p-4 transition-all',
                    isFull
                      ? 'opacity-60 bg-surface/50 border-border cursor-not-allowed'
                      : 'hover:border-primary/50 hover:bg-surface cursor-pointer bg-bg-card border-border',
                  )}
                  onClick={() => !isFull && !joiningId && handleJoin(teamId as string)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {team.emoji || TEAM_EMOJIS[team.name as keyof typeof TEAM_EMOJIS] || '🛡️'}
                      </span>
                      <h3 className="font-bold font-heading">{team.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span
                      className={cn(
                        'flex items-center gap-1',
                        isFull ? 'text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      {isFull ? <ShieldAlert className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      {currentMembers}/{team.maxMembers || 6} Members
                    </span>

                    <Button
                      size="sm"
                      variant={isFull ? 'outline' : 'primary'}
                      disabled={isFull || joiningId === teamId}
                      className={isFull ? 'text-destructive border-destructive/20' : ''}
                    >
                      {joiningId === teamId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFull ? (
                        'FULL'
                      ) : (
                        'JOIN'
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
