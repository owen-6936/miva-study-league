import * as React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './animated-counter';

export interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: number; // percentage, e.g. 5 for +5%, -3 for -3%
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  prefix = '',
  suffix = '',
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn('p-6 rounded-xl border border-border bg-bg-card shadow-sm', className)}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-text/70">{title}</p>
        {icon && <div className="text-primary bg-primary/10 p-2 rounded-lg">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold font-heading text-text flex items-baseline">
          {prefix}
          <AnimatedCounter from={0} to={value} />
          {suffix}
        </h3>
      </div>

      {trend !== undefined && (
        <div
          className={cn(
            'flex items-center text-xs mt-2 font-medium',
            trend >= 0 ? 'text-green-500' : 'text-red-500',
          )}
        >
          {trend >= 0 ? (
            <TrendingUp className="w-3 h-3 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-1" />
          )}
          <span>{Math.abs(trend)}% from last week</span>
        </div>
      )}
    </motion.div>
  );
};
