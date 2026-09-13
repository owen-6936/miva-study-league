import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CountdownTimerProps {
  targetDate?: Date | string | number;
  seconds?: number; // Alternatively, provide total seconds
  onComplete?: () => void;
  className?: string;
}

const AnimatedDigit = ({ value, label }: { value: number; label: string }) => {
  const formattedValue = value.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center mx-1 sm:mx-2">
      <div className="relative h-12 w-10 sm:h-16 sm:w-14 bg-surface border border-border rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formattedValue}
            initial={{ y: 20, opacity: 0, rotateX: -90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: -20, opacity: 0, rotateX: 90 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute text-2xl sm:text-3xl font-bold font-heading text-primary"
            style={{ transformOrigin: '50% 50%' }}
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] sm:text-xs text-text/60 mt-1 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  seconds,
  onComplete,
  className,
}) => {
  // Convert initial seconds to a target date internally if seconds is provided instead of targetDate
  const [internalTarget] = React.useState<Date | null>(() => {
    if (targetDate) return new Date(targetDate);
    if (seconds !== undefined) return new Date(Date.now() + seconds * 1000);
    return null;
  });

  const [timeLeft, setTimeLeft] = React.useState<TimeLeft | null>(() => {
    if (!internalTarget) return null;
    const diff = internalTarget.getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  });

  React.useEffect(() => {
    if (!internalTarget) return;

    const timer = setInterval(() => {
      const diff = internalTarget.getTime() - Date.now();

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft(null);
        onComplete?.();
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [internalTarget, onComplete]);

  if (!timeLeft) {
    return <div className={cn('text-xl font-bold text-primary', className)}>Time's up!</div>;
  }

  return (
    <div className={cn('flex items-center justify-center', className)} dir="ltr">
      {timeLeft.days > 0 && (
        <>
          <AnimatedDigit value={timeLeft.days} label="Days" />
          <span className="text-xl font-bold text-text/40 pb-5">:</span>
        </>
      )}
      <AnimatedDigit value={timeLeft.hours} label="Hours" />
      <span className="text-xl font-bold text-text/40 pb-5">:</span>
      <AnimatedDigit value={timeLeft.minutes} label="Mins" />
      <span className="text-xl font-bold text-text/40 pb-5">:</span>
      <AnimatedDigit value={timeLeft.seconds} label="Secs" />
    </div>
  );
};
