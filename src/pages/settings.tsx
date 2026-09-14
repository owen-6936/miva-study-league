import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ThemeName } from '@/lib/stores/theme-store';
import { useThemeStore, THEME_META } from '@/lib/stores/theme-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient, getApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import type { Team } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { Moon, Sun, Monitor, Bell, Lock, Info, CheckCircle2, Shuffle, Loader2 } from 'lucide-react';

export function Settings() {
  const { theme, setTheme, isDark, toggleDark } = useThemeStore();
  const { user, updateUser } = useAuthStore();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  useEffect(() => {
    if ((user?.transferTokens || 0) > 0) {
      apiClient.get('/teams').then(res => {
        setTeams(res.data.teams || res.data || []);
      }).catch(() => {});
    }
  }, [user?.transferTokens]);

  const handleTeamTransfer = async () => {
    if (!selectedTeamId) return toast.error('Please select a team to transfer to.');
    
    setIsTransferring(true);
    try {
      const res = await apiClient.post('/users/transfer-team', { newTeamId: selectedTeamId });
      toast.success('Successfully transferred to your new team!');
      if (res.data?.user) {
        updateUser(res.data.user);
      } else {
        // Fallback optimistic update
        const team = teams.find(t => t.id === selectedTeamId || t._id === selectedTeamId);
        updateUser({ 
          teamId: selectedTeamId, 
          team: team?.name || user?.team,
          transferTokens: (user?.transferTokens || 1) - 1
        });
      }
    } catch (error) {
      toast.error(getApiError(error, 'Failed to transfer team'));
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and app appearance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5" /> Appearance
          </h2>
          <p className="text-sm text-muted-foreground">
            Customize how MIVA Study League looks on your device.
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Select your primary color theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(THEME_META).map(([key, meta]) => {
                  const isActive = theme === key;
                  return (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={key}>
                      <button
                        onClick={() => setTheme(key as ThemeName)}
                        className={cn(
                          'w-full text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden',
                          isActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50',
                        )}
                      >
                        {isActive && (
                          <div className="absolute top-3 right-3 text-primary">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                        <div className="text-3xl mb-2">{meta.emoji}</div>
                        <h4 className="font-semibold">{meta.label}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{meta.description}</p>
                        <div className="flex gap-2"></div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg flex items-center gap-2">
                  {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  Dark Mode
                </h3>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark backgrounds
                </p>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleDark} />
            </CardContent>
          </Card>
        </div>
      </div>

      <hr className="border-border" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications
          </h2>
          <p className="text-sm text-muted-foreground">Control when and how you are notified.</p>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {[
                {
                  id: 'notif-missions',
                  label: 'Mission Updates',
                  desc: 'When new missions are available or graded',
                },
                {
                  id: 'notif-team',
                  label: 'Team Activity',
                  desc: 'When your team scores points or ranks up',
                },
                {
                  id: 'notif-live',
                  label: 'Live Challenges',
                  desc: 'Alerts 15 mins before a live event starts',
                },
                {
                  id: 'notif-sys',
                  label: 'System Announcements',
                  desc: 'Platform updates and maintenance',
                },
              ].map((item, i) => (
                <div key={item.id} className="p-6 flex items-center justify-between">
                  <div className="pr-4">
                    <Label htmlFor={item.id} className="text-base">
                      {item.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                  <Switch id={item.id} defaultChecked={i < 3} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <hr className="border-border" />

      {/* Team Transfer Section */}
      {(user?.transferTokens || 0) > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
                <Shuffle className="w-5 h-5" /> Team Transfer
              </h2>
              <p className="text-sm text-muted-foreground">
                You have {user?.transferTokens} Transfer Token(s). Select a new team below.
              </p>
            </div>
            <div className="md:col-span-2">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Select New Team</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                    >
                      <option value="">-- Choose a Team --</option>
                      {teams.filter(t => (t.id || t._id) !== user?.teamId).map(team => {
                        const isFull = (team.members?.length || 0) >= (team.maxMembers || 6);
                        return (
                          <option key={team.id || team._id} value={team.id || team._id} disabled={isFull}>
                            {team.emoji} {team.name} {isFull ? '(FULL)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <Button 
                    onClick={handleTeamTransfer} 
                    disabled={!selectedTeamId || isTransferring}
                    className="w-full sm:w-auto"
                  >
                    {isTransferring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shuffle className="w-4 h-4 mr-2" />} 
                    Confirm Transfer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          <hr className="border-border" />
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5" /> Security
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your password and secure your account.
          </p>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button className="mt-4">Update Password</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="pt-8 text-center text-muted-foreground space-y-2">
        <Info className="w-5 h-5 mx-auto opacity-50" />
        <p className="text-sm font-medium">MIVA Study League v1.0.0</p>
        <p className="text-xs opacity-75">Built with React, Tailwind v4, and Motion.</p>
      </div>
    </div>
  );
}
