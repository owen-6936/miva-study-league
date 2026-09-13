import { useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { BookOpen, Swords, Trophy, ChevronRight, ArrowRight } from 'lucide-react';
import { ParticleBg } from '@/components/ui/particle-bg';
import { TEAM_EMOJIS } from '@/lib/utils';

export function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const teams = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma', 'Zeta'];

  return (
    <div ref={containerRef} className="min-h-screen bg-bg text-text overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-black italic">
            M
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">Study League</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <ParticleBg className="absolute inset-0 z-0 opacity-50" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center pt-16 sm:pt-20 md:pt-8">
          <motion.div
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-4 py-1.5 rounded-full bg-surface border border-border text-xs sm:text-sm font-medium mb-6 animate-pulse-glow"
          >
            Season 1 • 12 Weeks • 7 Teams • 44 Students
          </motion.div>

          <div className="mb-5">
            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-gradient p-4"
              initial={{ y: 36, opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              MIVA Study League
            </motion.h1>
          </div>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <span className="font-semibold text-primary">Study</span> Together.{' '}
            <span className="font-semibold text-primary">Compete</span> Together.{' '}
            <span className="font-semibold text-primary">Win</span> Together.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Link
              to="/register"
              className="inline-flex w-max items-center justify-center rounded-full text-base sm:text-lg font-medium whitespace-nowrap flex-nowrap px-6 sm:px-8 h-12 sm:h-14 bg-primary text-white hover:opacity-90 transition-colors"
            >
              Join the League <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex w-max items-center justify-center rounded-full text-base sm:text-lg font-medium whitespace-nowrap flex-nowrap px-6 sm:px-8 h-12 sm:h-14 border border-border bg-bg-card/85 text-text hover:bg-surface transition-colors shadow-sm"
            >
              View Leaderboard
            </Link>
          </motion.div>
        </div>

        {/* Floating shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-secondary/10 blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </section>

      {/* How It Works */}
      <section className="how-it-works-section py-20 sm:py-24 px-4 bg-surface/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading">How It Works</h2>
            <p className="text-muted-foreground text-lg">Your path to academic glory.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative px-2 sm:px-4 md:px-0">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 transform -translate-y-1/2"></div>

            <motion.div
              initial={{ y: 50, opacity: 1 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="how-it-works-card bg-bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-lg relative glass"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-base font-bold">
                1
              </div>
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Study</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Complete weekly missions aligned with your coursework to earn base points.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 1 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="how-it-works-card bg-bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-lg relative glass"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-base font-bold">
                2
              </div>
              <Swords className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Compete</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Battle other teams every Saturday in 90-minute live sessions.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 1 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="how-it-works-card bg-bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-lg relative glass"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-base font-bold">
                3
              </div>
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Win</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Climb the leaderboard, unlock achievements, and earn exclusive awards.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Teams Preview */}
      <section className="py-20 sm:py-24 overflow-hidden flex flex-col justify-center min-h-[360px] sm:min-h-[400px]">
        <div className="max-w-6xl mx-auto px-4 mb-8 sm:mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gradient">7 Teams. One Goal.</h2>
        </div>

        <div className="md:hidden overflow-x-auto px-4 pb-4 -mx-1">
          <div className="flex gap-3 w-max pl-1 pr-1">
            {teams.map((team) => (
              <motion.div
                key={team}
                whileHover={{ scale: 1.03 }}
                className="w-40 h-28 bg-surface rounded-xl border border-border flex flex-col items-center justify-center gap-1.5"
              >
                <span className="text-2xl">
                  {TEAM_EMOJIS?.[team as keyof typeof TEAM_EMOJIS] || '🐺'}
                </span>
                <span className="font-bold text-base">{team}</span>
                <span className="text-xs text-muted-foreground">0/7 Members</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex gap-6 px-4 animate-scroll-x w-max will-change-transform">
          {[...teams, ...teams].map((team, i) => (
            <motion.div
              key={`${team}-${i}`}
              whileHover={{ scale: 1.05, rotateY: 10, rotateX: 5 }}
              className="w-64 h-40 bg-surface rounded-xl border border-border flex flex-col items-center justify-center gap-3 cursor-pointer"
              style={{ perspective: 1000 }}
              aria-hidden={i >= teams.length}
            >
              <span className="text-4xl">
                {TEAM_EMOJIS?.[team as keyof typeof TEAM_EMOJIS] || '🐺'}
              </span>
              <span className="font-bold text-xl">{team}</span>
              <span className="text-sm text-muted-foreground">0/7 Members</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Weekly Loop */}
      <section className="py-24 px-4 bg-surface/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-14 text-center font-heading">
            The Weekly Loop
          </h2>

          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 relative before:hidden sm:before:block before:absolute before:top-0 before:bottom-0 before:left-5 before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            <motion.div
              initial={{ y: 20, opacity: 1 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45 }}
              className="timeline-step relative flex items-start gap-4"
            >
              <div className="mt-1 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-bg bg-primary text-white text-xs sm:text-sm font-bold shrink-0 shadow">
                M
              </div>
              <div className="flex-1 min-w-0 bg-bg-card p-4 sm:p-5 md:p-6 rounded-xl border border-border shadow-sm glass">
                <h3 className="font-bold text-base sm:text-lg mb-1 text-primary">Mission Drops</h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                  New weekly objectives are revealed based on current modules.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 1 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45 }}
              className="timeline-step relative flex items-start gap-4"
            >
              <div className="mt-1 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-bg bg-surface text-text text-xs sm:text-sm font-bold shrink-0 shadow">
                W
              </div>
              <div className="flex-1 min-w-0 bg-bg-card p-4 sm:p-5 md:p-6 rounded-xl border border-border shadow-sm glass">
                <h3 className="font-bold text-base sm:text-lg mb-1">Independent Study</h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                  Students complete missions and submit proof of work.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 1 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45 }}
              className="timeline-step relative flex items-start gap-4"
            >
              <div className="mt-1 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-bg bg-secondary text-white text-xs sm:text-sm font-bold shrink-0 shadow">
                S
              </div>
              <div className="flex-1 min-w-0 bg-bg-card p-4 sm:p-5 md:p-6 rounded-xl border border-border shadow-sm glass">
                <h3 className="font-bold text-base sm:text-lg mb-1 text-secondary">League Match</h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                  90-minute live session. Quizzes, challenges, and team battles.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Attribution */}
      <section className="py-28 px-4 bg-linear-to-br from-bg-secondary via-surface/70 to-bg-secondary text-text relative overflow-hidden border-y border-border/70">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 20%, var(--theme-color-primary-light) 0%, transparent 45%), radial-gradient(circle at 75% 80%, var(--theme-color-secondary) 0%, transparent 40%)',
          }}
        />
        <motion.div
          initial={{ opacity: 1, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="z-10 flex flex-col items-center max-w-3xl mx-auto"
        >
          <div className="mb-8 p-4 rounded-2xl bg-(--theme-color-bg-icon) backdrop-blur-md border border-border shadow-2xl">
            <img
              src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2023/05/03200256/Miva-Logo-White-Vertical-1.png"
              alt="MIVA Open University"
              className="h-24 md:h-32 object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Built with pride by Owen
          </h2>
          <p className="text-text-secondary max-w-2xl text-base sm:text-lg mb-8">
            Created by Owen, a MIVA student, for fellow learners in the Study League.
          </p>

          <div className="inline-flex w-max items-center px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/30 text-sm font-medium animate-pulse-glow">
            Powered by Owen, a MIVA student
          </div>

          <a
            href="https://miva.edu.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 text-sm text-text-secondary hover:text-primary transition-colors underline underline-offset-4 cursor-pointer z-10"
          >
            Visit miva.edu.ng
          </a>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 bg-linear-to-br from-primary to-secondary text-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0 opacity-20"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-8 tracking-tight">
            Ready to Level Up Your Academics?
          </h2>
          <Link
            to="/register"
            className="inline-flex w-max items-center justify-center rounded-full text-lg font-medium whitespace-nowrap flex-nowrap px-10 h-16 shadow-2xl bg-surface text-text hover:bg-surface/80 transition-colors"
          >
            Get Started <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
