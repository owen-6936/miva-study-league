import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Swords, Construction, Hammer } from 'lucide-react';

export function ChallengeArenaPage() {
  return (
    <div className="space-y-6 pb-8 sm:space-y-8 flex flex-col items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="text-center space-y-6 max-w-2xl mx-auto"
      >
        <div className="relative inline-flex items-center justify-center p-6 bg-primary/10 rounded-full mb-4">
          <Swords className="w-16 h-16 text-primary" />
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute -top-2 -right-2 bg-background rounded-full p-2 border border-border shadow-md"
          >
            <Hammer className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold font-heading text-gradient">
          The Arena is Forging
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          The Multiplayer Live Session engine is currently under construction. Soon, you'll be able
          to drop into the Arena with your team for real-time 90-minute Saturday Showdowns,
          featuring quick-fire rounds, problem battles, and live score tracking!
        </p>

        <Card className="bg-secondary/30 border-dashed border-2 mt-8">
          <CardContent className="p-8">
            <h3 className="font-bold text-xl mb-2 flex items-center justify-center gap-2">
              <Construction className="w-5 h-5 text-yellow-500" />
              Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground">
              Stay tuned to the Official Announcements on your dashboard for the grand opening.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
