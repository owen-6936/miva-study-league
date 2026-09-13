import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeName = 'miva-classic' | 'cyberpunk' | 'gradient-playful' | 'esports';

interface ThemeState {
  theme: ThemeName;
  isDark: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleDark: () => void;
  setDark: (isDark: boolean) => void;
}

export const THEME_META: Record<ThemeName, { label: string; description: string; emoji: string }> =
  {
    'miva-classic': {
      label: 'MIVA Classic',
      description: 'Clean modern with MIVA brand colors',
      emoji: '🎓',
    },
    cyberpunk: {
      label: 'Cyberpunk Neon',
      description: 'Dark futuristic with neon glows',
      emoji: '🌃',
    },
    'gradient-playful': {
      label: 'Gradient Playful',
      description: 'Glassmorphism with colorful gradients',
      emoji: '🎨',
    },
    esports: {
      label: 'Esports Arena',
      description: 'Aggressive energy, tournament style',
      emoji: '🏟️',
    },
  };

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'miva-classic',
      isDark: false,

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },

      toggleDark: () =>
        set((state) => {
          const newDark = !state.isDark;
          document.documentElement.classList.toggle('dark', newDark);
          return { isDark: newDark };
        }),

      setDark: (isDark) => {
        document.documentElement.classList.toggle('dark', isDark);
        set({ isDark });
      },
    }),
    {
      name: 'msl-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
          document.documentElement.classList.toggle('dark', state.isDark);
        }
      },
    },
  ),
);
