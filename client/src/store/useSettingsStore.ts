import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorPalette = 'corporate-blue' | 'slate-gray' | 'forest-green' | 'charcoal-amber' | 'ocean-teal';
export type AnomalySensitivity = 'strict' | 'standard' | 'lenient';

export interface AppSettings {
  theme: ThemeMode;
  colorPalette: ColorPalette;
  enableMouseTracker: boolean;
  enableScrollAnimations: boolean;
  enableCaformerVision: boolean;
  ocrConfidenceThreshold: number;
  anomalySensitivity: AnomalySensitivity;
  autoScrollToResults: boolean;
  soundEffects: boolean;
  highContrast: boolean;
}

interface SettingsStoreState extends AppSettings {
  isSettingsModalOpen: boolean;
  
  // Actions
  setTheme: (theme: ThemeMode) => void;
  setColorPalette: (palette: ColorPalette) => void;
  toggleTheme: () => void;
  setEnableMouseTracker: (val: boolean) => void;
  setEnableScrollAnimations: (val: boolean) => void;
  setEnableCaformerVision: (val: boolean) => void;
  setOcrConfidenceThreshold: (val: number) => void;
  setAnomalySensitivity: (val: AnomalySensitivity) => void;
  setAutoScrollToResults: (val: boolean) => void;
  setSoundEffects: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  colorPalette: 'corporate-blue',
  enableMouseTracker: false,
  enableScrollAnimations: true,
  enableCaformerVision: true,
  ocrConfidenceThreshold: 75,
  anomalySensitivity: 'standard',
  autoScrollToResults: true,
  soundEffects: false,
  highContrast: false,
};


export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      isSettingsModalOpen: false,

      setTheme: (theme: ThemeMode) => {
        set({ theme });
        applyThemeClass(theme, get().colorPalette);
      },

      setColorPalette: (colorPalette: ColorPalette) => {
        set({ colorPalette });
        applyThemeClass(get().theme, colorPalette);
      },

      toggleTheme: () => {
        const current = get().theme;
        const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        applyThemeClass(next, get().colorPalette);
      },

      setEnableMouseTracker: (val: boolean) => set({ enableMouseTracker: val }),
      setEnableScrollAnimations: (val: boolean) => set({ enableScrollAnimations: val }),
      setEnableCaformerVision: (val: boolean) => set({ enableCaformerVision: val }),
      setOcrConfidenceThreshold: (val: number) => set({ ocrConfidenceThreshold: val }),
      setAnomalySensitivity: (val: AnomalySensitivity) => set({ anomalySensitivity: val }),
      setAutoScrollToResults: (val: boolean) => set({ autoScrollToResults: val }),
      setSoundEffects: (val: boolean) => set({ soundEffects: val }),
      setHighContrast: (val: boolean) => set({ highContrast: val }),

      openSettingsModal: () => set({ isSettingsModalOpen: true }),
      closeSettingsModal: () => set({ isSettingsModalOpen: false }),
      resetSettings: () => {
        set({ ...DEFAULT_SETTINGS });
        applyThemeClass(DEFAULT_SETTINGS.theme, DEFAULT_SETTINGS.colorPalette);
      }
    }),
    {
      name: 'clearclaim-app-settings',
      partialize: (state) => ({
        theme: state.theme,
        colorPalette: state.colorPalette,
        enableMouseTracker: state.enableMouseTracker,
        enableScrollAnimations: state.enableScrollAnimations,
        enableCaformerVision: state.enableCaformerVision,
        ocrConfidenceThreshold: state.ocrConfidenceThreshold,
        anomalySensitivity: state.anomalySensitivity,
        autoScrollToResults: state.autoScrollToResults,
        soundEffects: state.soundEffects,
        highContrast: state.highContrast,
      })
    }
  )
);

export function applyThemeClass(theme: ThemeMode, palette: ColorPalette = 'corporate-blue') {
  const root = document.documentElement;
  const isDark = 
    theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Remove existing palette classes
  root.classList.remove(
    'palette-corporate-blue',
    'palette-slate-gray',
    'palette-forest-green',
    'palette-charcoal-amber',
    'palette-ocean-teal'
  );
  root.classList.add(`palette-${palette}`);
}
