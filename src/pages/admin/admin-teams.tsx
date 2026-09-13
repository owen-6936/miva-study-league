import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { TEAM_EMOJIS } from '@/lib/utils';
import { Users, Edit2, ArrowRightLeft, Loader2, Database, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { getApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import type { Team } from '@/lib/api/types';



// Global cache to prevent visual UI flickering
let cachedAdminTeams: Team[] | null = null;

export function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>(cachedAdminTeams || []);
  const [loading, setLoading] = useState(cachedAdminTeams === null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    maxMembers: 7,
    color: 'red',
    emoji: '🛡️',
    slogan: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setFormData({ name: '', maxMembers: 7, color: 'red', emoji: '🛡️', slogan: '' });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      maxMembers: team.maxMembers || 7,
      color: team.color || 'red',
      emoji: team.emoji || '🛡️',
      slogan: team.slogan || '',
    });
    setIsEditOpen(true);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/teams/create', {
        name: formData.name,
        maxMembers: formData.maxMembers,
        color: formData.color,
        emoji: formData.emoji,
      });
      toast.success('Team created successfully!');
      setIsCreateOpen(false);
      fetchTeams();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to create team'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.put(`/teams/update/${editingTeam?.id}`, {
        name: formData.name,
        maxMembers: formData.maxMembers,
        color: formData.color,
        emoji: formData.emoji,
      });
      toast.success('Team updated successfully!');
      setIsEditOpen(false);
      fetchTeams();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to update team'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Are you sure you want to completely delete this team?')) return;

    try {
      await apiClient.delete(`/teams/drop/${id}`);
      toast.success('Team deleted successfully!');
      fetchTeams();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to delete team'));
    }
  };

  const fetchTeams = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const res = await apiClient.get('/teams');
      const fetchedTeams = res.data.teams || res.data || [];
      cachedAdminTeams = fetchedTeams;
      setTeams(fetchedTeams);
    } catch (error) {
      toast.error(getApiError(error, 'Failed to load teams'));
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSeedTeams = async () => {
    setIsSeeding(true);
    try {
      await apiClient.post('/teams/seed');
      toast.success('Teams seeded successfully!');
      fetchTeams(); // Reload the teams
    } catch (error) {
      toast.error(getApiError(error, 'Failed to seed teams'));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading">Teams</h1>
          <p className="text-muted-foreground">Manage team configurations and rosters.</p>
        </div>
        <Button onClick={handleOpenCreate}>Create Team</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : hasError ? (
        <Card className="border-dashed border-2 border-destructive/50 bg-destructive/10">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <h2 className="text-2xl font-bold font-heading text-destructive">Connection Error</h2>
            <p className="text-muted-foreground">Could not reach the server to fetch teams.</p>
            <Button variant="outline" onClick={fetchTeams}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : teams.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-surface/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <Database size={32} />
            </div>
            <h2 className="text-2xl font-bold font-heading">No Teams Found</h2>
            <p className="text-muted-foreground max-w-md">
              The database is currently empty. You can automatically seed the 7 default MIVA Study
              League teams to get started.
            </p>
            <Button size="lg" onClick={handleSeedTeams} disabled={isSeeding} className="mt-4">
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Seeding Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-5 w-5" /> Seed Initial Teams
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="flex flex-col">
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {TEAM_EMOJIS[team.name as keyof typeof TEAM_EMOJIS] || '🛡️'}
                    </div>
                    <CardTitle>{team.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8"
                      onClick={() => handleOpenEdit(team)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 italic">"{team.slogan}"</p>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" /> Members
                  </span>
                  <span className="font-bold">
                    {team.members?.length || 0}/{team.maxMembers || 20}
                  </span>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <ArrowRightLeft className="h-4 w-4" /> Manage Roster
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div className="space-y-2">
            <Label>Team Name</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Omega"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Emoji</Label>
              <Input
                required
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                placeholder="🛡️"
              />
            </div>
            <div className="space-y-2">
              <Label>Color (Tailwind Name)</Label>
              <Input
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="red, blue, etc"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Max Members</Label>
            <Input
              required
              type="number"
              value={formData.maxMembers}
              onChange={(e) =>
                setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 7 })
              }
              min={1}
            />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Team
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Team">
        <form onSubmit={handleEditTeam} className="space-y-4">
          <div className="space-y-2">
            <Label>Team Name</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Emoji</Label>
              <Input
                required
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Max Members</Label>
            <Input
              required
              type="number"
              value={formData.maxMembers}
              onChange={(e) =>
                setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 7 })
              }
              min={1}
            />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}
