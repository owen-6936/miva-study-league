import * as React from 'react';
import { cn } from '@/lib/utils';
import type { HTMLMotionProps } from 'motion/react';
import { motion } from 'motion/react';

export interface BadgeProps extends Omit<HTMLMotionProps<'div'>, 'className'> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'team';
  size?: 'sm' | 'md' | 'lg';
  shimmer?: boolean;
  className?: string;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', size = 'md', shimmer = false, className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-colors relative overflow-hidden',
          {
            'bg-surface text-text border border-border': variant === 'default',
            'bg-green-500/10 text-green-500 border border-green-500/20': variant === 'success',
            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20': variant === 'warning',
            'bg-red-500/10 text-red-500 border border-red-500/20': variant === 'danger',
            'bg-blue-500/10 text-blue-500 border border-blue-500/20': variant === 'info',
            'bg-primary/10 text-primary border border-primary/20': variant === 'team',
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'px-3 py-1.5 text-base': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        <span className="relative z-10 flex items-center gap-1">{children as React.ReactNode}</span>
      </motion.div>
    );
  },
);
Badge.displayName = 'Badge';
