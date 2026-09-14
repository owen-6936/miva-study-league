import type { Season, Team, Mission } from "@/lib/api/types";
import { motion } from 'motion/react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';

import { useEffect, useState } from 'react';
import { cn, TEAM_COLORS, TEAM_EMOJIS, formatNumber } from '@/lib/utils';
import {
  Trophy,
  Star,
  Pencil,
  TrendingUp,
  Clock,
  Activity,
  ChevronRight,
  Zap,
  Shield,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router';
import { TeamSelectionModal } from '@/components/dashboard/team-selection';

// Basic UI imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock AnimatedCounter
const AnimatedCounter = ({ value }: { value: number }) => {
  return <span>{formatNumber(value)}</span>;
};

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now();
      if (difference <= 0) return 'Expired';

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000); // Update every second
    return () => clearInterval(timer);
  }, [targetDate]);

  return <span className="font-mono">{timeLeft}</span>;
};

function getRelativeTime(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}


export interface DashboardActivity {
  id: string;
  type: 'mission' | 'join' | 'other' | 'MISSION_COMPLETED' | 'MISSION_UPDATED' | string;
  user?: string;
  action?: string;
  target?: string;
  message?: string;
  time: string;
  createdAt: string;
}

export interface DashboardAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
  expiresAt?: string;
}

