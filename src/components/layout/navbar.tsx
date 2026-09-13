import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router';
import {
  Bell,
  User,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Shield,
  LayoutDashboard,
  Trophy,
  Users,
  BookOpen,
  Swords,
  Award,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/missions', label: 'Missions', icon: BookOpen },
  { href: '/challenges', label: 'Challenges', icon: Swords },
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Award },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const { user, isAuthenticated, logout } = useAuthStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const { isDark, toggleDark } = useThemeStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 border-b',
        scrolled
          ? 'bg-surface/80 backdrop-blur-md border-border shadow-sm glass'
          : 'bg-transparent border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:px-4 lg:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold font-heading">
            M
          </div>
          <span className="hidden font-heading text-sm font-bold sm:block lg:hidden">MSL</span>
          <span className="hidden font-heading text-lg font-bold lg:block">MIVA Study League</span>
        </Link>

        {isAuthenticated && (
          <nav className="mx-2 hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = location.pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  to={href}
                  title={label}
                  className={cn(
                    'relative flex h-10 items-center justify-center rounded-md transition-colors md:w-10 lg:w-auto lg:px-3',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="ml-2 hidden text-sm font-medium lg:inline">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-2 right-2 hidden h-0.5 rounded-full bg-primary lg:block"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            onClick={toggleDark}
            className="p-2 rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAuthenticated ? (
            <>
              <button className="relative p-2 rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse-glow" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center overflow-hidden border border-border"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} />
                  )}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-lg py-1 z-50 glass"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary hover:text-secondary-foreground"
                      >
                        <User size={16} /> Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary hover:text-secondary-foreground"
                      >
                        <User size={16} /> Settings
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-secondary hover:text-secondary-foreground"
                        >
                          <Shield size={16} /> Admin Panel
                        </Link>
                      )}
                      <div className="h-px bg-border my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary hover:text-secondary-foreground"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                className="md:hidden p-2 text-muted-foreground"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors sm:px-4"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors sm:px-4"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-[min(20rem,85vw)] bg-surface border-l border-border shadow-xl z-50 p-6 flex flex-col overflow-y-auto md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-heading font-bold text-lg">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full transition-colors hover:bg-secondary hover:text-secondary-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'text-lg font-medium p-2 rounded-md transition-colors',
                      location.pathname.startsWith(href)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary hover:text-secondary-foreground',
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
