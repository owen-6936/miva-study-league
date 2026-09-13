import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  showLabel?: boolean;
  className?: string;
  indicatorClassName?: string;
  height?: 'sm' | 'md' | 'lg';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  showLabel = false,
  className,
  indicatorClassName,
  height = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs font-medium text-text/80">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'overflow-hidden rounded-full bg-surface border border-border/50',
          heightClasses[height],
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full bg-primary bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)]',
            indicatorClassName,
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
