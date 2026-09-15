import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Trophy, Gift, Star, Flame, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { cn, TEAM_EMOJIS } from '@/lib/utils';

interface TopPlayer {
  id: string;
  name: string;
  team: string;
  points: number;
}

interface TopTeam {
  name: string;
  points: number;
}

interface Champion {
  missionTitle: string;
  playerName: string;
  team: string;
  completedAt: string;
}

interface HallOfFameData {
  topPlayers: TopPlayer[];
  topTeams: TopTeam[];
  recentChampions: Champion[];
}

export function HallOfFamePage() {
  const [data, setData] = useState<HallOfFameData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/awards/hall-of-fame');
        setData(res.data.hallOfFame || res.data);
      } catch (err) {
        console.error('Failed to load hall of fame data', err);
        // We do not set dummy data here because it's a live feature now, but we can fail gracefully.
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Graceful fallback if backend is empty
  const topPlayers = data?.topPlayers || [];
  const topTeams = data?.topTeams || [];
  const recentChampions = data?.recentChampions || [];

  return (
    <div className="space-y-10 pb-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-2 relative">
          <Crown className="w-12 h-12 text-yellow-500" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute -top-1 -right-1 text-yellow-400"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-gradient">
          The Hall of Fame
        </h1>
        <p className="text-lg text-muted-foreground">
          Immortalizing the greatest scholars, teams, and speedrunners in the MIVA Study League.
        </p>
      </motion.div>

      {/* Prizes Coming Soon Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary/30 bg-primary/5 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 blur-xl" />
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 bg-primary/20 rounded-full text-primary shrink-0">
              <Gift className="w-8 h-8" />
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-xl font-bold font-heading text-primary">Season 1 Grand Prize: The Ultimate Team Vault 🏆</h3>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                At the end of the season, the <strong className="text-foreground">Top Ranking Team</strong> will unlock a massive secret <strong className="text-foreground text-green-500">Cash Prize Pool</strong>! 
                <span className="text-muted-foreground"> The top 3 MVP contributors within the winning team will take the lion's share of the cash, while the rest of the active team gets a standard cut. (Plus, a special bonus prize for the #1 Global Scholar!)</span>
                <br className="hidden sm:block" />
                <span className="inline-block mt-3 font-medium text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">How to win: Carry your team to the #1 spot on the Leaderboard, but don't slack off—compete against your own teammates to secure the biggest cut of the cash!</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top 3 Global Players */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-transparent">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6" /> Global Top 3
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {topPlayers.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No data available yet.</p>}
              {topPlayers.slice(0, 3).map((player, idx) => (
                <div key={player.id} className="flex items-center gap-4 p-4 rounded-xl bg-background border shadow-sm relative overflow-hidden">
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", idx === 0 ? "bg-yellow-400" : idx === 1 ? "bg-slate-300" : "bg-amber-600")} />
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-lg shrink-0">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{player.name}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{TEAM_EMOJIS[player.team]} Team {player.team}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-lg">{player.points}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">XP</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Teams & First Bloods */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" /> Dominating Teams
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {topTeams.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No team data.</p>}
                {topTeams.slice(0, 3).map((team, idx) => (
                  <div key={team.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-muted-foreground">#{idx + 1}</span>
                      <span className="font-medium">{TEAM_EMOJIS[team.name]} Team {team.name}</span>
                    </div>
                    <span className="font-mono font-bold">{team.points} XP</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-amber-500">
                  <Star className="w-5 h-5" /> Mission Speedrunners
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {recentChampions.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No champions yet.</p>}
                {recentChampions.map((champ, idx) => (
                  <div key={idx} className="flex flex-col gap-1 p-3 border-l-2 border-amber-500 bg-amber-500/5 rounded-r-lg">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{champ.missionTitle}</p>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm">{champ.playerName}</p>
                      <Badge variant="warning" className="text-[10px] bg-background">First Blood</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
