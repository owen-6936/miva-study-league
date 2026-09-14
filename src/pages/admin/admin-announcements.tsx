import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, CalendarIcon, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiClient, getApiError } from '@/lib/api/client';

export interface DashboardAnnouncement {
  id?: string;
  _id?: string;
  title: string;
  content: string;
  date?: string;
  type?: string;
  expiresAt?: string;
}

export const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<DashboardAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('info');
  const [expiresInDays, setExpiresInDays] = useState('7');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiClient.get('/announcements');
      setAnnouncements(res.data.announcements || res.data || []);
    } catch (error) {
      toast.error(getApiError(error, 'Failed to fetch announcements'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));

      await apiClient.post('/announcements', {
        title,
        content,
        type,
        expiresAt: expiresAt.toISOString(),
      });
      
      toast.success('Announcement broadcasted to all students!');
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (error) {
      toast.error(getApiError(error, 'Failed to broadcast announcement'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      setAnnouncements(announcements.filter(a => a.id !== id && a._id !== id));
    } catch (error) {
      toast.error(getApiError(error, 'Failed to delete announcement'));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold font-heading flex items-center gap-2">
          <Megaphone className="w-8 h-8 text-primary" /> Broadcast Center
        </h1>
        <p className="text-muted-foreground">Create and manage global announcements for all students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-lg">New Broadcast</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Headline</label>
                  <Input 
                    placeholder="e.g. Google Drive Access Fix" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea 
                    placeholder="Type your message here..." 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={content} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="info">Information (Blue)</option>
                    <option value="alert">Alert (Red)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="success">Success (Green)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" /> Auto-Expire In
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                  >
                    <option value="1">24 Hours</option>
                    <option value="3">3 Days</option>
                    <option value="7">1 Week</option>
                    <option value="30">1 Month</option>
                  </select>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSubmitting}>
                  <Plus className="w-4 h-4 mr-2" /> Broadcast Now
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Announcements</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading broadcasts...</div>
                ) : announcements.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p>No active announcements.</p>
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id || ann._id} className="p-6 flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            ann.type === 'alert' ? 'bg-destructive' : 
                            ann.type === 'warning' ? 'bg-yellow-500' : 
                            ann.type === 'success' ? 'bg-green-500' : 'bg-primary'
                          }`} />
                          <h4 className="font-bold">{ann.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
                        {ann.expiresAt && (
                          <p className="text-xs text-muted-foreground mt-2 font-mono">
                            Expires: {new Date(ann.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete((ann.id || ann._id)!)}
                        className="shrink-0"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Revoke
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
