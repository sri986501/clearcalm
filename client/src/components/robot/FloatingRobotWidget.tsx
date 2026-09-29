import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldCheck, FileCheck, ShoppingBag, HelpCircle, Globe, ChevronRight, Lock, MessageSquare, Phone } from 'lucide-react';
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
      {/* Expanded Helper Dialog */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-5 text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-150 divide-y divide-slate-100">
          
          {/* Header */}
          <div className="pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0369A1] border border-sky-100 flex items-center justify-center">
                <HelpCircle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <span>ClearCalm Guide</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ONLINE
                  </span>
                </h4>
                <p className="text-xs text-slate-500">Insurance clarity &amp; navigation</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-3 space-y-3">
            {!selectedTopic ? (
              <>
                <p className="text-xs text-slate-600 font-medium">
                  How can we help you understand your insurance today?
                </p>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleAction('verify')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/70 hover:border-sky-200 text-xs font-semibold text-slate-800 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-[#0369A1] shrink-0" />
                      <span>Verify a policy document</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0369A1] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    onClick={() => handleAction('policies')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/70 hover:border-sky-200 text-xs font-semibold text-slate-800 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#0369A1] shrink-0" />
                      <span>Review my connected policies</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0369A1] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    onClick={() => handleAction('marketplace')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/70 hover:border-sky-200 text-xs font-semibold text-slate-800 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-[#0369A1] shrink-0" />
                      <span>Find &amp; compare accredited plans</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0369A1] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    onClick={() => handleAction('security')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/70 hover:border-sky-200 text-xs font-semibold text-slate-800 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>How is my policy data protected?</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0369A1] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    onClick={() => handleAction('helpline')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/70 hover:border-sky-200 text-xs font-semibold text-slate-800 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#0369A1] shrink-0" />
                      <span>Official IRDAI Helplines</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0369A1] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Language</span>
                    </span>
                    <LanguageSwitcher variant="compact" />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                  {selectedTopic === 'security' && (
                    <>
                      <h5 className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#0369A1]" />
                        Privacy-First Document Analysis
                      </h5>
                      <p>
                        Your documents are processed securely in memory and checked against authoritative underwriting arithmetic. ClearCalm never sells your data to brokers or third-party lead generators.
                      </p>
                    </>
                  )}

                  {selectedTopic === 'helpline' && (
                    <>
                      <h5 className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#0369A1]" />
                        Official Regulatory Contacts
                      </h5>
                      <p>
                        <strong>IRDAI Consumer Toll-Free:</strong> 155255 / 1800 4254 732
                      </p>
                      <p>
                        <strong>Email:</strong> complaints@irdai.gov.in
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Available Mon - Sat, 8:00 AM - 8:00 PM for grievance escalation.
                      </p>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setSelectedTopic(null)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  ← Back to Topics
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-3.5 rounded-full bg-[#0F2942] hover:bg-[#0369A1] text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-200 cursor-pointer"
        aria-label="Toggle ClearCalm Assistant"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <MessageSquare size={20} />
      </button>
    </div>
  );
};

export default FloatingRobotWidget;
