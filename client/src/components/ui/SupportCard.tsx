import React from 'react';
import { HelpCircle, Phone, Mail, MessageSquare, ShieldCheck, ExternalLink } from 'lucide-react';

interface SupportCardProps {
  onOpenChat?: () => void;
  className?: string;
}

export const SupportCard: React.FC<SupportCardProps> = ({
  onOpenChat,
  className = ''
}) => {
  return (
    <div className={`p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0369A1] flex items-center justify-center shrink-0 border border-sky-100">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#0F172A]">Need Guidance or Support?</h4>
          <p className="text-xs text-slate-500">We are here to help you understand your coverage and claim steps.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#0369A1]" />
            IRDAI Consumer Helpline
          </span>
          <p className="text-slate-600">Toll-Free: <span className="font-mono font-medium text-slate-900">155255 / 1800 4254 732</span></p>
          <span className="text-[10px] text-slate-400 block">Mon - Sat, 8:00 AM - 8:00 PM</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#0369A1]" />
            Claims Ombudsman Email
          </span>
          <p className="text-slate-600">Direct: <span className="font-mono font-medium text-slate-900">complaints@irdai.gov.in</span></p>
          <span className="text-[10px] text-slate-400 block">For unresolved carrier disputes</span>
        </div>
      </div>

      {onOpenChat && (
        <div className="pt-1">
          <button
            onClick={onOpenChat}
            className="w-full btn-secondary !text-xs !py-2.5"
          >
            <MessageSquare className="w-4 h-4 text-[#0369A1]" />
            <span>Open ClearCalm Assistant</span>
          </button>
        </div>
      )}
    </div>
  );
};
