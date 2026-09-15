import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import type { Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { Search, Filter, Loader2, Save, Edit3, Users } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  matricNumber: string;
  team: string | null;
  role: 'admin' | 'student';
  verified: boolean;
  teamTransferTokens?: number;
  _id?: string;
  isCaptain?: boolean;
}

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGranting, setIsGranting] = useState<string | null>(null);
  const [editingTokens, setEditingTokens] = useState<Record<string, string>>({});
  const [bulkTokenLoading, setBulkTokenLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data.users || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSetTokens = async (userId: string) => {
    const amount = editingTokens[userId];
    if (amount === undefined) return;
    
    setIsGranting(userId);
    try {
      await apiClient.patch(`/admin/users/${userId}/tokens`, { teamTransferTokens: Number(amount) });
      toast.success('Transfer tokens updated!');
      setUsers(users.map(u => (u.id === userId || u._id === userId) ? { ...u, transferTokens: Number(amount) } : u));
      const newEditing = { ...editingTokens };
      delete newEditing[userId];
      setEditingTokens(newEditing);
    } catch {
      toast.error('Failed to update tokens');
    } finally {
      setIsGranting(null);
    }
  };

  const handleBulkResetTokens = async () => {
    const amount = window.prompt("Enter the exact number of transfer tokens to give EVERY student (e.g., 0 to reset, 1 for a new week):", "0");
    if (amount === null || isNaN(Number(amount))) return;
    
    setBulkTokenLoading(true);
    try {
      await apiClient.post(`/admin/users/bulk-tokens`, { teamTransferTokens: Number(amount) });
      toast.success(`Successfully set every student's tokens to ${amount}`);
      setUsers(users.map(u => ({ ...u, transferTokens: Number(amount) })));
    } catch {
      toast.error('Failed to run bulk token update');
    } finally {
      setBulkTokenLoading(false);
    }
  };
  const columns: Column<AdminUserRow>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Matric', accessorKey: 'matricNumber' },
    {
      header: 'Team',
      cell: (row) => (
        <Badge
          variant="default"
          className={
            row.team
              ? 'bg-primary/20 text-primary hover:bg-primary/30 border-transparent'
              : 'bg-muted text-muted-foreground border-transparent'
          }
        >
          {row.team || 'Unassigned'}
        </Badge>
      ),
    },
    {
      header: 'Role',
      cell: (row) => (
        <Badge
          variant="default"
          className={row.role === 'admin' ? 'border-destructive text-destructive' : ''}
        >
          {row.role}
        </Badge>
      ),
    },
    {
      header: 'Verified',
      cell: (row) => (
        <Badge
          variant="default"
          className={
            row.verified
              ? 'bg-green-500/20 text-green-500 border-transparent'
              : 'bg-amber-500/20 text-amber-500 border-transparent'
          }
        >
          {row.verified ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      header: 'Tokens',
      cell: (row) => {
        const rowId = row.id || row._id!;
        const isEditing = editingTokens[rowId] !== undefined;
        return isEditing ? (
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              className="w-16 h-8 text-xs font-mono" 
              value={editingTokens[rowId]} 
              onChange={e => setEditingTokens({ ...editingTokens, [rowId]: e.target.value })}
              autoFocus
            />
            <Button size="sm" className="h-8 w-8 p-0" onClick={() => handleSetTokens(rowId)} disabled={isGranting === rowId}>
              {isGranting === rowId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold w-6">{row.teamTransferTokens || 0}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary" onClick={() => setEditingTokens({ ...editingTokens, [rowId]: String(row.teamTransferTokens || 0) })}>
              <Edit3 className="w-3 h-3" />
            </Button>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/users/${row.id || row._id}/progress`}>
            <Button variant="outline" size="sm" className="text-xs border-primary/20 hover:bg-primary/10 h-8">
              View Progress
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Users</h1>
        <p className="text-muted-foreground">Manage platform access and roles.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBulkResetTokens} disabled={bulkTokenLoading} className="gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                {bulkTokenLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />} Bulk Token Reset
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </div>

          <div className="border border-border rounded-md min-h-75">
            {loading ? (
              <div className="flex items-center justify-center h-75">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable keyExtractor={(item) => item.id} columns={columns} data={filteredUsers} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
