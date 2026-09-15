import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { User } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TEAM_EMOJIS, getInitials, formatNumber } from '@/lib/utils';
import { Trophy, Star, Activity, Settings, Edit3, Target } from 'lucide-react';
import { Link } from 'react-router';




export interface ProfileActivity {
  id: string;
  action?: string;
  type?: string;
  subject?: string;
  description?: string;
  points?: string;
  pointsEarned?: number | string;
  date?: string;
  createdAt?: string;
}

const ACHIEVEMENTS = [
  {
    id: 'registered',
    title: 'League Initiate',
    description: 'Registered for the MIVA Study League',
    emoji: '🎓',
    colorClass: 'bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
    isEarned: (user: User | null) => !!user,
  },
  {
    id: 'joined_team',
    title: 'Team Player',
    description: 'Joined a team in the League',
    emoji: '🤝',
    colorClass: 'bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800',
    isEarned: (user: User | null) => !!user?.teamId,
  },
  {
    id: 'first_mission',
    title: 'First Blood',
    description: 'Completed your first mission',
    emoji: '🩸',
    colorClass: 'bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800',
    isEarned: (user: User | null) => (user?.points || user?.totalPoints || 0) > 0,
  }
];

export function Profile() {
  const { user } = useAuthStore();
  const teamName = user?.team || 'Unknown';
  const [rank, setRank] = useState<number | null>(null);
  const [activities, setActivities] = useState<ProfileActivity[]>([]);
  const [analyticsData, setAnalyticsData] = useState<{date: string, xp: number}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/leaderboard');
        const data = res.data.leaderboard || res.data;
        const allUsers = data.topUsers || [];
        if (user?.id) {
          const userRank = allUsers.findIndex((u: User & { _id?: string }) => u.id === user.id || u._id === user.id) + 1;
          setRank(userRank > 0 ? userRank : null);
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      }
      
      try {
        const actRes = await apiClient.get('/activities');
        setActivities(actRes.data.activities || []);
      } catch (err) {
        console.error('Failed to load activities', err);
      }
      
      try {
        const analyticsRes = await apiClient.get('/users/me/analytics');
        setAnalyticsData(analyticsRes.data.timeline || []);
      } catch (err) {
        console.error('Failed to load analytics', err);
        // Fallback dummy data so UI renders while backend is being built
        setAnalyticsData([
          { date: 'Week 1', xp: 50 },
          { date: 'Week 2', xp: 200 },
          { date: 'Week 3', xp: 450 },
          { date: 'Week 4', xp: (user?.points || user?.totalPoints || 500) }
        ]);
      }
    };
    fetchData();
  }, [user?.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 1, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-card p-8 rounded-2xl border shadow-sm"
      >
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border-4 border-background shadow-lg">
            {user?.name ? getInitials(user.name) : 'ST'}
          </div>
          <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-md transition-transform hover:scale-110">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{user?.name || 'Student Name'}</h1>
            <p className="text-muted-foreground">{user?.email || 'student@miva.edu'}</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <Badge variant="default" className="text-sm py-1 px-3">
              ID: {user?.matricNumber || 'Unknown'}
            </Badge>
            <Badge className="text-sm py-1 px-3 bg-primary/10 text-primary hover:bg-primary/20 border-0 flex items-center gap-1">
              {TEAM_EMOJIS[teamName]} Team {teamName}
            </Badge>
            {(user as any)?.isCaptain && (
              <Badge className="text-sm py-1 px-3 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/30 flex items-center gap-1">
                👑 Captain
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Link to="/settings">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Total Points</span>
                </div>
                <span className="font-bold text-lg">{formatNumber(user?.points || user?.totalPoints || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="font-medium">Global Rank</span>
                </div>
                <span className="font-bold text-lg">{rank ? `#${rank}` : '-'} </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Missions</span>
                </div>
                <span className="font-bold text-lg">-</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {ACHIEVEMENTS.map((achievement) => {
                  const earned = achievement.isEarned(user);
                  return (
                    <div
                      key={achievement.id}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm border transition-all cursor-help",
                        earned 
                          ? achievement.colorClass 
                          : "bg-secondary/50 border-border opacity-50 grayscale hover:grayscale-0 hover:opacity-80"
                      )}
                      title={`${achievement.title} - ${achievement.description}${!earned ? ' (Locked)' : ''}`}
                    >
                      {earned ? achievement.emoji : '🔒'}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Column */}
        <div className="md:col-span-2 space-y-6">
          {/* XP Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> XP Growth Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <defs>
                      <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorXp)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted ml-3 space-y-8 pb-4">
                {activities.length === 0 && <p className="text-muted-foreground text-sm">No recent activity found.</p>}
                {activities.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 1, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-6"
                  >
                    <span className="absolute -left-[5px] top-1.5 w-[10px] h-[10px] rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm">{item.action || item.type || 'Activity'}</h4>
                      <span className="text-xs text-muted-foreground">{item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{item.subject || item.description || ''}</span>
                      <span
                        className={cn(
                          'font-bold font-mono',
                          (item.points || item.pointsEarned) ? 'text-green-500' : 'text-muted-foreground',
                        )}
                      >
                        {item.points ? `+${item.points}` : (item.pointsEarned ? `+${item.pointsEarned}` : '-')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
