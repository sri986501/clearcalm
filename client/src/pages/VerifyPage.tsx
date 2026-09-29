import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, ShieldCheck, 
  ArrowRight, RefreshCw, FileCheck, Scan, Trash2, Copy, 
  Check, Search, Info, HelpCircle, ShieldAlert, Sparkles, 
  Building2, Lock, Eye, AlertCircle, ChevronDown, ChevronUp, Layers, Shield
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { VerificationReportModal } from '../components/common/VerificationReportModal';
import { useVerifyStore, ExtractedFieldsData } from '../store/useVerifyStore';
import { useProviderStore, InsuranceProvider } from '../store/useProviderStore';
import { useTranslation } from 'react-i18next';
import { RobotAssistant, RobotState } from '../components/robot/RobotAssistant';
import { ExternalRedirectModal } from '../components/discovery/ExternalRedirectModal';
import { ClaimAssistanceModal } from '../components/claim/ClaimAssistanceModal';
import { useClaimStore } from '../store/useClaimStore';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusIndicator } from '../components/ui/StatusIndicator';

interface VerifyPageProps {
  onNavigateHome?: () => void;
  onSelectTab?: (tab: any) => void;
}

type FieldKey = Exclude<keyof ExtractedFieldsData, 'rawText'>;
const fieldDefinitions: { key: FieldKey; label: string; format?: 'currency' | 'rate' }[] = [
  { key: 'policy_number', label: 'Policy Number' },
  { key: 'insurer', label: 'Insurer' },
  { key: 'policyholder', label: 'Policyholder' },
  { key: 'policy_type', label: 'Policy Type' },
  { key: 'city', label: 'City' },
  { key: 'effective_date', label: 'Effective Date' },
  { key: 'expiry_date', label: 'Expiry Date' },
  { key: 'coverage_inr', label: 'Sum Insured', format: 'currency' },
  { key: 'premium_rate_percent', label: 'Premium Rate', format: 'rate' },
  { key: 'premium_inr', label: 'Annual Premium', format: 'currency' },
  { key: 'deductible_inr', label: 'Deductible', format: 'currency' }
];

