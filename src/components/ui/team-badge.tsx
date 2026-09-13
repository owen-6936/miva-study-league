import * as React from 'react';
import { motion } from 'motion/react';
import { TEAM_COLORS, TEAM_EMOJIS } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface TeamBadgeProps {
  teamId?: string;
  teamName?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  teamId,
  teamName,
  name,
  size = 'md',
  className,
}) => {
  const actualName = teamName || name || teamId || 'Unknown';
  const colorObj = TEAM_COLORS[actualName] || {
    bg: 'bg-gray-500/10',
    text: 'text-gray-500',
    border: 'border-gray-500',
  };
  const emoji = TEAM_EMOJIS[actualName] || '🛡️';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center font-medium rounded-full border shadow-sm cursor-default',
        colorObj.bg,
        colorObj.text,
        colorObj.border,
        sizeClasses[size],
        className,
      )}
    >
      <span className="flex items-center justify-center relative">
        <span className="relative z-10">{emoji}</span>
      </span>
      <span>{actualName}</span>
    </motion.div>
  );
};
