import * as React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, initials, size = 'md', isOnline, className, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-xl',
    };

    const dotSizeClasses = {
      sm: 'h-2 w-2 right-0 bottom-0',
      md: 'h-2.5 w-2.5 right-0 bottom-0',
      lg: 'h-3 w-3 right-0.5 bottom-0.5',
      xl: 'h-4 w-4 right-1 bottom-1',
    };

    return (
      <div ref={ref} className={cn('relative inline-block', className)} {...props}>
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-surface text-text overflow-hidden border border-border',
            sizeClasses[size],
          )}
        >
          {src && !imageError ? (
            <img
              src={src}
              alt={alt || 'Avatar'}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : initials ? (
            <span className="font-semibold">{initials}</span>
          ) : (
            <User className="h-1/2 w-1/2 opacity-50" />
          )}
        </div>

        {isOnline !== undefined && (
          <span
            className={cn(
              'absolute rounded-full border-2 border-bg',
              isOnline ? 'bg-green-500' : 'bg-gray-500',
              dotSizeClasses[size],
            )}
          />
        )}
      </div>
    );
  },
);
Avatar.displayName = 'Avatar';
