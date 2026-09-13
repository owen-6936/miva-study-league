import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TEAM_EMOJIS, getInitials, formatNumber } from '@/lib/utils';
import { Trophy, Star, Activity, Settings, Edit3, Target } from 'lucide-react';
import { Link } from 'react-router';

const MOCK_ACTIVITY = [
  { id: 1, action: 'Completed Mission', subject: 'Math Wars', points: '+150', date: '2 hours ago' },
  {
    id: 2,
    action: 'Answered correctly',
    subject: 'Quick Fire Round',
    points: '+25',
    date: '1 day ago',
  },
  {
    id: 3,
    action: 'Earned Achievement',
    subject: 'Speed Demon',
    points: '+500',
    date: '3 days ago',
  },
  { id: 4, action: 'Joined Team', subject: 'Alpha', points: '0', date: '2 weeks ago' },
];

export function Profile() {
  const { user } = useAuthStore();
  const teamName = user?.team || 'Alpha';

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
              ID: {user?.id || 'MIVA-1042'}
            </Badge>
            <Badge className="text-sm py-1 px-3 bg-primary/10 text-primary hover:bg-primary/20 border-0 flex items-center gap-1">
              {TEAM_EMOJIS[teamName]} Team {teamName}
            </Badge>
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
                <span className="font-bold text-lg">{formatNumber(1250)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="font-medium">Global Rank</span>
                </div>
                <span className="font-bold text-lg">#42</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Missions</span>
                </div>
                <span className="font-bold text-lg">14/15</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div
                  className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-xl shadow-sm border border-yellow-200"
                  title="First Blood"
                >
                  🩸
                </div>
                <div
                  className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl shadow-sm border border-blue-200"
                  title="Speed Demon"
                >
                  ⚡
                </div>
                <div
                  className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl shadow-sm border border-purple-200"
                  title="Team Player"
                >
                  🤝
                </div>
                <div
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl shadow-sm border border-gray-200 opacity-50"
                  title="Locked"
                >
                  🔒
                </div>
                <div
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl shadow-sm border border-gray-200 opacity-50"
                  title="Locked"
                >
                  🔒
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted ml-3 space-y-8 pb-4">
                {MOCK_ACTIVITY.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 1, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-6"
                  >
                    <span className="absolute -left-[5px] top-1.5 w-[10px] h-[10px] rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm">{item.action}</h4>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{item.subject}</span>
                      <span
                        className={cn(
                          'font-bold font-mono',
                          item.points !== '0' ? 'text-green-500' : 'text-muted-foreground',
                        )}
                      >
                        {item.points !== '0' ? item.points : '-'}
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
