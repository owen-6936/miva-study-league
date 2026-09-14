import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import type { Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2 } from 'lucide-react';
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
  transferTokens?: number;
  _id?: string;
}

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGranting, setIsGranting] = useState<string | null>(null);

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

  const handleGrantToken = async (userId: string) => {
    setIsGranting(userId);
    try {
      await apiClient.post(`/admin/users/${userId}/grant-token`);
      toast.success('Transfer token granted to student!');
      
      // Optimistically update the UI
      setUsers(users.map(u => (u.id === userId || u._id === userId) ? { ...u, transferTokens: (u.transferTokens || 0) + 1 } : u));
    } catch {
      toast.error('Failed to grant transfer token');
    } finally {
      setIsGranting(null);
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
      cell: (row) => (
        <span className="font-mono text-sm font-bold">
          {row.transferTokens || 0}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => handleGrantToken(row.id || row._id!)}
          disabled={isGranting === (row.id || row._id)}
        >
          {isGranting === (row.id || row._id) ? <Loader2 className="w-3 h-3 animate-spin" /> : '+ Token'}
        </Button>
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
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </div>

          <div className="border border-border rounded-md min-h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
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
