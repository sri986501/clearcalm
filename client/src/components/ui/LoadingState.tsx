import React from 'react';

interface LoadingStateProps {
  message?: string;
  detail?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading your information…',
  detail = 'Please wait while we verify your data.',
  className = ''
}) => {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      className={`p-12 text-center bg-white border border-slate-200/90 rounded-2xl space-y-4 max-w-md mx-auto shadow-sm ${className}`}
    >
      <div className="w-10 h-10 border-3 border-[#0369A1] border-t-transparent rounded-full animate-spin mx-auto" />
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-[#0F172A]">{message}</h4>
        {detail && <p className="text-xs text-slate-500">{detail}</p>}
      </div>
    </div>
  );
};
