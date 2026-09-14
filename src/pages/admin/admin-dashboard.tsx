import type { Season } from "@/lib/api/types";
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Users, Shield, Target, Zap, ChevronRight, Calendar, Loader2, Trash2, Award, Megaphone } from 'lucide-react';
import { Link } from 'react-router';
import { apiClient } from '@/lib/api/client';
import { getApiError } from '@/lib/api/client';
import { toast } from 'sonner';

export interface AdminActivity {
  text: string;
  time: string;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTeams: 0,
    activeMissions: 0,
    totalSubmissions: 0,
    userTrend: 0,
    submissionTrend: 0
  });
  const [activities, setActivities] = useState<AdminActivity[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/admin/stats');
        if (res.data) {
          setStats({
            totalUsers: res.data.totalUsers || 0,
            activeTeams: res.data.activeTeams || 0,
            activeMissions: res.data.activeMissions || 0,
            totalSubmissions: res.data.totalSubmissions || 0,
            userTrend: res.data.userTrend || 0,
            submissionTrend: res.data.submissionTrend || 0,
          });
        }
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      }
      
      try {
        const actRes = await apiClient.get('/admin/activities');
        if (actRes.data) {
          setActivities(actRes.data.activities || actRes.data || []);
        }
      } catch (error) {
        console.error('Failed to load admin activities:', error);
      }
    };
    fetchStats();
  }, []);
  const [season, setSeason] = useState<Season | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(12);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchSeason();
  }, []);

  const fetchSeason = async () => {
    try {
      const res = await apiClient.get('/seasons');
      // If it returns an array or an object
      const data = res.data.season || res.data.seasons?.[0] || res.data[0] || res.data;
      if (data && data.academicStartDate) {
        // Sanitize the ID if it comes back as _id
        const sanitized = { ...data, id: data.id || data._id };
        setSeason(sanitized);
        setStartDate(data.academicStartDate.split('T')[0]); // Just get YYYY-MM-DD
        setSeasonNumber(data.seasonNumber || 1);
        setTotalWeeks(data.totalWeeks || 12);
        setIsActive(data.isActive !== false);
      }
    } catch {
      console.log('No season found or error fetching');
    }
  };

  let weekLabel = '⚠️ Configure Season';
  if (season) {
    if (season.isActive === false) {
      weekLabel = `Season ${season.seasonNumber} • Paused`;
    } else if (
      season.academicStartDate &&
      new Date(season.academicStartDate).getTime() > Date.now()
    ) {
      weekLabel = `Season ${season.seasonNumber} • Pre-season`;
    } else {
      const currentWeek =
        Math.floor(
          (Date.now() - new Date(season.academicStartDate).getTime()) / (1000 * 60 * 60 * 24 * 7),
        ) + 1;
      const totalWeeks = season.totalWeeks || 12;
      if (currentWeek > totalWeeks) {
        weekLabel = `Season ${season.seasonNumber} • Ended`;
      } else {
        weekLabel = `Season ${season.seasonNumber} • Week ${currentWeek}`;
      }
    }
  }

  const handleUpdateSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Convert YYYY-MM-DD to full ISO starting at midnight
      const isoDate = new Date(`${startDate}T00:00:00Z`).toISOString();
      const payload = {
        academicStartDate: isoDate,
        seasonNumber: seasonNumber,
        totalWeeks: totalWeeks,
        isActive: isActive,
      };

      if (season && (season.id)) {
        await apiClient.put(`/seasons/update/${season.id}`, payload);
        toast.success('Season Configuration Updated!');
      } else {
        await apiClient.post('/seasons/create', payload);
        toast.success('Season Configuration Created!');
      }

      setIsConfigOpen(false);
      fetchSeason();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to update season'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeason = async () => {
    if (!season || !(season.id)) return;
    if (!confirm('Are you sure you want to completely delete this season configuration?')) return;

    try {
      await apiClient.delete(`/seasons/delete/${season.id}`);
      toast.success('Season Deleted');
      setSeason(null);
      setIsConfigOpen(false);
      // Reset form
      setStartDate('');
      setSeasonNumber(1);
      setTotalWeeks(12);
      setIsActive(true);
    } catch (error) {
      toast.error(getApiError(error, 'Failed to delete season'));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the MIVA Study League platform.</p>
        </div>
        <button
          onClick={() => setIsConfigOpen(true)}
          className="flex items-center gap-2 bg-surface hover:bg-surface/80 transition-colors px-4 py-2 rounded-lg border border-primary/50 cursor-pointer shadow-sm"
        >
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{weekLabel}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} trend={stats.userTrend} />
        <StatCard title="Active Teams" value={stats.activeTeams} icon={<Shield />} />
        <StatCard title="Active Missions" value={stats.activeMissions} icon={<Target />} />
        <StatCard title="Submissions" value={stats.totalSubmissions} icon={<Zap />} trend={stats.submissionTrend} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold font-heading">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Manage Missions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create, edit, or publish weekly tasks.
                  </p>
                  <Link to="/admin/missions" className="w-full flex-1">
                    <Button variant="outline" className="w-full">
                      View Missions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-3 bg-destructive/10 rounded-lg text-destructive">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Live Challenges</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Control Saturday sessions and rounds.
                  </p>
                  <Link to="/admin/challenges" className="w-full flex-1">
                    <Button variant="outline" className="w-full">
                      Manage Challenges
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Score Entry</h3>
                  <p className="text-sm text-muted-foreground mb-4">Manually update team points.</p>
                  <Link to="/admin/submissions" className="w-full flex-1">
                    <Button variant="outline" className="w-full justify-start gap-2 h-14 bg-surface hover:bg-primary/5 hover:text-primary transition-colors border-primary/20">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold">Review Submissions</span>
                        <span className="text-xs text-muted-foreground">Grade manual tasks</span>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/admin/announcements" className="w-full flex-1">
                    <Button variant="outline" className="w-full justify-start gap-2 h-14 bg-surface hover:bg-primary/5 hover:text-primary transition-colors border-primary/20">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <Megaphone className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold">Broadcast Center</span>
                        <span className="text-xs text-muted-foreground">Manage announcements</span>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/admin/scores" className="w-full flex-1">
                    <Button variant="outline" className="w-full">
                      Enter Scores
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Timetable</h3>
                  <p className="text-sm text-muted-foreground mb-4">Update the school schedule.</p>
                  <Link to="/admin/timetable" className="w-full flex-1">
                    <Button variant="outline" className="w-full">
                      Manage Timetable
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">User & Teams</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage students and team rosters.
                  </p>
                  <div className="flex gap-2 w-full">
                    <Link to="/admin/users" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Users
                      </Button>
                    </Link>
                    <Link to="/admin/teams" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Teams
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold font-heading">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {activities.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No recent activity.
                  </div>
                )}
                {activities.map((act, i) => (
                  <div key={i} className="p-4 flex flex-col gap-1">
                    <p className="text-sm font-medium">{act.text}</p>
                    <p className="text-xs text-muted-foreground">{act.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border">
                <Button variant="ghost" className="w-full text-sm">
                  View All Logs <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="League Configuration"
      >
        <form onSubmit={handleUpdateSeason} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Season Number</Label>
              <Input
                type="number"
                min="1"
                required
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Weeks</Label>
              <Input
                type="number"
                min="1"
                required
                value={totalWeeks}
                onChange={(e) => setTotalWeeks(parseInt(e.target.value) || 12)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Academic Start Date (Week 1)</Label>
            <Input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              The system will automatically calculate the current week using this date.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">League Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Turn this off to pause the league during holidays or academic breaks.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex gap-3 mt-6">
            {season && (season.id) && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-10 h-10 p-0 flex items-center justify-center"
                onClick={handleDeleteSeason}
                title="Delete Season"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {season ? 'Update Configuration' : 'Create Configuration'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
