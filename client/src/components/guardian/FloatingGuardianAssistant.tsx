import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GuardianMascot } from './GuardianMascot';
import { MessageSquare, X, ShieldCheck, FileCheck, ShoppingBag, HelpCircle, Globe, ChevronRight } from 'lucide-react';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';

interface FloatingGuardianAssistantProps {
  onNavigate?: (tab: string) => void;
}

export const FloatingGuardianAssistant: React.FC<FloatingGuardianAssistantProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleAction = (action: string) => {
    if (action === 'verify' && onNavigate) {
      onNavigate('verify');
      setIsOpen(false);
    } else if (action === 'marketplace' && onNavigate) {
      onNavigate('marketplace');
      setIsOpen(false);
    } else if (action === 'policies' && onNavigate) {
      onNavigate('policies');
      setIsOpen(false);
    } else {
      setSelectedTopic(action);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto select-none">
      {/* Expanded Dialog */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-3xl bg-slate-900/95 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl p-5 text-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-200 divide-y divide-slate-800/80">
          {/* Header */}
          <div className="pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center p-1">
                <GuardianMascot size="sm" showSpeechBubble={false} state="idle" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{t('guardian.name')}</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    AI Guardian
                  </span>
                </h4>
                <p className="text-xs text-slate-400">{t('guardian.title')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-3 space-y-3">
            {!selectedTopic ? (
              <>
                <p className="text-xs text-slate-300 font-medium">
                  {t('guardian.helpPrompt')}
                </p>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleAction('verify')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-cyan-950/40 border border-slate-700/50 hover:border-cyan-500/40 text-xs font-medium text-slate-200 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{t('guardian.optVerify')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    onClick={() => handleAction('marketplace')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-cyan-950/40 border border-slate-700/50 hover:border-cyan-500/40 text-xs font-medium text-slate-200 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{t('guardian.optExplore')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-300 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    onClick={() => handleAction('security')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-cyan-950/40 border border-slate-700/50 hover:border-cyan-500/40 text-xs font-medium text-slate-200 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{t('guardian.optSecurity')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('guardian.optLang')}</span>
                    </span>
                    <LanguageSwitcher variant="compact" />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-200 leading-relaxed">
                  {selectedTopic === 'security' && (
                    <>
                      <h5 className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        {t('trust.card1Title')}
                      </h5>
                      <p>{t('trust.card1Desc')}</p>
                      <p className="mt-2 text-slate-400 text-[11px]">{t('trust.disclaimer')}</p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  ← {t('checkout.back')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-3.5 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-2xl shadow-cyan-900/50 border border-cyan-300/40 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-400/40"
        aria-label="Toggle Guardian Assistant"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
        </span>
        <GuardianMascot size="sm" showSpeechBubble={false} state="idle" />
      </button>
    </div>
  );
};
