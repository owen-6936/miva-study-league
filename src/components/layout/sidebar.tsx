import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Trophy,
  Users,
  BookOpen,
  Swords,
  Award,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
  { icon: Users, label: 'Teams', href: '/teams' },
  { icon: BookOpen, label: 'Missions', href: '/missions' },
  { icon: Swords, label: 'Challenges', href: '/challenges' },
  { icon: Award, label: 'Hall of Fame', href: '/hall-of-fame' },
  { icon: User, label: 'Profile', href: '/profile', bottom: true },
  { icon: Settings, label: 'Settings', href: '/settings', bottom: true },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const topItems = SIDEBAR_ITEMS.filter((item) => !item.bottom);
  const bottomItems = SIDEBAR_ITEMS.filter((item) => item.bottom);

  return (
    <motion.aside animate={{ width: collapsed ? 80 : 240 }} className="hidden shrink-0 lg:flex">
      <div className="sticky top-16 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-r border-border bg-surface py-4">
        <div className="flex flex-1 flex-col space-y-2 px-3">
          {topItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className="relative flex items-center px-3 py-3 rounded-lg group text-muted-foreground hover:text-foreground transition-colors"
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={20} className={cn('shrink-0', isActive && 'text-primary')} />
                <motion.span
                  animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                  className="ml-3 font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-2 px-3">
          <div className="mx-2 my-2 h-px bg-border" />
          {bottomItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className="relative flex items-center px-3 py-3 rounded-lg group text-muted-foreground hover:text-foreground transition-colors"
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={20} className={cn('shrink-0', isActive && 'text-primary')} />
                <motion.span
                  animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                  className="ml-3 font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-4 flex w-full items-center justify-center rounded-lg py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
