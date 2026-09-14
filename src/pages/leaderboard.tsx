import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import type { Team, User } from '@/lib/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { TEAM_EMOJIS } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num || 0);
}

const PodiumStep = ({ team, rank }: { team: Team; rank: number }) => {
  if (!team) return null;

  const height = rank === 1 ? 'h-32 sm:h-40' : rank === 2 ? 'h-24 sm:h-32' : 'h-20 sm:h-28';
  const color =
    rank === 1
      ? 'bg-yellow-500/20 border-yellow-500/50'
      : rank === 2
        ? 'bg-slate-300/20 border-slate-300/50'
        : 'bg-amber-700/20 border-amber-700/50';
  const text = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-300' : 'text-amber-700';

  return (
    <div className="flex flex-col items-center justify-end">
      <div className="mb-2 text-center">
        <div className="text-2xl sm:text-3xl mb-1">{TEAM_EMOJIS[team.name] || '🛡️'}</div>
        <div className="font-bold text-xs sm:text-sm px-2 truncate max-w-20 sm:max-w-25">
          {team.name}
        </div>
        <div className={`font-mono text-xs sm:text-sm font-bold ${text}`}>
          {formatNumber((team.points || team.point || 0))}
        </div>
      </div>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 + rank * 0.1, type: 'spring' }}
        className={`w-20 sm:w-28 rounded-t-lg border-t-2 border-x-2 flex items-start justify-center pt-2 sm:pt-4 ${height} ${color}`}
      >
        <span className={`text-xl sm:text-2xl font-black ${text}`}>{rank}</span>
      </motion.div>
    </div>
  );
};

export function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [week, setWeek] = useState('1');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await apiClient.get('/leaderboard');
        const data = res.data.leaderboard || res.data;

        const sortedTeams = (data.teams || []).sort(
          (a: Team, b: Team) => ((b.points || b.point || 0) - (a.points || a.point || 0))
        );

        const sortedUsers = (data.topUsers || []).sort(
          (a: User, b: User) => ((b.points || b.totalPoints || 0) - (a.points || a.totalPoints || 0))
        );

        setTeams(sortedTeams);
        setTopUsers(sortedUsers);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const top3 = teams.slice(0, 3);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 sm:space-y-8">
      <div className="text-center space-y-2">
        <h1 className="inline-block text-3xl font-bold text-gradient sm:text-4xl">
          League Standings
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">Global rankings for Season 1</p>
      </div>

      {teams.length >= 3 && (
        <div className="overflow-x-auto pb-2">
          <div className="mx-auto flex min-w-[20rem] items-end justify-center gap-1.5 pt-8 sm:min-w-0 sm:gap-6 sm:pt-12 sm:pb-4">
            {top3[1] && <PodiumStep team={top3[1]} rank={2} />}
            {top3[0] && <PodiumStep team={top3[0]} rank={1} />}
            {top3[2] && <PodiumStep team={top3[2]} rank={3} />}
          </div>
        </div>
      )}

      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="mx-auto mb-6 grid w-full max-w-full grid-cols-3 sm:mb-8 sm:max-w-100">
          <TabsTrigger value="teams" className="px-2 text-xs sm:text-sm">
            Teams
          </TabsTrigger>
          <TabsTrigger value="individual" className="px-2 text-xs sm:text-sm">
            Individual
          </TabsTrigger>
          <TabsTrigger value="weekly" className="px-2 text-xs sm:text-sm">
            Weekly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-secondary/50">
                  <tr>
                    <th className="px-3 py-3 sm:px-6 sm:py-4">Rank</th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4">Team</th>
                    <th className="px-3 py-3 text-right sm:px-6 sm:py-4">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, i) => (
                    <motion.tr
                      key={team.id || team.name}
                      initial={{ opacity: 1, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="border-b last:border-0 hover:bg-secondary/20"
                    >
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold sm:text-lg">{i + 1}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold sm:px-6 sm:py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg sm:text-xl">
                            {TEAM_EMOJIS[team.name] || '🛡️'}
                          </span>
                          <span>{team.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-primary sm:px-6 sm:py-4">
                        {formatNumber(team.points || team.point || 0)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-secondary/50">
                  <tr>
                    <th className="px-3 py-3 sm:px-6 sm:py-4">Rank</th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4">Student</th>
                    <th className="px-3 py-3 sm:px-6 sm:py-4">Team</th>
                    <th className="px-3 py-3 text-right sm:px-6 sm:py-4">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((student: User, i) => (
                    <motion.tr
                      key={student.id || student.name}
                      initial={{ opacity: 1, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="border-b last:border-0"
                    >
                      <td className="px-3 py-3 font-bold sm:px-6 sm:py-4">
                        {i === 0 ? (
                          <Medal className="w-5 h-5 text-yellow-500" />
                        ) : (
                          i + 1
                        )}
                      </td>
                      <td className="px-3 py-3 font-medium sm:px-6 sm:py-4">{student.name}</td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        {student.teamId ? (
                          (() => {
                            const foundTeam = teams.find(t => t.id === student.teamId);
                            const tName = foundTeam ? foundTeam.name : (student.team || 'Unknown');
                            return (
                              <span className="flex items-center gap-1 text-xs px-2 py-1 bg-secondary rounded-full w-fit">
                                {TEAM_EMOJIS[tName] || '🛡️'}
                                {tName}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-primary sm:px-6 sm:py-4">
                        {formatNumber(student.points || student.totalPoints || 0)}
                      </td>
                    </motion.tr>
                  ))}
                  {topUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">
                        No scholars ranked yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold">Weekly Standings</h3>
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger className="w-full sm:w-45">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3].map((w) => (
                  <SelectItem key={w} value={w.toString()}>
                    Week {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground sm:p-12">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Weekly snapshot data for Week {week} would appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
