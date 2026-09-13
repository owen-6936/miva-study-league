import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Sparkles, Trophy } from 'lucide-react';

export function HallOfFamePage() {
  return (
    <div className="space-y-6 pb-8 sm:space-y-8 flex flex-col items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="text-center space-y-6 max-w-2xl mx-auto"
      >
        <div className="relative inline-flex items-center justify-center p-6 bg-yellow-500/10 rounded-full mb-4">
          <Crown className="w-16 h-16 text-yellow-500" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute -top-2 -right-2 text-yellow-400"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold font-heading text-gradient">
          The Hall of Fame is Empty
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          The history books for the MIVA Study League are yet to be written. At the end of Season 1,
          the top scholars, MVPs, and legendary teams will have their names permanently engraved
          here for all future generations to see.
        </p>

        <Card className="bg-secondary/30 border-dashed border-2 mt-8 border-yellow-500/20">
          <CardContent className="p-8">
            <h3 className="font-bold text-xl mb-2 flex items-center justify-center gap-2 text-yellow-500">
              <Trophy className="w-5 h-5" />
              Will You Make History?
            </h3>
            <p className="text-sm text-muted-foreground">
              Keep climbing the leaderboard. The Hall of Fame unlocks when the season concludes.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
