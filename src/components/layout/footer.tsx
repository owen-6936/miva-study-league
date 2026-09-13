import { Link } from 'react-router';
import { ArrowUpRight, Github, MessageCircle, Trophy, Twitter } from 'lucide-react';

const QUICK_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/teams', label: 'Teams' },
  { href: '/missions', label: 'Missions' },
];

const RESOURCE_LINKS = [
  { href: '/hall-of-fame', label: 'Hall of Fame' },
  { href: '/settings', label: 'Settings' },
  { href: '/profile', label: 'Profile' },
];

const SOCIAL_LINKS = [
  { href: 'https://x.com', label: 'X', icon: Twitter },
  { href: 'https://discord.com', label: 'Discord', icon: MessageCircle },
  { href: 'https://github.com', label: 'GitHub', icon: Github },
];

export const Footer = () => {
  return (
    <footer className="relative mt-auto w-full overflow-hidden border-t border-border bg-bg-secondary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-8 h-44 w-44 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-secondary/12 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <section className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted-foreground">
              <Trophy size={14} className="text-primary" />
              Season 1: Genesis
            </div>
            <h3 className="font-heading text-2xl font-bold">MIVA Study League</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Compete weekly, collaborate as a squad, and rise through missions, challenges, and
              live score battles.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Navigate
            </h4>
            <div className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Resources
            </h4>
            <div className="space-y-2">
              {RESOURCE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Community
            </h4>
            <div className="space-y-2">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon size={14} />
                  {label}
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border/70 pt-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Miva Study League. All rights reserved.</p>
          <p>
            Powered by{' '}
            <a
              href="https://github.com/owen-6936"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary transition-opacity hover:opacity-80"
            >
              Miva Star Owen
              <ArrowUpRight size={14} />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
