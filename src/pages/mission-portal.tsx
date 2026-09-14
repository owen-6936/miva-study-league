import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import type { Mission } from "@/lib/api/types";


export function MissionPortalPage() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const navigate = useNavigate();

  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [pastMissions, setPastMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const [currentRes, meRes] = await Promise.all([
          apiClient.get('/missions/current'),
          apiClient.get('/users/me/missions'),
        ]);

        setActiveMissions(currentRes.data.missions || []);

        const history = [
          ...(meRes.data.completedMissions || []).map((m: unknown) => ({
            ...(m as Mission),
            status: 'completed',
          })),
          ...(meRes.data.pastMissions || []).map((m: Mission) => ({ ...(m as Mission), status: 'expired' })),
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

  const activeMission = activeMissions[0]; // For now, just feature the first active one

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

      {activeMission ? (
        <motion.div
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

              <div className="space-y-3">
                <h3 className="font-medium">Mission Tasks</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" /><span className="text-muted-foreground">{activeMission.storyBrief}</span></li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
          <p className="text-muted-foreground">No active missions right now.</p>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-heading">Mission Archive</h2>

        {pastMissions.length > 0 ? (
          <div className="space-y-4">
            {pastMissions.map((mission) => (
              <Card key={mission.id} className="bg-surface border-border">
                <CardContent className="p-0">
                  <button
                    className="w-full p-4 text-left transition-colors hover:bg-muted/50 sm:p-6"
                    onClick={() =>
                      setExpandedWeek(
                        expandedWeek === (0) ? null : (0),
                      )
                    }
                    type="button"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          Mission
                        </div>
                        <div>
                          <h3 className="font-medium">{mission.title}</h3>
                          <p className="text-sm text-muted-foreground">{mission.courseId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:gap-4 sm:self-auto">
                        <Badge variant="default" className="shrink-0">
                          Completed
                        </Badge>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform ${expandedWeek === 0 ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  </button>

                  {expandedWeek === 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-border p-6 bg-muted/20"
                    >
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
          <p className="text-muted-foreground">No past missions.</p>
        )}
      </div>
    </div>
  );
}
