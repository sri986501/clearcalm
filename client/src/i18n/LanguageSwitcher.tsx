import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, applyLanguageAttributes } from './index';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ variant?: 'header' | 'hero' | 'compact' }> = ({ variant = 'header' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    applyLanguageAttributes(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-xl transition-all duration-200 ${
          variant === 'hero'
            ? 'px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-white border border-cyan-500/30 shadow-lg shadow-cyan-950/40 text-sm font-medium backdrop-blur-md'
            : 'px-2.5 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border border-slate-700/60 text-xs font-medium backdrop-blur-sm'
        } focus:outline-none focus:ring-2 focus:ring-cyan-400`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Select Language / மொழி / भाषा"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="font-semibold text-cyan-300">{currentLang.nativeName}</span>
        <span className="text-slate-400 text-[10px] hidden sm:inline">({currentLang.label})</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-cyan-500/30 shadow-2xl backdrop-blur-xl z-50 py-2 divide-y divide-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-cyan-400/80 flex items-center justify-between">
            <span>🌐 Select Language</span>
            <span className="text-slate-500 font-normal">11 Languages</span>
          </div>
          <div className="max-h-72 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors duration-150 ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold border-l-2 border-cyan-400'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">{lang.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
