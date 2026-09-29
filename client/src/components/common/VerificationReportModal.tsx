import React from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Calculator, 
  Building, 
  User, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { VerificationRecord } from '../../store/useVerifyStore';

export interface VerificationReportModalProps {
  record?: VerificationRecord | null;
  doc?: VerificationRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationReportModal: React.FC<VerificationReportModalProps> = ({
  record: recordProp,
  doc,
  isOpen,
  onClose
}) => {
  const record = recordProp || doc;
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const isConsistent = record.status === 'Verified / Likely Original' || record.status === 'CONSISTENT';
  const fields = record.extractedFields;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#131924] w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100">
        {/* Modal Top Bar (Non-printable controls) */}
        <div className="px-6 py-3 bg-white dark:bg-[#131924] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
            <span>Report Ref: {record.verificationId}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Audit Report Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 print:p-0 print:m-0" id="printable-audit-report">
          {/* Header */}
          <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-6 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  ClearClaim Document Audit Certificate
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Automated Insurance Document Authenticity &amp; Underwriting Consistency Report
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${
                isConsistent 
                  ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' 
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isConsistent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>{record.status}</span>
              </span>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Audit Date: {new Date(record.verifiedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Verification Confidence</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                {Math.round(record.confidenceScore * 100)}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Discrepancies Flagged</span>
              <span className={`text-lg font-bold font-mono ${
                record.detectedIssues.length === 0 ? 'text-green-600' : 'text-amber-600'
              }`}>
                {record.detectedIssues.length}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Rules Evaluated</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                {record.passedChecksCount} / {record.totalChecksCount}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Engine Model</span>
              <span className="text-xs font-mono text-slate-800 dark:text-slate-200 block truncate mt-1">
                {record.modelInfo?.name || 'ClearClaim Engine v3'}
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          {record.plainEnglishSummary && (
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/50 space-y-1">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
                Executive Audit Summary
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {record.plainEnglishSummary}
              </p>
            </div>
          )}

          {/* Extracted Schedule Data */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Extracted Policy Schedule &amp; Certificate Parameters</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px]">Policy Identifier</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {fields?.policy_number?.value || '—'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px]">Insurer Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {fields?.insurer?.value || '—'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px]">Policyholder Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {fields?.policyholder?.value || '—'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px]">Policy Type</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {fields?.policy_type?.value || '—'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px]">Effective Period</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {fields?.effective_date?.value || '—'} → {fields?.expiry_date?.value || '—'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px]">Sum Insured</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {fields?.coverage_inr?.value ? `₹${fields.coverage_inr.value.toLocaleString('en-IN')}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Underwriting Issues */}
          {record.detectedIssues && record.detectedIssues.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Underwriting Inconsistencies &amp; Anomaly Findings</span>
              </h3>
              <div className="space-y-2.5">
                {record.detectedIssues.map((issue, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
                    <div className="flex items-center justify-between font-bold">
                      <span>#{idx + 1}. {issue.title}</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 font-mono">
                        {issue.severity} Severity
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      {issue.explanation}
                    </p>
                    {issue.calculationFormula && (
                      <div className="p-2 rounded bg-white dark:bg-slate-900 font-mono text-[10px] border border-amber-200/60 dark:border-amber-900/60">
                        Formula Applied: {issue.calculationFormula}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Analysis if available */}
          {record.visualAnalysis && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Visual Layout &amp; Optical Feature Analysis</span>
              </h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Visual Layout Specification</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {record.visualAnalysis.isStandardDocumentLayout ? 'Standard Commercial Policy Layout' : 'Non-standard Layout Format'}
                  </span>
                </div>

                {record.visualAnalysis.topTags && record.visualAnalysis.topTags.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block mb-1.5">Top Predicted Visual Feature Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {record.visualAnalysis.topTags.map((t: any, idx: number) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          {t.label} ({Math.round((t.score || t.confidence_percent || 0.9) * (t.score > 1 ? 1 : 100))}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legal Disclaimer Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-mono text-center space-y-1">
            <p>
              Disclaimer: AI-assisted verification identifies inconsistencies and risk indicators. It does not guarantee authenticity unless the policy is independently confirmed through an authorized insurer or trusted source.
            </p>
            <p>
              Report generated by ClearClaim Platform v3.0 · All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
