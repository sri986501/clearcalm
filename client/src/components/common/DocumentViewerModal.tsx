import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Scan, 
  Copy, 
  Check, 
  Printer, 
  ExternalLink, 
  Trash2,
  Calendar,
  Building,
  User,
  DollarSign,
  Search,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { VerificationRecord, useVerifyStore } from '../../store/useVerifyStore';

interface DocumentViewerModalProps {
  record: VerificationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onInspectInWorkspace?: (record: VerificationRecord) => void;
  onPrintReport?: (record: VerificationRecord) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  record,
  isOpen,
  onClose,
  onInspectInWorkspace,
  onPrintReport
}) => {
  const { deleteVerification } = useVerifyStore();
  const [activeTab, setActiveTab] = useState<'content' | 'explanation' | 'vision' | 'fields'>('content');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !record) return null;

  const isConsistent = record.status === 'CONSISTENT';
  const rawText = record.extractedFields?.rawText || '';
  const fields = record.extractedFields;
  const vis = record.visualAnalysis;

  const handleCopyText = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${record.filename}" from history?`)) {
      setIsDeleting(true);
      await deleteVerification(record.verificationId || record._id || '');
      setIsDeleting(false);
      onClose();
    }
  };

  // Text filtering
  const lines = rawText.split('\n');
  const highlightedLines = lines.map((line, idx) => {
    const isMatch = searchTerm && line.toLowerCase().includes(searchTerm.toLowerCase());
    return { line, idx: idx + 1, isMatch };
  });

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans animate-fade-in">
      <div className="bg-paper-surface w-full max-w-5xl rounded-3xl border border-paper-border shadow-paper-lg overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 bg-paper-surface border-b border-paper-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className={`p-2.5 rounded-2xl shrink-0 ${
              isConsistent ? 'bg-sage-50 text-sage-700 border border-sage-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <h2 className="font-serif font-bold text-base text-charcoal-900 truncate">
                  {record.filename}
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border shrink-0 ${
                  isConsistent 
                    ? 'bg-sage-100 text-sage-900 border-sage-300' 
                    : 'bg-amber-100 text-amber-950 border-amber-300'
                }`}>
                  {isConsistent ? 'CONSISTENT' : 'NEEDS REVIEW'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-warmgray truncate mt-0.5">
                Ref: {record.verificationId} • Uploaded: {new Date(record.verifiedAt).toLocaleString()} • {record.fileType}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {onInspectInWorkspace && (
              <button
                onClick={() => {
                  onInspectInWorkspace(record);
                  onClose();
                }}
                className="px-3 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Workspace</span>
              </button>
            )}

            {onPrintReport && (
              <button
                onClick={() => {
                  onPrintReport(record);
                }}
                className="px-3 py-1.5 bg-paper-bg hover:bg-paper-muted border border-paper-border text-charcoal-900 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
                title="Print Audit Report"
              >
                <Printer className="w-3.5 h-3.5 text-forest-700" />
                <span className="hidden sm:inline">Report</span>
              </button>
            )}

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-risk-600 hover:text-risk-700 hover:bg-risk-50 rounded-xl transition-colors border border-transparent hover:border-risk-200"
              title="Delete from History"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-warmgray hover:text-charcoal-900 rounded-xl hover:bg-paper-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-paper-bg border-b border-paper-border flex items-center space-x-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-3.5 border-b-2 font-mono flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'content'
                ? 'border-forest-700 text-forest-700 font-bold'
                : 'border-transparent text-warmgray hover:text-charcoal-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document Content ({lines.length} Lines)</span>
          </button>

          <button
            onClick={() => setActiveTab('explanation')}
            className={`py-3 px-3.5 border-b-2 font-mono flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'explanation'
                ? 'border-forest-700 text-forest-700 font-bold'
                : 'border-transparent text-warmgray hover:text-charcoal-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Plain-English Explanation</span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`py-3 px-3.5 border-b-2 font-mono flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'vision'
                ? 'border-forest-700 text-forest-700 font-bold'
                : 'border-transparent text-warmgray hover:text-charcoal-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-forest-700" />
            <span>CAFormer Vision AI ({vis?.modelName?.split('/')[1] || 'caformer'})</span>
          </button>

          <button
            onClick={() => setActiveTab('fields')}
            className={`py-3 px-3.5 border-b-2 font-mono flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'fields'
                ? 'border-forest-700 text-forest-700 font-bold'
                : 'border-transparent text-warmgray hover:text-charcoal-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
            <span>Extracted Attributes (11 Fields)</span>
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Document Content & OCR Buffer */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-warmgray" />
                  <input
                    type="text"
                    placeholder="Search in document text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-paper-bg border border-paper-border rounded-xl text-charcoal-900 focus:outline-none focus:border-forest-700"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyText}
                    className="px-3 py-1.5 bg-paper-bg hover:bg-paper-muted border border-paper-border rounded-xl text-xs font-mono text-charcoal-800 flex items-center space-x-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-sage-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy All Text'}</span>
                  </button>
                </div>
              </div>

              {/* Raw Document Lines Viewer */}
              <div className="bg-paper-bg rounded-2xl border border-paper-border p-4 font-mono text-xs overflow-x-auto max-h-[520px] overflow-y-auto leading-relaxed shadow-inner">
                {highlightedLines.length === 0 ? (
                  <p className="text-warmgray italic">No raw document text content available.</p>
                ) : (
                  highlightedLines.map(({ line, idx, isMatch }) => (
                    <div 
                      key={idx} 
                      className={`flex items-start space-x-3 py-0.5 px-1 rounded ${
                        isMatch ? 'bg-amber-200/60 font-bold text-amber-950' : 'hover:bg-paper-muted/60'
                      }`}
                    >
                      <span className="text-warmgray/60 select-none text-[10px] w-8 text-right shrink-0">
                        {idx}
                      </span>
                      <span className="text-charcoal-900 whitespace-pre-wrap break-all flex-1">
                        {line || ' '}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Plain-English AI Explanation */}
          {activeTab === 'explanation' && (
            <div className="space-y-6">
              {/* High Level Policy Summary Box */}
              <div className="p-5 rounded-2xl bg-forest-50/70 border border-forest-100 space-y-2">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-forest-700" />
                  <h3 className="font-serif font-bold text-sm text-forest-900 uppercase tracking-wide">
                    Policy Overview &amp; Identification
                  </h3>
                </div>
                <p className="text-xs text-charcoal-800 leading-relaxed font-medium">
                  {record.plainEnglishSummary || `This policy certificate covers ${fields?.policyholder?.value || 'the named policyholder'} under policy ${fields?.policy_number?.value || 'Ref ID'} issued by ${fields?.insurer?.value || 'the designated underwriter'} with ₹${fields?.coverage_inr?.value?.toLocaleString('en-IN') || '0'} total sum insured.`}
                </p>
              </div>

              {/* Status Explanation */}
              <div className={`p-5 rounded-2xl border space-y-2 ${
                isConsistent 
                  ? 'bg-sage-50/70 border-sage-300 text-sage-950' 
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center space-x-2">
                  {isConsistent ? <CheckCircle2 className="w-5 h-5 text-sage-700" /> : <AlertTriangle className="w-5 h-5 text-amber-700" />}
                  <h3 className="font-serif font-bold text-base">
                    {isConsistent ? 'Why this document is Consistent' : 'Why this document Needs Review'}
                  </h3>
                </div>
                <div className="text-xs leading-relaxed whitespace-pre-line font-medium opacity-95">
                  {record.detailedExplanation || record.recommendation}
                </div>
              </div>

              {/* Detected Issues Details if any */}
              {record.detectedIssues && record.detectedIssues.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-charcoal-900">
                    Detailed Discrepancy Breakdown ({record.detectedIssues.length})
                  </h4>

                  <div className="space-y-3">
                    {record.detectedIssues.map((issue, idx) => (
                      <div key={idx} className="p-4 bg-paper-surface rounded-2xl border border-amber-500/30 shadow-2xs space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 font-serif text-sm">
                            {idx + 1}. {issue.title}
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                            {issue.category}
                          </span>
                        </div>
                        <p className="text-charcoal-800 leading-relaxed">{issue.explanation}</p>

                        {issue.calculationFormula && (
                          <div className="p-2.5 bg-paper-bg rounded-xl border border-amber-200 font-mono text-[11px] text-forest-700">
                            <span className="text-warmgray">Formula: </span>
                            <span className="font-bold">{issue.calculationFormula}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] border-t border-paper-border">
                          <div>
                            <span className="text-warmgray">Document Stated: </span>
                            <strong className="text-risk-600">{String(issue.documentValue)}</strong>
                          </div>
                          <div>
                            <span className="text-warmgray">Underwriting Expected: </span>
                            <strong className="text-sage-700">{String(issue.expectedValue)}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewer Actionable Guidance */}
              <div className="p-4 bg-paper-bg rounded-2xl border border-paper-border space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-warmgray font-bold block">
                  Underwriter Recommended Action
                </span>
                <p className="text-xs text-charcoal-900 leading-relaxed font-medium">
                  {record.reviewerGuidance || (isConsistent ? 'Straight-Through Processing Approved. Ready for policy endorsement.' : 'Hold certificate and request underwriting correction for highlighted values.')}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CAFormer Vision AI Analysis */}
          {activeTab === 'vision' && (
            <div className="space-y-6">
              {vis ? (
                <div className="space-y-5">
                  {/* Model Header */}
                  <div className="p-5 rounded-2xl bg-paper-bg border border-paper-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-forest-50 text-forest-700 border border-forest-100">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-base text-forest-700">
                          {vis.modelName || 'animetimm/caformer_b36.dbv4-full'}
                        </h3>
                        <p className="text-xs text-warmgray font-mono">
                          {vis.architecture || 'CAFormer-B36 (ConvNeXt + Transformer Dual Backbone)'} • {vis.pipeline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="px-3 py-1 bg-sage-50 text-sage-800 rounded-lg border border-sage-200 font-bold">
                        Authenticity: {Math.round((vis.visualAuthenticityScore || 0.95) * 100)}%
                      </span>
                      <span className="px-3 py-1 bg-paper-muted text-warmgray rounded-lg border border-paper-border">
                        {vis.inferenceTimeMs || 140} ms
                      </span>
                    </div>
                  </div>

                  {/* Top Predicted Visual Tags */}
                  <div className="p-5 bg-paper-surface rounded-2xl border border-paper-border shadow-2xs space-y-3">
                    <h4 className="font-serif font-bold text-sm text-charcoal-900 flex items-center space-x-2">
                      <Scan className="w-4 h-4 text-forest-700" />
                      <span>Top Classification Tags &amp; Feature Confidence</span>
                    </h4>

                    <div className="space-y-2.5">
                      {vis.topTags?.map((tag: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-medium text-charcoal-800">
                              #{idx + 1} {tag.label}
                            </span>
                            <span className="font-bold text-forest-700">
                              {tag.confidence_percent ? `${tag.confidence_percent.toFixed(1)}%` : `${Math.round(tag.score * 100)}%`}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-paper-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-forest-700 rounded-full transition-all"
                              style={{ width: `${tag.confidence_percent || tag.score * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Checks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {vis.visualChecks?.map((chk: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-paper-border bg-paper-bg space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-charcoal-900">{chk.label}</span>
                          {chk.passed ? <CheckCircle2 className="w-4 h-4 text-sage-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                        </div>
                        <p className="text-[11px] text-warmgray leading-tight">{chk.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-warmgray text-xs">
                  No visual AI analysis metadata available for this record.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Extracted Attributes */}
          {activeTab === 'fields' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {/* Policy Number */}
                <div className="p-3.5 rounded-xl border border-paper-border bg-paper-bg">
                  <span className="text-[10px] text-warmgray font-mono block">Policy Number</span>
                  <span className="font-mono font-bold text-charcoal-900 block mt-0.5">
                    {fields?.policy_number?.value || <span className="text-risk-600 italic">Omitted</span>}
                  </span>
                  <span className="text-[9px] text-sage-700 font-mono">
                    {fields?.policy_number?.confidence ? `${Math.round(fields.policy_number.confidence * 100)}% conf` : ''}
                  </span>
                </div>

                {/* Insurer */}
                <div className="p-3.5 rounded-xl border border-paper-border bg-paper-bg">
                  <span className="text-[10px] text-warmgray font-mono block">Insurer</span>
                  <span className="font-semibold text-charcoal-900 block mt-0.5 truncate">
                    {fields?.insurer?.value || <span className="text-risk-600 italic">Unidentified</span>}
                  </span>
                  <span className="text-[9px] text-sage-700 font-mono">
                    {fields?.insurer?.confidence ? `${Math.round(fields.insurer.confidence * 100)}% conf` : ''}
                  </span>
                </div>

                {/* Policyholder */}
                <div className="p-3.5 rounded-xl border border-paper-border bg-paper-bg">
                  <span className="text-[10px] text-warmgray font-mono block">Policyholder</span>
                  <span className="font-semibold text-charcoal-900 block mt-0.5 truncate">
                    {fields?.policyholder?.value || <span className="text-risk-600 italic">Omitted</span>}
                  </span>
                  <span className="text-[9px] text-sage-700 font-mono">
                    {fields?.policyholder?.confidence ? `${Math.round(fields.policyholder.confidence * 100)}% conf` : ''}
                  </span>
                </div>

                {/* Policy Type */}
                <div className="p-3.5 rounded-xl border border-paper-border bg-paper-bg">
                  <span className="text-[10px] text-warmgray font-mono block">Policy Type</span>
                  <span className="font-semibold text-charcoal-900 block mt-0.5">
                    {fields?.policy_type?.value || 'Commercial Policy'}
                  </span>
                </div>

                {/* Effective Date */}
                <div className="p-3.5 rounded-xl border border-paper-border bg-paper-bg">
                  <span className="text-[10px] text-warmgray font-mono block">Effective Date</span>
                  <span className="font-mono font-bold text-charcoal-900 block mt-0.5">
                    {fields?.effective_date?.value || 'N/A'}
                  </span>
                </div>

                {/* Expiry Date */}
                <div className="p-3.5 rounded-xl border border-paper-border bg-paper-bg">
                  <span className="text-[10px] text-warmgray font-mono block">Expiry Date</span>
                  <span className="font-mono font-bold text-charcoal-900 block mt-0.5">
                    {fields?.expiry_date?.value || 'N/A'}
                  </span>
                </div>

                {/* Sum Insured */}
                <div className="p-3.5 rounded-xl border border-paper-border bg-paper-bg">
                  <span className="text-[10px] text-warmgray font-mono block">Sum Insured</span>
                  <span className="font-mono font-bold text-charcoal-900 block mt-0.5">
                    {fields?.coverage_inr?.value ? `₹${fields.coverage_inr.value.toLocaleString('en-IN')}` : 'N/A'}
                  </span>
                </div>

                {/* Premium Rate */}
                <div className="p-3.5 rounded-xl border border-paper-border bg-paper-bg">
                  <span className="text-[10px] text-warmgray font-mono block">Premium Rate</span>
                  <span className="font-mono font-bold text-amber-700 block mt-0.5">
                    {fields?.premium_rate_percent?.value ? `${fields.premium_rate_percent.value}% p.a.` : 'N/A'}
                  </span>
                </div>

                {/* Annual Premium */}
                <div className="p-3.5 rounded-xl border border-paper-border bg-paper-bg">
                  <span className="text-[10px] text-warmgray font-mono block">Annual Premium</span>
                  <span className="font-mono font-bold text-charcoal-900 block mt-0.5">
                    {fields?.premium_inr?.value ? `₹${fields.premium_inr.value.toLocaleString('en-IN')}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
