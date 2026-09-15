import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { ChevronDown, ChevronRight, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';
import type { Mission } from "@/lib/api/types";


export function MissionPortalPage() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const navigate = useNavigate();

  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [pastMissions, setPastMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const [currentRes, pastRes] = await Promise.all([
          apiClient.get('/missions/current'),
          apiClient.get('/users/me/missions/past').catch(() => ({ data: {} })),
        ]);

        const currentMissions = currentRes.data.missions || currentRes.data.currentMissions || currentRes.data || [];
        setActiveMissions(Array.isArray(currentMissions) ? currentMissions : []);

        const pastData = pastRes.data || {};
        const history = [
          ...(pastData.completedMissions || []).map((m: unknown) => ({
            ...(m as Mission),
            status: 'completed',
          })),
          ...(pastData.pastMissions || []).map((m: Mission) => ({ 
            ...(m as Mission), 
            status: 'expired' 
          })),
        ];
        setPastMissions(history);
      } catch (error) {
        console.error('Failed to load missions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);



  const courses = useMemo(() => {
    const set = new Set([
      ...activeMissions.map(m => m.courseId || 'General'),
      ...pastMissions.map(m => m.courseId || 'General'),
    ]);
    return Array.from(set).sort();
  }, [activeMissions, pastMissions]);

  const filteredMissions = useMemo(() => {
    const list = selectedCourse === 'all'
      ? [...activeMissions]
      : activeMissions.filter(m => (m.courseId || 'General') === selectedCourse);
    return list.sort((a, b) => new Date(a.createdAt || a.deadline).getTime() - new Date(b.createdAt || b.deadline).getTime());
  }, [activeMissions, selectedCourse]);

  const filteredPastMissions = useMemo(() => {
    const list = selectedCourse === 'all'
      ? [...pastMissions]
      : pastMissions.filter(m => (m.courseId || 'General') === selectedCourse);
    return list.sort((a, b) => new Date(a.createdAt || a.deadline).getTime() - new Date(b.createdAt || b.deadline).getTime());
  }, [pastMissions, selectedCourse]);

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground animate-pulse">
        Loading missions...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 py-6 sm:space-y-12 sm:py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold font-heading text-gradient sm:text-4xl">
          Weekly Missions
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Complete weekly missions to earn points for your team.
        </p>
      </div>

      {/* Course Filter */}
      {courses.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCourse === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCourse('all')}
            className="rounded-full text-xs h-8"
          >
            All Courses ({activeMissions.length})
          </Button>
          {courses.map(course => (
            <Button
              key={course}
              variant={selectedCourse === course ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCourse(course)}
              className="rounded-full text-xs h-8"
            >
              {course} ({activeMissions.filter(m => (m.courseId || 'General') === course).length})
            </Button>
          ))}
        </div>
      )}

      {filteredMissions.length > 0 ? (
        <div className="space-y-6">
          {filteredMissions.map((activeMission) => (
        <motion.div
              key={activeMission.id}
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-4 sm:top-4">
              <Badge variant="default" className="animate-pulse-glow bg-primary">
                NEW
              </Badge>
            </div>
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-2">
                <Badge variant="default" className="w-fit">
                  {activeMission.courseId}
                </Badge>
                <CardTitle className="pr-14 text-2xl sm:pr-20 sm:text-3xl">
                  {activeMission.title}
                </CardTitle>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                {activeMission.storyBrief}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-border bg-surface/50 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <div className="font-medium text-destructive">
                      <CountdownTimer
                        targetDate={activeMission.deadline}
                        className="justify-start sm:justify-center"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => navigate(`/missions/${activeMission.id}`)}
                  >
                    Start Mission <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {activeMission.firstBlood && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex items-center gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-full text-amber-500">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-amber-500 font-bold uppercase text-xs tracking-wider">First Blood Claimed!</h4>
                    <p className="text-sm font-medium mt-0.5">
                      {activeMission.firstBlood.name} <span className="opacity-70 font-normal">({activeMission.firstBlood.team})</span> beat you to it!
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-medium">Mission Tasks</h3>
                <ul className="space-y-2">
                  {activeMission.tasks?.map((task, idx) => (
                    <li key={task.id || idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-muted-foreground">{task.title} <span className="text-xs ml-1 opacity-70">({task.points} XP)</span></span>
                    </li>
                  ))}
                  {(!activeMission.tasks || activeMission.tasks.length === 0) && (
                    <li className="text-sm text-muted-foreground italic">No tasks specified yet.</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
          <p className="text-muted-foreground">
            {selectedCourse === 'all' ? 'No active missions right now.' : `No active missions for ${selectedCourse}.`}
          </p>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-heading">Mission Archive</h2>

        {filteredPastMissions.length > 0 ? (
          <div className="space-y-4">
            {filteredPastMissions.map((mission, idx) => (
              <Card key={mission.id} className="bg-surface border-border">
                <CardContent className="p-0">
                  <button
                    className="w-full p-4 text-left transition-colors hover:bg-muted/50 sm:p-6"
                    onClick={() =>
                      setExpandedWeek(
                        expandedWeek === idx ? null : idx,
                      )
                    }
                    type="button"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                          #{idx + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{mission.title}</h3>
                          <p className="text-sm text-muted-foreground">{mission.courseId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:gap-4 sm:self-auto">
                        <Badge variant="default" className="shrink-0">
                          {(mission as Mission & { status?: string }).status === 'expired' ? 'Expired' : 'Completed'}
                        </Badge>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform ${expandedWeek === idx ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  </button>

                  {expandedWeek === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-border p-6 bg-muted/20 space-y-4"
                    >
                      {mission.firstBlood && (
                        <div className="flex items-center gap-3 mb-4 text-sm bg-background p-3 rounded-lg border border-border w-fit">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="font-medium text-muted-foreground">Champion:</span>
                          <span className="font-bold">{mission.firstBlood.name}</span>
                          <Badge variant="warning" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">FIRST BLOOD</Badge>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/missions/${mission.id}`)}
                      >
                        View Details
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            {selectedCourse === 'all' ? 'No past missions.' : `No past missions for ${selectedCourse}.`}
          </p>
        )}
      </div>
    </div>
  );
}
