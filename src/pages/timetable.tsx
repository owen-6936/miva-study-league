import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import type { TimetableEntry, DayOfWeek } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { PageLoader } from '@/components/ui/page-loader';
import type { AxiosError } from 'axios';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function Timetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');

  useEffect(() => {
    // Set initial selected day to today (or Monday if weekend and no weekend classes)
    const todayIndex = new Date().getDay();
    // JS getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayMap: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let initialDay = dayMap[todayIndex] as DayOfWeek;
    if (initialDay === 'Sunday' || initialDay === 'Saturday') {
        initialDay = 'Monday'; // Default to start of week if weekend
    }
    setSelectedDay(initialDay);
    
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get('/timetable');
      
      const data = res.data.timetableEntries || res.data.timetable || res.data.data || res.data || [];
      const mapped = Array.isArray(data) ? data.map((d: TimetableEntry) => ({ ...d, id: d.id})) : [];      setEntries(mapped);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response?.status === 404) {
        // Backend not implemented yet, fallback gracefully
        setEntries([]);
      } else {
        setError('Failed to load timetable data. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getEntriesForDay = (day: DayOfWeek) => {
    return entries
      .filter((e) => e.day === day)
      // Sort by start time roughly (assuming formats like "09:00 AM")
      .sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.startTime}`).getTime();
        const timeB = new Date(`1970/01/01 ${b.startTime}`).getTime();
        return timeA - timeB;
      });
  };

  const dayEntries = getEntriesForDay(selectedDay);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lecture': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Tutorial': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Lab': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Study Session': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-heading">School Timetable</h1>
          <p className="text-muted-foreground">View your weekly class schedule and study sessions.</p>
        </div>
      </div>

      {error ? (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-500 font-medium">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Day Selector Sidebar */}
          <Card className="w-full md:w-64 shrink-0 h-fit">
            <CardContent className="p-2 space-y-1">
              {DAYS_OF_WEEK.map((day) => {
                const count = getEntriesForDay(day).length;
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200",
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-md font-medium" 
                        : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{day}</span>
                    {count > 0 && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Schedule View */}
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold font-heading mb-4">{selectedDay}'s Schedule</h2>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {dayEntries.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                      <Calendar className="w-12 h-12 mb-4 opacity-20" />
                      <p>No classes scheduled for {selectedDay}.</p>
                      <p className="text-sm mt-1">Enjoy your free time!</p>
                    </CardContent>
                  </Card>
                ) : (
                  dayEntries.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="overflow-hidden border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: 'var(--color-primary)' }}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <Badge className={cn("border", getTypeColor(entry.type))}>
                                  {entry.type}
                                </Badge>
                                <span className="font-mono text-sm font-bold text-primary">
                                  {entry.courseCode}
                                </span>
                              </div>
                              
                              <h3 className="text-xl font-bold">{entry.title}</h3>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {entry.date && (
                                  <div className="flex items-center gap-1.5 text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-md">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  <span>{entry.startTime} - {entry.endTime}</span>
                                </div>
                                {entry.location && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    <span>{entry.location}</span>
                                  </div>
                                )}
                                {entry.instructor && (
                                  <div className="flex items-center gap-1.5">
                                    <User className="w-4 h-4" />
                                    <span>{entry.instructor}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
