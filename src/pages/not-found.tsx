import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text p-4 relative overflow-hidden">
      {/* Playful background elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 text-6xl opacity-20 select-none"
      >
        🛸
      </motion.div>
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/3 right-1/4 text-6xl opacity-20 select-none"
      >
        👨‍🚀
      </motion.div>

      <div className="z-10 flex flex-col items-center text-center max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="relative"
        >
          <motion.h1
            className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 drop-shadow-lg"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            404
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-4 font-heading">Page not found</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Looks like you've wandered off the academic path. Let's get you back to the league.
          </p>

          <Button
            size="lg"
            className="rounded-full px-8 shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-1"
          >
            <Link to="/">
              <Home className="w-5 h-5 mr-2" /> Go Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
