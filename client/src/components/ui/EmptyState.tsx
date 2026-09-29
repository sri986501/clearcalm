import React from 'react';
import { LucideIcon, Inbox, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center bg-white border border-slate-200/90 rounded-2xl space-y-4 max-w-xl mx-auto shadow-sm ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0369A1] flex items-center justify-center mx-auto border border-sky-100">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-[#0F172A]">
          {title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="btn-primary"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="btn-secondary"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