export function Dashboard() {

  const { user } = useAuthStore();

  const [topTeams, setTopTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState({ teamRank: 0, personalPoints: 0, weekProgress: 0 });
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [announcements, setAnnouncements] = useState<DashboardAnnouncement[]>([]);
  const [season, setSeason] = useState<Season | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await apiClient.get('/leaderboard');
        const data = res.data.leaderboard || res.data;
        const allTeams: Team[] = data.teams || [];
        setTopTeams(allTeams.slice(0, 3));
        
        // Calculate team rank dynamically
        if (useAuthStore.getState().user?.teamId) {
          const rank = allTeams.findIndex((t) => t.id === useAuthStore.getState().user?.teamId) + 1;
          setStats(prev => ({ ...prev, teamRank: rank > 0 ? rank : 0 }));
        }
      } catch (error) {
        console.error('Failed to load leaderboard data', error);
      }

      try {
        const missionRes = await apiClient.get('/missions/current');
        const missions = missionRes.data.missions || [];
        if (missions.length > 0) {
          setCurrentMission(missions[0]);
        }
      } catch (error) {
        console.error('Failed to load current mission', error);
      }
      try {
        const actRes = await apiClient.get('/activities');
        setActivities(actRes.data.activities || []);
      } catch (error) {
        console.error('Failed to load activities', error);
      }
      try {
        const res = await apiClient.get('/seasons');
        const data = res.data.season || res.data.seasons?.[0] || res.data?.[0] || res.data;
        if (data) setSeason(data);
      } catch (error) {
        console.error('Failed to load season', error);
      }
      try {
        const res = await apiClient.get('/announcements');
        const fetched = res.data.announcements || res.data || [];
        const activeOnly = fetched.filter((a: DashboardAnnouncement) => !a.expiresAt || new Date(a.expiresAt) > new Date());
        setAnnouncements(activeOnly);
      } catch (error) {
        console.error('Failed to load announcements', error);
      }
    };
    fetchDashboardData();
  }, []);

  const maxPoints = Math.max(topTeams[0]?.point || 1, 1000);
  const teamName = user?.team || 'Alpha';
  const teamEmoji = TEAM_EMOJIS[teamName] || '🏆';

  let weekLabel = 'Loading...';
  if (season) {
    if (season.isActive === false) {
      weekLabel = 'League on Break';
    } else if (
      season.academicStartDate &&
      new Date(season.academicStartDate).getTime() > Date.now()
    ) {
      weekLabel = 'Pre-season (Starts Soon)';
    } else {
      const currentWeek =
        Math.floor(
          (Date.now() - new Date(season.academicStartDate).getTime()) / (1000 * 60 * 60 * 24 * 7),
        ) + 1;
      const totalWeeks = season.totalWeeks || 12;
      if (currentWeek > totalWeeks) {
        weekLabel = 'Season Ended';
      } else {
        weekLabel = `Week ${currentWeek} of ${totalWeeks}`;
      }
    }
  }

  return (
    <div className="space-y-6">
      <TeamSelectionModal />

      {/* Welcome Banner */}

      {/* Pre-season Countdown Banner */}
      {season &&
        season.isActive &&
        season.academicStartDate &&
        new Date(season.academicStartDate).getTime() > Date.now() && (
          <motion.div
            initial={{ opacity: 1, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary">Pre-season is underway!</h3>
                <p className="text-sm text-muted-foreground">
                  Get your teams assembled. The league officially begins in:
                </p>
              </div>
            </div>
            <div className="bg-background px-4 py-2 rounded-lg border border-border shadow-inner font-mono text-xl font-bold text-primary">
              <CountdownTimer targetDate={season.academicStartDate} />
            </div>
          </motion.div>
        )}
      <motion.div
        initial={{ opacity: 1, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary to-primary-hover p-8 text-primary-foreground shadow-lg"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Badge
              variant="default"
              className="mb-4 bg-black/15 text-primary-foreground hover:bg-black/25 backdrop-blur-md"
            >
              {weekLabel}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-primary-foreground/85 text-lg flex items-center gap-2">
              Representing{' '}
              <span className="font-semibold">
                {teamEmoji} Team {teamName}
              </span>
            </p>
          </div>
          <div className="hidden md:block opacity-20">
            <Trophy size={120} />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Team Rank',
            value: stats.teamRank || '-',
            prefix: '#',
            icon: Trophy,
            color: 'text-yellow-500',
          },
          {
            title: 'Personal Points',
            value: user?.points || user?.totalPoints || 0,
            icon: Star,
  Pencil,
            color: 'text-blue-500',
          },
          {
            title: 'Week Progress',
            value: stats.weekProgress || 0,
            suffix: '%',
            icon: TrendingUp,
            color: 'text-green-500',
            isProgress: true,
          },
          {
            title: 'Next Challenge',
            value: 'Saturday',
            icon: Clock,
            color: 'text-purple-500',
            isTimer: true,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <div className="text-2xl font-bold mb-2">
                  {stat.isProgress ? (
                    `${stat.value}${stat.suffix}`
                  ) : stat.isTimer ? (
                    currentMission?.deadline ? (
                      <CountdownTimer targetDate={currentMission.deadline} />
                    ) : (
                      <span className="text-base text-muted-foreground font-normal">N/A</span>
                    )
                  ) : (
                    <>
                      {stat.prefix}
                      {typeof stat.value === 'number' && stat.value > 0 ? (
                        <AnimatedCounter value={stat.value} />
                      ) : (
                        '-'
                      )}
                    </>
                  )}
                </div>
                {stat.isProgress && <Progress value={stat.value as number} className="h-2" />}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements Card */}
          {announcements && announcements.length > 0 && (
            <motion.div
              initial={{ opacity: 1, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Megaphone className="w-5 h-5" /> Official Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.map(
                      (
                        ann,
                        i: number,
                      ) => (
                        <div key={i} className="flex gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold">{ann.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {ann.content}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Current Mission Card */}
          <motion.div
            initial={{ opacity: 1, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Current Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentMission ? (
                  <>
                    <div className="mb-4">
                      <h3 className="text-lg font-bold">{currentMission.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Course: {currentMission.courseId}
                      </p>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>
                          Progress: {currentMission.tasks?.length || 0}/
                          {currentMission.tasks?.length || 1} tasks
                        </span>
                        <span className="font-medium">
                          {Math.round(
                            ((currentMission.tasks?.length || 0) /
                              (currentMission.tasks?.length || 1)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          ((currentMission.tasks?.length || 0) /
                            (currentMission.tasks?.length || 1)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Link
                        to={`/missions/${currentMission.id || 'current'}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                      >
                        View Mission <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      No active missions right now. Take a breather!
                    </p>
                    <Button variant="outline" disabled>
                      Check Back Later
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Challenge Card */}
          <motion.div
            initial={{ opacity: 1, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Live Challenge Approaching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold mb-2">Saturday Showdown</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Rounds: Quick Fire, Problem Battle, Team Challenge
                </p>
                <Button variant="primary" className="w-full sm:w-auto">
                  Enter Arena
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Live Leaderboard Widget */}
          <motion.div
            initial={{ opacity: 1, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Top Teams</span>
                  <Link
                    to="/leaderboard"
                    className="text-sm font-normal text-primary hover:underline"
                  >
                    View Full →
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {topTeams.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4 animate-pulse">
                    Loading standings...
                  </div>
                )}
                {topTeams.map((team, i) => (
                  <div key={team.id || team.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium flex items-center gap-1">
                        <span className="w-4 text-muted-foreground">{i + 1}.</span>
                        {TEAM_EMOJIS[team.name]} {team.name}
                      </span>
                      <span className="font-bold">{formatNumber(team.points || team.point || 0)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((team.points || team.point || 0) / maxPoints) * 100}%` }}
                        className={cn(
                          'h-full rounded-full',
                          TEAM_COLORS[team.name]?.bg.replace('/10', ''),
                        )}
                        style={{ backgroundColor: `var(--color-${team.name.toLowerCase()})` }} // fallback
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 1, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {activities.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground text-sm">No recent activity.</p>
                  </div>
                )}
                {activities.map((activity, i) => {
                  let Icon = Star;
                  let color = 'text-blue-500';
                  if (activity.type === 'mission') {
                    Icon = Zap;
                    color = 'text-yellow-500';
                  }
                  if (activity.type === 'join') {
                    Icon = Shield;
                    color = 'text-green-500';
                  }
                  if (activity.type === 'MISSION_COMPLETED' || activity.action === 'MISSION_COMPLETED') {
                    Icon = Trophy;
                    color = 'text-yellow-400';
                  }
                  if (activity.type === 'MISSION_UPDATED' || activity.action === 'MISSION_UPDATED') {
                    Icon = Pencil;
                    color = 'text-blue-400';
                  }

                  return (
                    <motion.div
                      key={activity.id || i}
                      initial={{ opacity: 1, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex gap-3 items-start"
                    >
                      <div className={cn('mt-0.5 p-1.5 rounded-full bg-secondary', color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.message || `${activity.user || ""} ${activity.action || ""} ${activity.target || ""}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(activity.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
