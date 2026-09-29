import React from 'react';

interface SectionHeaderProps {
  contextBadge?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  contextBadge,
  title,
  subtitle,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 ${className}`}>
      <div className="space-y-1">
        {contextBadge && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0369A1] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">
              {contextBadge}
            </span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F172A]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-3 shrink-0 pt-1 md:pt-0">
          {action}
        </div>
      )}
    </div>
  );
};
