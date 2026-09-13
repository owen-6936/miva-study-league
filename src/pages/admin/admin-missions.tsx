import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { Mission } from '@/lib/api/types';
import type { Column } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { getApiError } from '@/lib/api/client';
import { toast } from 'sonner';

export function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    description: '',
    tasksTotal: 10,
    pointsPerTask: 10,
    completionBonus: 50,
    deadline: '',
  });

  const fetchMissions = async () => {
    try {
      const res = await apiClient.get('/missions');
      setMissions(res.data.missions || res.data || []);
    } catch (error) {
      toast.error(getApiError(error, 'Failed to load missions'));
    } finally {
      // cleanup
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Convert local datetime to ISO string before sending
      const isoDeadline = new Date(formData.deadline).toISOString();

      await apiClient.post('/missions/create', {
        ...formData,
        deadline: isoDeadline,
      });

      toast.success('Mission created successfully!');
      setIsModalOpen(false);
      fetchMissions();

      // Reset form
      setFormData({
        title: '',
        courseId: '',
        description: '',
        tasksTotal: 10,
        pointsPerTask: 10,
        completionBonus: 50,
        deadline: '',
      });
    } catch (error) {
      toast.error(getApiError(error, 'Failed to create mission'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mission?')) return;
    try {
      await apiClient.delete(`/missions/delete/${id}`);
      toast.success('Mission deleted');
      fetchMissions();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to delete mission'));
    }
  };

  const columns: Column<Mission>[] = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (row: Mission) => <span className="font-medium">{row.title}</span>,
    },
    { header: 'Course', accessorKey: 'courseId' },
    {
      header: 'Tasks',
      accessorKey: 'tasksTotal',
      cell: (row: Mission) => `${row.tasksTotal} tasks`,
    },
    {
      header: 'Points',
      accessorKey: 'pointsPerTask',
      cell: (row: Mission) => `${row.pointsPerTask} pt/ea`,
    },
    {
      header: 'Deadline',
      accessorKey: 'deadline',
      cell: (row: Mission) =>
        row.deadline ? new Date(row.deadline).toLocaleDateString() : 'No deadline',
    },
    {
      header: 'Actions',
      cell: (row: Mission) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading">Missions</h1>
          <p className="text-muted-foreground">Create and manage weekly asynchronous missions.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Mission
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            keyExtractor={(item) => item.id}
            columns={columns}
            data={missions}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Mission"
        className="max-w-2xl"
      >
        <form className="space-y-4" onSubmit={handleCreateMission}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Math Wars: Algebra"
              />
            </div>
            <div className="space-y-2">
              <Label>Course ID</Label>
              <Input
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                placeholder="e.g. MTH101"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Tasks/Questions</Label>
              <Input
                required
                type="number"
                min="1"
                value={formData.tasksTotal}
                onChange={(e) =>
                  setFormData({ ...formData, tasksTotal: parseInt(e.target.value) || 10 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Points Per Task</Label>
              <Input
                required
                type="number"
                min="1"
                value={formData.pointsPerTask}
                onChange={(e) =>
                  setFormData({ ...formData, pointsPerTask: parseInt(e.target.value) || 10 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Completion Bonus</Label>
              <Input
                required
                type="number"
                min="0"
                value={formData.completionBonus}
                onChange={(e) =>
                  setFormData({ ...formData, completionBonus: parseInt(e.target.value) || 50 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                required
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
              placeholder="Describe the mission..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Publish Mission
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
