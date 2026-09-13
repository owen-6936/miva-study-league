import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Clock, MapPin, User, Save, Loader2, Upload, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import type { TimetableEntry, DayOfWeek } from '@/lib/api/types';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CLASS_TYPES = ['Lecture', 'Tutorial', 'Lab', 'Study Session', 'Other'] as const;

export function AdminTimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [originalEntries, setOriginalEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/timetable');
      const data = res.data.timetableEntries || res.data.timetable || res.data.data || res.data || [];
      const mapped: TimetableEntry[] = Array.isArray(data) ? data : [];
      setEntries(mapped);
      setOriginalEntries(JSON.parse(JSON.stringify(mapped)));
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response?.status !== 404) {
        toast.error('Failed to load timetable data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Calculate differences
      const toDelete = originalEntries.filter(orig => !entries.find(e => e.id === orig.id));
      const toUpdate = entries.filter(e => {
        const orig = originalEntries.find(o => o.id === e.id);
        if (!orig) return false;
        // Compare values, ignore potential backend-injected fields like __v or updatedAt
        return orig.day !== e.day || orig.startTime !== e.startTime || orig.endTime !== e.endTime || orig.courseCode !== e.courseCode || orig.title !== e.title || orig.type !== e.type || orig.instructor !== e.instructor || orig.location !== e.location || orig.date !== e.date;
      });
      const toCreate = entries.filter(e => !originalEntries.find(orig => orig.id === e.id));

      // Execute Deletions
      for (const d of toDelete) {
        if (d.id) await apiClient.delete(`/timetable/${d.id}`);
      }

      // Execute Updates
      for (const u of toUpdate) {
        await apiClient.put(`/timetable/${u.id}`, u);
      }

      // Execute Creations
      for (const c of toCreate) {
        const { id: _id, ...payload } = c; // Strip frontend-generated ID
        await apiClient.post('/timetable', payload);
      }

      toast.success('Timetable saved successfully');
      await fetchTimetable();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error(error.response?.data?.message || 'Failed to save timetable changes');
    } finally {
      setIsSaving(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (file.name.endsWith('.csv')) {
        parseCSV(text);
      } else if (file.name.endsWith('.ics')) {
        parseICS(text);
      } else {
        toast.error('Unsupported file format. Please upload a .csv or .ics file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return toast.error('CSV appears to be empty');
    
    const newEntries: TimetableEntry[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i]!.split(',').map(s => s.trim());
      if (cols.length >= 5) {
        newEntries.push({
          id: Math.random().toString(36).substr(2, 9),
          day: cols[0] as DayOfWeek,
          startTime: cols[1] || '00:00',
          endTime: cols[2] || '00:00',
          courseCode: cols[3] || 'N/A',
          title: cols[4] || 'Imported',
          type: (cols[5] as TimetableEntry['type']) || 'Lecture',
          instructor: cols[6] || '',
          location: cols[7] || '',
        });
      }
    }
    setEntries(prev => [...prev, ...newEntries]);
    toast.success(`Imported ${newEntries.length} classes from CSV`);
  };

  const parseICS = (icsText: string) => {
    const lines = icsText.split(/\r?\n/);
    const newEntries: TimetableEntry[] = [];
    let currentEvent: Partial<TimetableEntry> & { dtstart?: string; dtend?: string; rrule?: string } | null = null;
    
    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = { id: Math.random().toString(36).substr(2, 9), type: 'Lecture', courseCode: 'IMPORTED' };
      } else if (line.startsWith('END:VEVENT') && currentEvent) {
        const timeMatchStart = currentEvent.dtstart?.match(/T(\d{2})(\d{2})/);
        const timeMatchEnd = currentEvent.dtend?.match(/T(\d{2})(\d{2})/);
        
        if (timeMatchStart) {
          const startTime = `${timeMatchStart[1]}:${timeMatchStart[2]}`;
          const endTime = timeMatchEnd ? `${timeMatchEnd[1]}:${timeMatchEnd[2]}` : startTime;
          const daysToMap: DayOfWeek[] = [];
          
          if (currentEvent.rrule) {
             if (currentEvent.rrule.includes('MO')) daysToMap.push('Monday');
             if (currentEvent.rrule.includes('TU')) daysToMap.push('Tuesday');
             if (currentEvent.rrule.includes('WE')) daysToMap.push('Wednesday');
             if (currentEvent.rrule.includes('TH')) daysToMap.push('Thursday');
             if (currentEvent.rrule.includes('FR')) daysToMap.push('Friday');
             if (currentEvent.rrule.includes('SA')) daysToMap.push('Saturday');
             if (currentEvent.rrule.includes('SU')) daysToMap.push('Sunday');
          }
          
          if (daysToMap.length === 0 && currentEvent.dtstart) {
             const dateMatch = currentEvent.dtstart.match(/:(\d{4})(\d{2})(\d{2})T/);
             if (dateMatch) {
               const dateObj = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T12:00:00Z`);
               const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
               daysToMap.push(dayNames[dateObj.getDay()] as DayOfWeek);
             }
          }
          
          let exactDate = undefined;
          if (daysToMap.length === 1 && currentEvent.dtstart) {
            const dMatch = currentEvent.dtstart.match(/:(\d{4})(\d{2})(\d{2})T/);
            if (dMatch && !currentEvent.rrule) exactDate = `${dMatch[1]}-${dMatch[2]}-${dMatch[3]}`;
          }

          daysToMap.forEach(day => {
            newEntries.push({
              id: Math.random().toString(36).substr(2, 9),
              day: day,
              date: exactDate,
              startTime,
              endTime,
              title: currentEvent!.title || 'Imported Event',
              courseCode: 'N/A',
              type: 'Lecture',
              location: currentEvent!.location || '',
            });
          });
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('SUMMARY:')) currentEvent!.title = line.substring(8).trim();
        else if (line.startsWith('LOCATION:')) currentEvent!.location = line.substring(9).trim();
        else if (line.startsWith('DTSTART')) currentEvent.dtstart = line;
        else if (line.startsWith('DTEND')) currentEvent.dtend = line;
        else if (line.startsWith('RRULE:')) currentEvent.rrule = line;
      }
    }
    
    if (newEntries.length > 0) {
      setEntries(prev => [...prev, ...newEntries]);
      toast.success(`Imported ${newEntries.length} classes from Calendar`);
    } else {
      toast.error('Could not find any readable events in this file.');
    }
  };

  const addEntry = () => {
    const newEntry: TimetableEntry = {
      id: Math.random().toString(36).substr(2, 9), // Temp ID for new unsaved entries
      day: selectedDay,
      startTime: '09:00',
      endTime: '11:00',
      courseCode: 'COURSE101',
      title: 'New Class',
      instructor: '',
      location: '',
      type: 'Lecture',
    };
    setEntries([...entries, newEntry]);
  };

  const updateEntry = (id: string, field: keyof TimetableEntry, value: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const dayEntries = entries.filter(e => e.day === selectedDay);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Manage Timetable</h1>
          <p className="text-muted-foreground">Add or update classes for the school schedule.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save All Changes
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {DAYS_OF_WEEK.map(day => (
          <Button
            key={day}
            variant={selectedDay === day ? 'primary' : 'outline'}
            onClick={() => setSelectedDay(day)}
            className="flex-1 min-w-[100px]"
          >
            {day}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{selectedDay}'s Classes</span>
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} className="hidden" accept=".ics,.csv" onChange={handleFileUpload} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Import Calendar
              </Button>
              <Button variant="secondary" size="sm" onClick={addEntry}>
                <Plus className="w-4 h-4 mr-2" /> Add Class
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Changes are saved locally until you click "Save All Changes" at the top.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : dayEntries.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
              No classes scheduled for this day. Click "Add Class" to start.
            </div>
          ) : (
            dayEntries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-xl bg-secondary/10 relative">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Type</label>
                  <select 
                    value={entry.type}
                    onChange={(e) => updateEntry(entry.id, 'type', e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Course</label>
                  <Input 
                    value={entry.courseCode} 
                    onChange={(e) => updateEntry(entry.id, 'courseCode', e.target.value)}
                    placeholder="MTH101"
                  />
                </div>
                
                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Title</label>
                  <Input 
                    value={entry.title} 
                    onChange={(e) => updateEntry(entry.id, 'title', e.target.value)}
                    placeholder="Intro to Calculus"
                  />
                </div>

                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Exact Date (Optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date"
                      value={entry.date || ''} 
                      onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Start</label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="time"
                      value={entry.startTime} 
                      onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">End</label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="time"
                      value={entry.endTime} 
                      onChange={(e) => updateEntry(entry.id, 'endTime', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Instructor</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={entry.instructor || ''} 
                      onChange={(e) => updateEntry(entry.id, 'instructor', e.target.value)}
                      className="pl-9"
                      placeholder="Dr. Smith"
                    />
                  </div>
                </div>

                <div className="md:col-span-7 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Location / Link</label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={entry.location || ''} 
                      onChange={(e) => updateEntry(entry.id, 'location', e.target.value)}
                      className="pl-9"
                      placeholder="Room 302 or Zoom link"
                    />
                  </div>
                </div>

                <div className="md:col-span-1 flex items-end justify-end">
                  <Button variant="destructive" size="sm" onClick={() => removeEntry(entry.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
