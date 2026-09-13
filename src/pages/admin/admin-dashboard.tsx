import type { Season } from "@/lib/api/types";
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Users, Shield, Target, Zap, ChevronRight, Calendar, Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { apiClient } from '@/lib/api/client';
import { getApiError } from '@/lib/api/client';
import { toast } from 'sonner';

export function AdminDashboardPage() {
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
        setSeason(data);
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
      weekLabel = `Season ${season.name} • Paused`;
    } else if (
      season.startDate &&
      new Date(season.startDate).getTime() > Date.now()
    ) {
      weekLabel = `Season ${season.name} • Pre-season`;
    } else {
      const currentWeek =
        Math.floor(
          (Date.now() - new Date(season.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7),
        ) + 1;
      const totalWeeks = season.totalWeeks || 12;
      if (currentWeek > totalWeeks) {
        weekLabel = `Season ${season.name} • Ended`;
      } else {
        weekLabel = `Season ${season.name} • Week ${currentWeek}`;
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
        <StatCard title="Total Users" value={142} icon={<Users />} trend={12} />
        <StatCard title="Active Teams" value={7} icon={<Shield />} />
        <StatCard title="Active Missions" value={2} icon={<Target />} />
        <StatCard title="Submissions" value={89} icon={<Zap />} trend={5} />
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
              <div className="divide-y divide-border">
                {[
                  { text: 'Team Alpha submitted a solution for Mission 3', time: '10m ago' },
                  { text: 'New user "John Doe" registered', time: '1h ago' },
                  { text: 'Challenge "Week 2 Showdown" ended', time: '2d ago' },
                  { text: 'Scores updated for Team Beta', time: '2d ago' },
                ].map((act, i) => (
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
