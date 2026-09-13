import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Sun, Moon, Check } from 'lucide-react';
import { useThemeStore, THEME_META, type ThemeName } from '@/lib/stores/theme-store';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, isDark, setTheme, toggleDark } = useThemeStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
        title="Change Theme"
      >
        <Palette size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-xl glass z-50"
          >
            <div className="mb-2 px-2 pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
            </div>

            <div className="space-y-1">
              {(Object.entries(THEME_META) as [ThemeName, { label: string; emoji: string }][]).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
                    theme === key 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </span>
                  {theme === key && <Check size={16} className="text-primary" />}
                </button>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-border">
              <button
                onClick={toggleDark}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  {isDark ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </span>
                <div className={cn(
                  "w-8 h-4 rounded-full relative transition-colors",
                  isDark ? "bg-primary" : "bg-border"
                )}>
                  <div className={cn(
                    "absolute top-0.5 bottom-0.5 w-3 rounded-full bg-background transition-transform",
                    isDark ? "left-0 translate-x-4" : "left-0.5"
                  )} />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