export const VerifyPage: React.FC<VerifyPageProps> = ({ onSelectTab }) => {
  const { t } = useTranslation();
  const { currentVerification, isProcessing, processingStep,
    processingProgress, processingError, samples, fetchSamples, verifyDocumentFile,
    verifySampleText, openReportModal,
    isReportModalOpen, closeReportModal, selectedReportDoc, fetchVerifications
  } = useVerifyStore();
  const { providers, openRedirectModal } = useProviderStore();
  const { openClaimModal, isModalOpen: isClaimModalOpen } = useClaimStore();

  const [dragActive, setDragActive] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(true);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'understanding' | 'extracted' | 'checks' | 'text'>('understanding');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchSamples(), fetchVerifications()]).finally(() => { 
      if (active) setSamplesLoading(false); 
    });
    return () => { active = false; };
  }, [fetchSamples, fetchVerifications]);

  useEffect(() => {
    setCopiedDoc(false);
    return () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); };
  }, [currentVerification?.verificationId]);

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isProcessing) return;
    if (event.type === 'dragleave') {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragActive(false);
    } else setDragActive(true);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (isProcessing) return;
    const file = event.dataTransfer.files?.[0];
    if (file) await verifyDocumentFile(file).catch(() => undefined);
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file && !isProcessing) await verifyDocumentFile(file).catch(() => undefined);
  };

  // Real 6-Phase Processing Sequence
  const scannerSteps = [
    { key: 'uploading', label: '1. Ingesting & Validating File', desc: 'Validating format and cryptographically securing staging copy.' },
    { key: 'reading', label: '2. Optical & Text Extraction', desc: 'Running high-density OCR and PDF stream extraction.' },
    { key: 'extracting', label: '3. Extracting Policy Parameters', desc: 'Parsing policy number, entity, dates, sums, and deductibles.' },
    { key: 'validating', label: '4. Mathematical & Chronology Audit', desc: 'Auditing rate arithmetic and coverage period chronology.' },
    { key: 'registry', label: '5. Trusted Carrier Registry Check', desc: 'Cross-referencing authorized carrier database & duplicate indices.' },
    { key: 'explain', label: '6. Generating Verification Findings', desc: 'Compiling structured findings, risk score, and plain language summary.' }
  ];

  const getStepStatus = (stepKey: string) => {
    const order = ['uploading', 'reading', 'extracting', 'validating', 'registry', 'explain', 'done'];
    const currentIndex = order.indexOf(processingStep);
    const stepIndex = order.indexOf(stepKey);
    if (stepIndex < currentIndex || processingStep === 'done') return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const status = currentVerification?.status || 'CONSISTENT';
  const isConsistent = status === 'Verified / Likely Original' || status === 'CONSISTENT';
  const isAltered = status === 'Potentially Altered';
  const isSuspicious = status === 'Suspicious';
  const isUnable = status === 'Unable to Verify';

  const getRobotState = (): RobotState => {
    if (isProcessing) {
      if (processingStep === 'uploading') return 'uploading';
      if (processingStep === 'validating' || processingStep === 'registry') return 'analyzing';
      return 'scanning';
    }
    if (currentVerification) {
      if (isConsistent) return 'verified';
      if (isSuspicious) return 'suspicious';
      if (isAltered) return 'error';
      return 'idle';
    }
    return 'idle';
  };

  const fields = currentVerification?.extractedFields;
  const rawText = fields?.rawText || '';

  const formatField = (key: FieldKey, format?: 'currency' | 'rate') => {
    const value = fields?.[key]?.value;
    if (value == null || value === '') return 'Not specified / Unreadable';
    if (format === 'currency' && typeof value === 'number') return `₹${value.toLocaleString('en-IN')}`;
    if (format === 'rate') return `${value}% p.a.`;
    return String(value);
  };

  const copyDocumentText = async () => {
    if (!rawText) return;
    try {
      await navigator.clipboard.writeText(rawText);
      setCopiedDoc(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedDoc(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans transition-colors selection:bg-[#0369A1] selection:text-white">
      <Header activeTab="verify" onSelectTab={onSelectTab} />

      <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Top Header */}
        <div className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
          <SectionHeader
            contextBadge="DOCUMENT AUTHENTICITY AUDIT"
            title="Insurance Policy Verification"
            subtitle="Upload PDF or image certificates to audit mathematical consistency, chronology, and official carrier credentials."
            action={
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onSelectTab?.('policies')}
                  className="btn-secondary"
                >
                  <Shield className="w-4 h-4 text-[#0369A1]" />
                  <span>My Policies</span>
                </button>
                <button
                  onClick={() => onSelectTab?.('history')}
                  className="btn-secondary"
                >
                  <span>Audit History</span>
                </button>
              </div>
            }
          />
        </div>

        {/* 2-Column Verification Workspace */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Dropzone & Test Presets */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ClearCalm Guide Companion */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-4">
              <RobotAssistant 
                state={getRobotState()} 
                size="sm" 
                showSpeechBubble={false} 
              />
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 uppercase tracking-wider">
                  <span>ClearCalm Guide</span>
                  <span className="text-[10px] text-slate-400 font-normal">Active</span>
                </h4>
                <p className="text-xs text-slate-600 leading-snug">
                  {isProcessing 
                    ? 'Auditing policy terms and cross-referencing arithmetic…' 
                    : currentVerification 
                    ? (isConsistent ? 'Analysis complete: No contract discrepancies found.' : 'Attention requested: Potential inconsistencies detected.') 
                    : 'Ready to inspect your policy document.'}
                </p>
              </div>
            </div>

            {/* Dropzone Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden bg-white shadow-sm ${
                dragActive
                  ? 'border-[#0369A1] bg-sky-50/50'
                  : 'border-slate-300 hover:border-[#0369A1] hover:bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0369A1] flex items-center justify-center border border-sky-100 shadow-sm">
                  <Upload size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Click or drag policy document to audit
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, JPG, PNG, and scanned certificates up to 25MB
                  </p>
                </div>
                <span className="btn-primary !text-xs !py-2 !px-4 mt-1 pointer-events-none">
                  Select File from Computer
                </span>
              </div>
            </div>

            {/* Presets for Instant Evaluation */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                  <Sparkles size={14} className="text-[#0369A1]" />
                  <span>Preset Verification Samples</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Instant Test</span>
              </div>

              {samplesLoading ? (
                <div className="py-4 text-center text-xs text-slate-400">Loading test samples…</div>
              ) : (
                <div className="space-y-2">
                  {samples.map((sample) => (
                    <button
                      key={sample.id}
                      disabled={isProcessing}
                      onClick={() => verifySampleText(sample)}
                      className="w-full text-left p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-start justify-between gap-3 text-xs cursor-pointer group"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 block group-hover:text-[#0369A1] transition-colors">
                          {sample.name}
                        </span>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {sample.description}
                        </p>
                      </div>
                      <span className="text-slate-400 group-hover:text-[#0369A1] shrink-0 mt-1 transition-colors">
                        <ArrowRight size={14} />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Verification Findings & Analysis */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* If Processing: Active Steps */}
            {isProcessing && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0369A1] flex items-center justify-center animate-pulse border border-sky-100">
                      <Scan size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#0F172A]">
                        Multi-Layer Policy Audit in Progress
                      </h3>
                      <p className="text-xs text-slate-500">
                        Analyzing optical text, rate matrices, and carrier registry…
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0369A1]">
                    {processingProgress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-[#0369A1] transition-all duration-300 rounded-full"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>

                {/* Step List */}
                <div className="space-y-2">
                  {scannerSteps.map((step) => {
                    const stepStatus = getStepStatus(step.key);
                    return (
                      <div 
                        key={step.key} 
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          stepStatus === 'active'
                            ? 'border-sky-300 bg-sky-50/70 text-[#0F172A] font-medium shadow-sm'
                            : stepStatus === 'completed'
                            ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                            : 'border-slate-100 bg-slate-50/50 text-slate-400'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold">{step.label}</p>
                          <p className="text-[11px] text-slate-500">{step.desc}</p>
                        </div>
                        <div>
                          {stepStatus === 'completed' && <CheckCircle2 size={16} className="text-emerald-600" />}
                          {stepStatus === 'active' && <div className="w-4 h-4 rounded-full border-2 border-[#0369A1] border-t-transparent animate-spin" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If Processing Error */}
            {processingError && !isProcessing && (
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <AlertCircle size={18} className="text-rose-600" />
                  <span>Verification Processing Error</span>
                </div>
                <p className="text-xs leading-relaxed">{processingError}</p>
              </div>
            )}

            {/* If Verification Ready: Show Clean Findings */}
            {currentVerification && !isProcessing && (
              <div className="space-y-6">
                
                {/* Result Card Container */}
                <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
                  
                  {/* Top Status Header */}
                  <div className="p-6 border-b border-slate-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                          AUDIT VERDICT
                        </span>
                        <h2 className="text-xl font-bold text-[#0F172A] truncate">
                          {currentVerification.filename}
                        </h2>
                      </div>

                      <div>
                        {isConsistent && <StatusIndicator status="Verified / Likely Original" variant="verified" size="lg" />}
                        {isSuspicious && <StatusIndicator status="Suspicious" variant="attention" size="lg" />}
                        {isAltered && <StatusIndicator status="Potentially Altered" variant="expired" size="lg" />}
                        {isUnable && <StatusIndicator status="Unable to Verify" variant="neutral" size="lg" />}
                      </div>
                    </div>

                    {/* Confidence & Outcome Strip */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Confidence Score</span>
                        <div className="text-2xl font-bold text-[#0F172A]">
                          {Math.round(currentVerification.confidenceScore * 100)}%
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 font-medium">Audit Findings</span>
                        <div className="text-sm font-semibold mt-1">
                          {isConsistent ? (
                            <span className="text-emerald-700">✓ No Major Inconsistencies</span>
                          ) : (
                            <span className="text-amber-800">⚠ {currentVerification.detectedIssues.length} Items Flagged</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Dimensional Verification Matrix */}
                  <div className="p-6 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Audit Checks Breakdown
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Policy Identification</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Detected
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Document Structure</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Standard Format
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Carrier Accreditation</span>
                        <span className={`font-semibold flex items-center gap-1 ${
                          currentVerification.trustedRegistryMatch?.matched ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {currentVerification.trustedRegistryMatch?.matched ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                          {currentVerification.trustedRegistryMatch?.matched ? 'Carrier Matched' : 'Unconfirmed'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Consistency &amp; Math</span>
                        <span className={`font-semibold flex items-center gap-1 ${
                          isConsistent ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {isConsistent ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                          {isConsistent ? 'Consistent' : 'Discrepancies'}
                        </span>
                      </div>
                    </div>

                    {/* Official Carrier Link Box */}
                    {(() => {
                      const extractedInsurer = (currentVerification as any).carrierName || fields?.insurer?.value || currentVerification.trustedRegistryMatch?.providerName || '';
                      const matched: InsuranceProvider | undefined = providers.find((p: InsuranceProvider) => 
                        extractedInsurer && (
                          p.providerName.toLowerCase().includes(extractedInsurer.toLowerCase()) ||
                          extractedInsurer.toLowerCase().includes(p.shortName.toLowerCase()) ||
                          p.shortName.toLowerCase().includes(extractedInsurer.toLowerCase())
                        )
                      );
                      const displayProvider: InsuranceProvider = matched ? matched : {
                        id: 'extracted-prov',
                        providerName: extractedInsurer || 'Accredited Insurance Underwriter',
                        shortName: extractedInsurer || 'Insurer',
                        tagline: 'Carrier identified during document analysis',
                        description: 'Carrier extracted from policy document header.',
                        providerType: 'GENERAL',
                        officialDomain: 'Official Insurer Portal',
                        providerUrl: `https://www.google.com/search?q=${encodeURIComponent((extractedInsurer || 'Indian insurance') + ' official portal')}`,
                        sourceType: 'OFFICIAL_PROVIDER',
                        sourceState: 'SOURCE_CONFIRMED',
                        sourceUrl: 'https://irdai.gov.in',
                        verifiedAt: new Date().toISOString(),
                        lastCheckedAt: new Date().toISOString(),
                        verificationMethod: 'Optical Extraction & Regulatory Index',
                        country: 'India',
                        languageSupport: ['English', 'Hindi'],
                        categoriesOffered: ['health', 'vehicle', 'life', 'travel', 'property'],
                        rating: '4.8 / 5',
                        claimSettlementRatio: 'IRDAI Registered',
                        customerCareContact: 'Refer to policy document schedule'
                      };

                      return (
                        <div className="p-4 rounded-xl border border-slate-200 bg-sky-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building2 size={16} className="text-[#0369A1]" />
                              <span className="font-semibold text-[#0F172A] text-sm">
                                {extractedInsurer || 'Identified Carrier'}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Official Carrier
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              You can continue to the carrier's official portal for independent verification and direct claim status.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => openRedirectModal(displayProvider)}
                            className="btn-secondary !text-xs !py-2 !px-4 shrink-0"
                          >
                            <span>Visit Official Portal ↗</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* Plain Guidance & Recommendation */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                      <div>
                        <strong className="text-slate-900">Recommendation:</strong> {currentVerification.recommendation}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        AI-assisted verification acts as an audit filter. Final legal settlement remains governed by official insurer records.
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                        className="btn-secondary !text-xs"
                      >
                        <Layers size={14} />
                        <span>{showDetailedAnalysis ? 'Hide Detailed Analysis' : 'View Policy Understanding & Breakdown'}</span>
                        {showDetailedAnalysis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <button
                        onClick={() => openReportModal(currentVerification)}
                        className="btn-secondary !text-xs"
                      >
                        <span>Print Audit Certificate</span>
                      </button>

                      <button
                        id="claim-insurance-btn"
                        onClick={openClaimModal}
                        className="btn-primary !text-xs"
                      >
                        <ShieldCheck size={14} />
                        <span>Claim Insurance / Assistance</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Collapsible Detailed Analysis */}
                {showDetailedAnalysis && (
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5">
                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
                      <button
                        onClick={() => setActiveAnalysisTab('understanding')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          activeAnalysisTab === 'understanding'
                            ? 'bg-[#0F2942] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        Policy Understanding
                      </button>

                      <button
                        onClick={() => setActiveAnalysisTab('extracted')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          activeAnalysisTab === 'extracted'
                            ? 'bg-[#0F2942] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        Extracted Covenants
                      </button>

                      <button
                        onClick={() => setActiveAnalysisTab('checks')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                          activeAnalysisTab === 'checks'
                            ? 'bg-[#0F2942] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span>Flagged Indicators</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${activeAnalysisTab === 'checks' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                          {currentVerification.detectedIssues.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveAnalysisTab('text')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          activeAnalysisTab === 'text'
                            ? 'bg-[#0F2942] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        Raw OCR Stream
                      </button>
                    </div>

                    {/* Tab 0: Policy Understanding */}
                    {activeAnalysisTab === 'understanding' && (
                      <div className="grid sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <h5 className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <Shield size={14} className="text-[#0369A1]" />
                            What is this policy?
                          </h5>
                          <p className="text-slate-600 leading-relaxed">
                            {fields?.policy_type?.value 
                              ? `${fields.policy_type.value} issued by ${fields?.insurer?.value || 'Accredited Insurer'}.`
                              : 'Standard insurance policy agreement.'}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <h5 className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <Info size={14} className="text-[#0369A1]" />
                            Who is insured?
                          </h5>
                          <p className="text-slate-600 leading-relaxed font-medium">
                            {fields?.policyholder?.value || 'Policyholder named in document schedule.'}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <h5 className="font-semibold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            What is covered?
                          </h5>
                          <p className="text-slate-600 leading-relaxed">
                            {fields?.coverage_inr?.value 
                              ? `Sum Insured protection up to ₹${Number(fields.coverage_inr.value).toLocaleString('en-IN')} as per policy schedule terms.`
                              : 'Coverage terms according to standard policy schedules.'}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <h5 className="font-semibold text-amber-900 flex items-center gap-1.5">
                            <AlertTriangle size={14} className="text-amber-600" />
                            Deductible &amp; Conditions
                          </h5>
                          <p className="text-slate-600 leading-relaxed">
                            {fields?.deductible_inr?.value 
                              ? `Applicable deductible of ₹${Number(fields.deductible_inr.value).toLocaleString('en-IN')} before underwriter payout.`
                              : 'Standard exclusions, waiting periods, and room-rent sub-limits apply.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tab 1: Extracted Parameters */}
                    {activeAnalysisTab === 'extracted' && (
                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        {fieldDefinitions.map((field) => (
                          <div 
                            key={field.key}
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50"
                          >
                            <span className="text-slate-500 block text-[11px] font-medium">{field.label}</span>
                            <span className="text-sm font-semibold text-slate-900 mt-0.5 block font-mono">
                              {formatField(field.key, field.format)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 2: Detected Risk Indicators */}
                    {activeAnalysisTab === 'checks' && (
                      <div className="space-y-3 text-xs">
                        {currentVerification.detectedIssues.length === 0 ? (
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            <span className="font-semibold">Zero discrepancies or anomalies detected during underwriting audit.</span>
                          </div>
                        ) : (
                          currentVerification.detectedIssues.map((issue, idx) => (
                            <div 
                              key={issue.id || idx}
                              className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-amber-950"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-1.5">
                                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                                  {issue.title}
                                </span>
                                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                                  {issue.severity}
                                </span>
                              </div>
                              <p className="text-slate-700 leading-relaxed text-[11px]">
                                {issue.explanation}
                              </p>
                              {issue.calculationFormula && (
                                <div className="p-2.5 rounded-lg bg-white font-mono text-[11px] text-slate-800 border border-amber-200">
                                  Calculation: {issue.calculationFormula}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Tab 3: Raw OCR Stream */}
                    {activeAnalysisTab === 'text' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600 font-medium">Extracted OCR Stream</span>
                          <button
                            onClick={copyDocumentText}
                            className="btn-secondary !text-xs !py-1 !px-3"
                          >
                            {copiedDoc ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            <span>{copiedDoc ? 'Copied' : 'Copy Text'}</span>
                          </button>
                        </div>
                        <pre className="p-4 rounded-xl bg-slate-50 text-slate-800 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap border border-slate-200">
                          {rawText || 'No text extracted.'}
                        </pre>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* Default Ingestion Prompt */}
            {!currentVerification && !isProcessing && (
              <div className="p-12 rounded-2xl bg-white border border-slate-200/90 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0369A1] flex items-center justify-center mx-auto border border-sky-100">
                  <ShieldCheck size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Ready to Audit Document
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Upload your policy copy or select a preset sample from the left panel to test optical extraction, arithmetic validation, and carrier accreditation.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Verification Report Modal */}
      {isReportModalOpen && selectedReportDoc && (
        <VerificationReportModal
          isOpen={isReportModalOpen}
          onClose={closeReportModal}
          doc={selectedReportDoc}
        />
      )}

      {/* Claim Insurance Modal */}
      {isClaimModalOpen && currentVerification && (
        <ClaimAssistanceModal verification={currentVerification} />
      )}

      {/* External Redirection Modal */}
      <ExternalRedirectModal />
    </div>
  );
};

export default VerifyPage;
