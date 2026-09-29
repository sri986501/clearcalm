import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';

export type StatusVariant = 
  | 'verified' 
  | 'active' 
  | 'pending' 
  | 'under_review' 
  | 'attention' 
  | 'expired' 
  | 'neutral';

interface StatusIndicatorProps {
  status: string;
  variant?: StatusVariant;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  variant,
  label,
  size = 'md',
  className = ''
}) => {
  // Infer variant if not explicitly supplied
  const resolvedVariant: StatusVariant = variant || (() => {
    const s = status.toLowerCase();
    if (s.includes('verif') || s.includes('active') || s.includes('success') || s.includes('consistent') || s.includes('original')) {
      return 'verified';
    }
    if (s.includes('pend') || s.includes('progress') || s.includes('submitt')) {
      return 'pending';
    }
    if (s.includes('review') || s.includes('guidance')) {
      return 'under_review';
    }
    if (s.includes('flag') || s.includes('alert') || s.includes('suspicious') || s.includes('alter') || s.includes('action')) {
      return 'attention';
    }
    if (s.includes('expire') || s.includes('cancel') || s.includes('failed')) {
      return 'expired';
    }
    return 'neutral';
  })();

  const displayLabel = label || status;

  const config = {
    verified: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      dot: 'bg-emerald-600',
      icon: CheckCircle2,
      ariaLabel: `Status: ${displayLabel} (Active & verified)`
    },
    active: {
      bg: 'bg-sky-50 text-sky-900 border-sky-200/80',
      dot: 'bg-sky-600',
      icon: ShieldCheck,
      ariaLabel: `Status: ${displayLabel} (Active policy)`
    },
    pending: {
      bg: 'bg-amber-50 text-amber-900 border-amber-200/80',
      dot: 'bg-amber-600',
      icon: Clock,
      ariaLabel: `Status: ${displayLabel} (In progress)`
    },
    under_review: {
      bg: 'bg-blue-50 text-blue-900 border-blue-200/80',
      dot: 'bg-blue-600',
      icon: HelpCircle,
      ariaLabel: `Status: ${displayLabel} (Under review)`
    },
    attention: {
      bg: 'bg-orange-50 text-orange-950 border-orange-200/90',
      dot: 'bg-orange-600',
      icon: AlertTriangle,
      ariaLabel: `Status: ${displayLabel} (Attention requested)`
    },
    expired: {
      bg: 'bg-rose-50 text-rose-900 border-rose-200/80',
      dot: 'bg-rose-600',
      icon: AlertCircle,
      ariaLabel: `Status: ${displayLabel} (Expired or inactive)`
    },
    neutral: {
      bg: 'bg-slate-100 text-slate-800 border-slate-200/80',
      dot: 'bg-slate-500',
      icon: HelpCircle,
      ariaLabel: `Status: ${displayLabel}`
    }
  }[resolvedVariant];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    md: 'text-xs sm:text-sm px-3 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-medium'
  }[size];

  const IconComponent = config.icon;

  return (
    <span
      role="status"
      aria-label={config.ariaLabel}
      className={`inline-flex items-center rounded-full border transition-colors select-none ${config.bg} ${sizeClasses} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};
