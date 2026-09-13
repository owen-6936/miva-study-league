import { Loader2, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-border/50 bg-bg-card/50 p-8 shadow-xl backdrop-blur-sm"
      >
        <div className="relative flex h-16 w-16 items-center justify-center">
          <Shield className="absolute h-10 w-10 text-primary/20" />
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            Accessing Database...
          </h3>
          <p className="text-sm text-muted-foreground">Preparing your view</p>
        </div>
      </motion.div>
    </div>
  );
}
