import React from 'react';
import { FileText, Eye, Download, CheckCircle2, AlertTriangle, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';

export interface DocumentRowProps {
  id: string;
  name: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt: string;
  status?: string;
  policyOrClaimRef?: string;
  onView?: () => void;
  onDownload?: () => void;
  onVerify?: () => void;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({
  id,
  name,
  fileType = 'PDF',
  fileSize,
  uploadedAt,
  status = 'Verified',
  policyOrClaimRef,
  onView,
  onDownload,
  onVerify
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 transition-all duration-150">
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0369A1] flex items-center justify-center shrink-0 border border-sky-100">
          <FileText className="w-5 h-5" />
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-[#0F172A] truncate" title={name}>
              {name}
            </h4>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
              {fileType}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span>{new Date(uploadedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {fileSize && (
              <>
                <span className="text-slate-300">•</span>
                <span>{formatFileSize(fileSize)}</span>
              </>
            )}
            {policyOrClaimRef && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-mono font-medium">{policyOrClaimRef}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {status && (
          <StatusIndicator status={status} size="sm" />
        )}

        <div className="flex items-center gap-1.5">
          {onView && (
            <button
              onClick={onView}
              aria-label={`View ${name}`}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="View Document"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {onDownload && (
            <button
              onClick={onDownload}
              aria-label={`Download ${name}`}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {onVerify && (
            <button
              onClick={onVerify}
              className="btn-primary !text-xs !py-1.5 !px-3"
            >
              <span>Audit Record</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
