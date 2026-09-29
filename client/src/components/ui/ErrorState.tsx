import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something unexpected happened',
  message = 'We could not load this information right now. Please try again or check your network.',
  onRetry,
  className = ''
}) => {
  return (
    <div 
      role="alert" 
      className={`p-8 text-center bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-4 max-w-lg mx-auto shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5 max-w-sm mx-auto">
        <h4 className="text-base font-semibold text-rose-950">{title}</h4>
        <p className="text-xs text-rose-800 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-900 bg-white border border-rose-200 hover:bg-rose-50 cursor-pointer transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
