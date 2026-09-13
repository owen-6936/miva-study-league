import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Get ordinal suffix for a number (1st, 2nd, 3rd, etc.) */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0])!;
}

/** Format a number with commas */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

/** Format a score with + prefix for positive */
export function formatScore(n: number): string {
  return n > 0 ? `+${formatNumber(n)}` : formatNumber(n);
}

/** Format a date as readable string */
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

/** Format a date as relative time */
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Format seconds as MM:SS */
export function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** Team colors mapped by team name */
export const TEAM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Alpha: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500' },
  Beta: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' },
  Gamma: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500' },
  Delta: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500' },
  Omega: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500' },
  Sigma: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500' },
  Zeta: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500' },
};

/** Team emojis */
export const TEAM_EMOJIS: Record<string, string> = {
  Alpha: '🐺',
  Beta: '🦅',
  Gamma: '🐉',
  Delta: '🦁',
  Omega: '⚡',
  Sigma: '🔱',
  Zeta: '🌀',
};

/** Get initials from a name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Truncate text with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/** Sleep utility for animations */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
