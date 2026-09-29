import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '',
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useSettingsStore();
  const isDark = theme === 'dark';

  // Resolves Issue #5: Display the opposite action icon (Sun when dark, Moon when light)
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`btn-ghost !p-1.5 ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
      )}
      {showLabel && (
        <span className="text-xs select-none">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  );
};
