import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TEAM_COLORS, TEAM_EMOJIS, cn } from '@/lib/utils';
import { Trophy, Shield, Users, Loader2, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { getApiError } from '@/lib/api/client';
import type { Team } from '@/lib/api/types';
import { useAuthStore } from '@/lib/stores/auth-store';

const TEAM_SLOGANS: Record<string, string> = {
  Alpha: 'Lead the pack',
  Beta: 'Soar above',
  Gamma: 'Unleash the dragon',
  Delta: 'King of the jungle',
  Omega: 'Strike fast',
  Sigma: 'Deep depths',
  Zeta: 'Winds of change',
};

export function TeamHub() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await apiClient.get(`/teams/${teamId}`);
        setTeam(res.data.team || res.data.data || res.data);
      } catch (error: unknown) {
        console.error(getApiError(error));
        setError(
          
            'Failed to load team data',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading Team Hub...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Team Not Found</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline">
          <Link to="/teams">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Arena
          </Link>
        </Button>
      </div>
    );
  }

  // Handle the Mongoose overwritten ID vs string ID gracefully
  const teamColor = TEAM_COLORS[team.name] || {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary',
  };
  const teamEmoji = TEAM_EMOJIS[team.name] || '🛡️';
  const slogan = TEAM_SLOGANS[team.name] || 'MIVA Study League';
  const isMyTeam = user?.team === team.name;

  return (
    <div className="space-y-8 pb-8">
      {/* Team Header Banner */}
      <motion.div
        initial={{ opacity: 1, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-bg-card p-8 border shadow-lg"
      >
        <div className={cn('absolute inset-0 opacity-10', teamColor.bg)} />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div
            className={cn(
              'flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl text-7xl shadow-inner',
              teamColor.bg,
            )}
          >
            {teamEmoji}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold">Team {team.name}</h1>
                {isMyTeam && (
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    Your Team
                  </Badge>
                )}
              </div>
              <p className="text-xl text-muted-foreground italic">"{slogan}"</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Badge className="flex items-center gap-1.5 px-3 py-1.5 border-border/50 text-muted-foreground bg-transparent hover:bg-transparent">
                <Trophy className="h-4 w-4" />
                {team.points || team.point || 0} Points
              </Badge>
              <Badge className="flex items-center gap-1.5 px-3 py-1.5 border-border/50 text-muted-foreground bg-transparent hover:bg-transparent">
                <Users className="h-4 w-4" />
                {team.members?.length || 0}/{team.maxMembers} Members
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Roster Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Active Roster ({team.members?.length || 0}/
          {team.maxMembers})
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {team.members?.map((member, i: number) => {
            const memberName = member.name || member.fullName || `Student ${i + 1}`;
            const initials = memberName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .substring(0, 2);
            const isMe = user?.id === member.id;

            return (
              <motion.div
                key={member.id || i}
                initial={{ opacity: 1, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className={cn(
                    'overflow-hidden transition-all hover:border-primary/50',
                    isMe ? 'ring-1 ring-primary' : '',
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold flex items-center gap-2">
                          {memberName} {member.isCaptain && <span className="text-yellow-500 ml-1 text-xs" title="Team Captain">👑</span>}
                          {isMe && <Badge className="text-[10px] h-4 px-1.5">You</Badge>}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {member.role === 'admin' ? 'Admin' : member.isCaptain ? 'Student • Captain' : 'Student'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, team.maxMembers - (team.members?.length || 0)) }).map(
            (_, i) => (
              <Card
                key={`empty-${i}`}
                className="flex items-center justify-center p-6 border-dashed bg-transparent opacity-50"
              >
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Empty Slot
                </p>
              </Card>
            ),
          )}
        </div>
      </section>

      {/* Mocked Stats Area for visual completion */}
      <section className="opacity-50 grayscale pointer-events-none">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6" /> Team Performance (Coming Soon)
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Activity Stats</CardTitle>
            <CardDescription>
              Detailed statistics will unlock when the submissions API is built.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center border-t">
            <span className="text-muted-foreground">Stats Locked</span>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
