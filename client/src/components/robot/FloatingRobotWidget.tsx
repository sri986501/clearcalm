import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RobotAssistant } from './RobotAssistant';
import { X, ShieldCheck, FileCheck, ShoppingBag, HelpCircle, Globe, ChevronRight, Cpu, Lock } from 'lucide-react';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';

interface FloatingRobotWidgetProps {
  onNavigate?: (tab: string) => void;
}

export const FloatingRobotWidget: React.FC<FloatingRobotWidgetProps> = ({ onNavigate }) => {
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
      {/* Expanded Holographic Dialog */}
      {isOpen && (
        <div className="mb-4 w-84 sm:w-96 rounded-3xl bg-slate-950/95 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl p-5 text-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-200 divide-y divide-slate-800/80">
          
          {/* Header */}
          <div className="pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center p-1">
                <RobotAssistant size="sm" showSpeechBubble={false} state="idle" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>{t('robot.name', 'AEGIS AI')}</span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                    ONLINE
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">{t('robot.title', 'Policy Intelligence Core')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                  {t('robot.helpPrompt', 'How can I assist with your insurance policy verification today?')}
                </p>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleAction('verify')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-xs font-semibold text-slate-200 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{t('robot.optVerify', 'Verify an insurance document')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    onClick={() => handleAction('marketplace')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-xs font-semibold text-slate-200 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{t('robot.optExplore', 'Find & compare insurance policies')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-300 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    onClick={() => handleAction('security')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-xs font-semibold text-slate-200 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{t('robot.optSecurity', 'How is my policy data protected?')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-850">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('robot.optLang', 'Change language')}</span>
                    </span>
                    <LanguageSwitcher variant="compact" />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-200 leading-relaxed">
                  {selectedTopic === 'security' && (
                    <>
                      <h5 className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-cyan-400" />
                        {t('trust.card1Title', 'Protected Vault Storage')}
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
                  ← {t('checkout.back', 'Back')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Robot Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-3 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 text-white shadow-2xl shadow-cyan-950/80 border border-cyan-500/40 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-400/30"
        aria-label="Toggle Aegis AI Assistant"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
        </span>
        <RobotAssistant size="sm" showSpeechBubble={false} state="idle" />
      </button>
    </div>
  );
};
