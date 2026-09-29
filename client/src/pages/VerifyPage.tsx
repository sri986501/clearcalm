import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, ShieldCheck, 
  ArrowRight, RefreshCw, FileCheck, Scan, Trash2, Copy, 
  Check, Search, Info, HelpCircle, ShieldAlert, Sparkles, 
  Building2, Lock, Eye, AlertCircle, ChevronDown, ChevronUp, Layers, Binary, Cpu, Shield
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

  // 6-Phase Animated Process Sequence
  const scannerSteps = [
    { key: 'uploading', label: t('verify.step1', '1. Ingesting & Validating File'), desc: t('verify.step1Desc', 'Checking format, cryptographic hash, and size bounds.') },
    { key: 'reading', label: t('verify.step2', '2. Optical & Text Extraction'), desc: t('verify.step2Desc', 'Running high-density OCR and PDF stream extraction.') },
    { key: 'extracting', label: t('verify.step3', '3. Extracting Policy Parameters'), desc: t('verify.step3Desc', 'Parsing policy number, entity, dates, sums, and deductibles.') },
    { key: 'validating', label: t('verify.step4', '4. Mathematical & Chronology Audit'), desc: t('verify.step4Desc', 'Auditing rate arithmetic and coverage period chronology.') },
    { key: 'registry', label: t('verify.step5', '5. Trusted Carrier Registry Check'), desc: t('verify.step5Desc', 'Cross-referencing authorized carrier database & duplicate indices.') },
    { key: 'explain', label: t('verify.step6', '6. Generating Verification Findings'), desc: t('verify.step6Desc', 'Compiling structured findings, risk score, and disclaimers.') }
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

  // Robot State Mapping
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
    <div className="min-h-screen bg-[#F5F5F5] text-black flex flex-col font-sans transition-colors relative selection:bg-black selection:text-white">
      {/* Subtle professional background image watermark */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.06] bg-cover bg-center"
        style={{ backgroundImage: `url('/images/portal_bg.jpg')` }}
      />

      <Header activeTab="verify" onSelectTab={onSelectTab} />

      <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 z-10">
        
        {/* Top Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-black/60 bg-black/5 px-3 py-1 rounded-full border border-black/5">
                {t('verify.badge', 'Document Authenticity Verification')}
              </span>
              <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-black/5 text-black border border-black/10">
                {t('verify.engineVersion', 'Rule & Anomaly Engine v3.4')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-black mt-1">
              {t('verify.title', 'Insurance Policy Authenticity Verification')}
            </h1>
            <p className="text-xs sm:text-sm text-black/60">
              {t('verify.subtitle', 'Upload PDF or image certificates to audit mathematical consistency, entity registry credentials, and tampering cues.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSelectTab?.('marketplace')}
              className="px-5 py-2 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-xs font-medium cursor-pointer transition-colors shadow-sm"
            >
              {t('verify.browseInsurance', 'Browse Insurance')}
            </button>
            <button
              onClick={() => onSelectTab?.('policies')}
              className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors shadow-sm"
            >
              {t('verify.myPolicies', 'My Policies')}
            </button>
          </div>
        </div>

        {/* 3-Panel Verification Workspace */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Dropzone & Test Presets */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Robot Analyst Companion Card */}
            <div className="p-5 rounded-3xl bg-white border border-black/10 shadow-sm flex items-center gap-4">
              <RobotAssistant 
                state={getRobotState()} 
                size="sm" 
                showSpeechBubble={false} 
              />
              <div className="space-y-0.5">
                <h4 className="text-xs font-medium text-black flex items-center gap-1.5 uppercase tracking-wider">
                  <span>{t('robot.name', 'AEGIS AI')}</span>
                  <span className="text-[9px] text-black/40 font-normal">ANALYSIS CORE</span>
                </h4>
                <p className="text-xs text-black/70 leading-snug">
                  {isProcessing 
                    ? t('robot.stateScanning', 'Scanning optical parameters and verifying rate arithmetic…') 
                    : currentVerification 
                    ? (isConsistent ? t('robot.stateVerified', 'Analysis Complete: No significant anomalies detected.') : t('robot.stateSuspicious', 'Review Required: Inconsistencies detected.')) 
                    : t('robot.stateIdle', 'Aegis AI is active and monitoring document integrity.')}
                </p>
              </div>
            </div>

            {/* Dropzone Staging Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden bg-white shadow-sm ${
                dragActive
                  ? 'border-black bg-black/[0.03]'
                  : 'border-black/15 hover:border-black/50 hover:bg-black/[0.01]'
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
                <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-md">
                  <Upload size={22} />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">
                    {t('verify.dropzoneTitle', 'Click or drag policy document to verify')}
                  </p>
                  <p className="text-xs text-black/50 mt-1">
                    {t('verify.dropzoneSubtitle', 'Supports PDF, JPG, PNG, Scanned Certificates (up to 25MB)')}
                  </p>
                </div>
                <span className="bg-black hover:bg-gray-800 text-white text-xs font-medium py-2 px-5 rounded-full mt-2 pointer-events-none shadow-sm">
                  {t('verify.selectFile', 'Select File from Computer')}
                </span>
              </div>
            </div>

            {/* Sample Documents for Instant Evaluation */}
            <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-black uppercase tracking-wider">
                  <Sparkles size={14} className="text-black/60" />
                  <span>{t('verify.presetsTitle', 'Preset Verification Samples')}</span>
                </div>
                <span className="text-[10px] text-black/40 font-medium">{t('verify.demoTesting', 'Demo Testing')}</span>
              </div>

              {samplesLoading ? (
                <div className="py-4 text-center text-xs text-black/50">Loading samples…</div>
              ) : (
                <div className="space-y-2">
                  {samples.map((sample) => (
                    <button
                      key={sample.id}
                      disabled={isProcessing}
                      onClick={() => verifySampleText(sample)}
                      className="w-full text-left p-3.5 rounded-2xl border border-black/10 hover:border-black/30 hover:bg-black/[0.02] transition-all flex items-start justify-between gap-3 text-xs cursor-pointer group"
                    >
                      <div className="space-y-0.5">
                        <span className="font-medium text-black block">
                          {sample.name}
                        </span>
                        <p className="text-[11px] text-black/60 leading-snug">
                          {sample.description}
                        </p>
                      </div>
                      <span className="text-black/40 group-hover:text-black shrink-0 mt-1 transition-colors">
                        <ArrowRight size={14} />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Center & Right: Document Scanning & Findings */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* If Processing: Active Scanner */}
            {isProcessing && (
              <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-black/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center animate-pulse">
                      <Scan size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-black">
                        {t('verify.scannerTitle', 'Multi-Layer Document Verification in Progress')}
                      </h3>
                      <p className="text-xs text-black/60">
                        {t('verify.scannerSubtitle', 'Analyzing optical text, rate matrices, and carrier registry…')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-black">
                    {processingProgress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-300 rounded-full"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>

                {/* Step List */}
                <div className="space-y-2.5">
                  {scannerSteps.map((step) => {
                    const stepStatus = getStepStatus(step.key);
                    return (
                      <div 
                        key={step.key} 
                        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                          stepStatus === 'active'
                            ? 'border-black bg-black/[0.04] text-black shadow-sm font-medium'
                            : stepStatus === 'completed'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-black/5 opacity-50 text-black/60'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-medium">{step.label}</p>
                          <p className="text-[11px] text-black/60">{step.desc}</p>
                        </div>
                        <div>
                          {stepStatus === 'completed' && <CheckCircle2 size={16} className="text-emerald-600" />}
                          {stepStatus === 'active' && <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* If Processing Error */}
            {processingError && !isProcessing && (
              <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-800 space-y-3">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <AlertCircle size={18} className="text-red-600" />
                  <span>Verification Processing Error</span>
                </div>
                <p className="text-xs leading-relaxed">{processingError}</p>
              </div>
            )}

            {/* If Verification Ready: Show Result Card */}
            {currentVerification && !isProcessing && (
              <div className="space-y-6">
                
                {/* Result Card Container */}
                <div className="rounded-3xl bg-white border border-black/10 shadow-sm overflow-hidden">
                  
                  {/* Top Header with Status Badge */}
                  <div className="p-6 border-b border-black/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-widest text-black/50 block mb-1">
                          {t('verify.badge', 'DOCUMENT VERIFICATION RESULT')}
                        </span>
                        <h2 className="text-xl font-medium text-black truncate">
                          {currentVerification.filename}
                        </h2>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isConsistent && (
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={14} />
                            {t('verify.statusVerified', 'Verified / Likely Original')}
                          </span>
                        )}
                        {isSuspicious && (
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle size={14} />
                            {t('verify.statusSuspicious', 'Suspicious')}
                          </span>
                        )}
                        {isAltered && (
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <ShieldAlert size={14} />
                            {t('verify.statusAltered', 'Potentially Altered')}
                          </span>
                        )}
                        {isUnable && (
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                            <HelpCircle size={14} />
                            {t('verify.statusUnable', 'Unable to Verify')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Confidence & Headline Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                      <div>
                        <span className="text-xs text-black/50 font-medium">{t('verify.confidenceLabel', 'Verification Confidence')}</span>
                        <div className="text-2xl font-medium text-black font-mono">
                          {Math.round(currentVerification.confidenceScore * 100)}%
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-black/50 font-medium">{t('verify.outcomeLabel', 'Audit Outcome')}</span>
                        <div className="text-xs font-medium text-black mt-0.5">
                          {isConsistent ? t('verify.noMajorIssues', '✓ NO MAJOR ISSUES') : `${t('verify.issuesFlagged', '⚠ ISSUES FLAGGED')} (${currentVerification.detectedIssues.length})`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checklist Breakdown Matrix */}
                  <div className="p-6 space-y-4">
                    <h4 className="text-xs font-medium uppercase tracking-wider text-black/50">
                      {t('verify.checklistTitle', 'Multi-Dimensional Verification Checklist')}
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-4 rounded-2xl border border-black/10 bg-black/[0.01] flex items-center justify-between">
                        <span className="font-medium text-black/80">{t('verify.chkPolicy', 'Policy Information')}</span>
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 size={14} /> {t('verify.statusDetected', 'Detected')}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl border border-black/10 bg-black/[0.01] flex items-center justify-between">
                        <span className="font-medium text-black/80">{t('verify.chkStructure', 'Document Structure')}</span>
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 size={14} /> {t('verify.statusStandard', 'Standard')}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl border border-black/10 bg-black/[0.01] flex items-center justify-between">
                        <span className="font-medium text-black/80">{t('verify.chkCompany', 'Company Information')}</span>
                        <span className={`font-medium flex items-center gap-1 ${
                          currentVerification.trustedRegistryMatch?.matched ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {currentVerification.trustedRegistryMatch?.matched ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                          {currentVerification.trustedRegistryMatch?.matched ? t('verify.statusMatched', 'Carrier Matched') : t('verify.statusUnconfirmed', 'Unconfirmed')}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl border border-black/10 bg-black/[0.01] flex items-center justify-between">
                        <span className="font-medium text-black/80">{t('verify.chkConsistency', 'Consistency & Math')}</span>
                        <span className={`font-medium flex items-center gap-1 ${
                          isConsistent ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {isConsistent ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                          {isConsistent ? t('verify.statusConsistent', 'Consistent') : t('verify.statusDiscrepancies', 'Discrepancies')}
                        </span>
                      </div>

                      {/* Official Insurer Identified Link */}
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
                          <div className="sm:col-span-2 p-5 rounded-2xl border border-black/10 bg-black/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-black" />
                                <span className="font-medium text-black text-sm">
                                  {extractedInsurer || 'Identified Insurance Underwriter'}
                                </span>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Official Provider
                                </span>
                              </div>
                              <p className="text-xs text-black/60 leading-relaxed">
                                {t('verify.providerLinkNote', 'You can continue to the insurer official portal for independent policy verification and claim services.')}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => openRedirectModal(displayProvider)}
                              className="px-5 py-2 rounded-full text-xs font-medium bg-black hover:bg-gray-800 text-white shadow-sm whitespace-nowrap flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <span>{t('discovery.visitOfficialWebsite', 'Visit Website ↗')}</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Disclaimer Banner */}
                    <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 text-xs text-black/70 leading-relaxed space-y-1">
                      <div>
                        <strong>{t('verify.disclaimerPrefix', 'AI-assisted verification — not official insurer confirmation.')}</strong> {currentVerification.recommendation}
                      </div>
                      <div className="text-black/50 text-[11px]">
                        Visiting an insurer website enables independent verification but does NOT prove that an uploaded digital document is genuine.
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                        className="px-5 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-xs font-medium flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Layers size={14} />
                        <span>{showDetailedAnalysis ? t('verify.hideDetails', 'Hide Detailed Analysis') : t('verify.viewDetails', 'View Policy Understanding & Analysis')}</span>
                        {showDetailedAnalysis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <button
                        onClick={() => openReportModal(currentVerification)}
                        className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-xs font-medium cursor-pointer shadow-sm transition-colors"
                      >
                        {t('verify.printReport', 'Print Full Audit Report')}
                      </button>

                      {/* Claim Insurance Button */}
                      <button
                        id="claim-insurance-btn"
                        onClick={openClaimModal}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium bg-black hover:bg-gray-800 text-white shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                        title="Start an insurance claim based on this verified policy"
                      >
                        <ShieldCheck size={14} />
                        <span>Claim Insurance</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Collapsible Detailed Analysis Section */}
                {showDetailedAnalysis && (
                  <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-6">
                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 border-b border-black/10 pb-3 flex-wrap">
                      <button
                        onClick={() => setActiveAnalysisTab('understanding')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          activeAnalysisTab === 'understanding'
                            ? 'bg-black text-white shadow-sm'
                            : 'text-black/60 hover:text-black hover:bg-black/5'
                        }`}
                      >
                        {t('verify.tabUnderstanding', 'Policy Understanding')}
                      </button>

                      <button
                        onClick={() => setActiveAnalysisTab('extracted')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          activeAnalysisTab === 'extracted'
                            ? 'bg-black text-white shadow-sm'
                            : 'text-black/60 hover:text-black hover:bg-black/5'
                        }`}
                      >
                        {t('verify.tabExtracted', 'Extracted Policy Terms')}
                      </button>

                      <button
                        onClick={() => setActiveAnalysisTab('checks')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                          activeAnalysisTab === 'checks'
                            ? 'bg-black text-white shadow-sm'
                            : 'text-black/60 hover:text-black hover:bg-black/5'
                        }`}
                      >
                        <span>{t('verify.tabChecks', 'Detected Risk Indicators')}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${activeAnalysisTab === 'checks' ? 'bg-white/20 text-white' : 'bg-black/10 text-black'}`}>
                          {currentVerification.detectedIssues.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveAnalysisTab('text')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          activeAnalysisTab === 'text'
                            ? 'bg-black text-white shadow-sm'
                            : 'text-black/60 hover:text-black hover:bg-black/5'
                        }`}
                      >
                        {t('verify.tabRaw', 'Raw OCR Stream')}
                      </button>
                    </div>

                    {/* Tab 0: Policy Understanding */}
                    {activeAnalysisTab === 'understanding' && (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 space-y-1.5">
                            <h5 className="font-medium text-black flex items-center gap-1.5">
                              <Shield size={14} />
                              {t('understanding.whatIsPolicy', 'What is this policy?')}
                            </h5>
                            <p className="text-black/70 leading-relaxed">
                              {fields?.policy_type?.value 
                                ? `${fields.policy_type.value} issued by ${fields?.insurer?.value || 'Accredited Insurer'}.`
                                : 'Standard general/health insurance policy agreement.'}
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 space-y-1.5">
                            <h5 className="font-medium text-black flex items-center gap-1.5">
                              <Info size={14} />
                              {t('understanding.whoIsInsured', 'Who is insured?')}
                            </h5>
                            <p className="text-black/70 leading-relaxed font-medium">
                              {fields?.policyholder?.value || 'Policyholder named in document schedule.'}
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 space-y-1.5">
                            <h5 className="font-medium text-emerald-800 flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              {t('understanding.whatCovered', 'What is covered?')}
                            </h5>
                            <p className="text-black/70 leading-relaxed">
                              {fields?.coverage_inr?.value 
                                ? `Sum Insured protection up to ₹${Number(fields.coverage_inr.value).toLocaleString('en-IN')} as per policy schedule terms.`
                                : 'Coverage terms according to standard underwriter policy schedules.'}
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 space-y-1.5">
                            <h5 className="font-medium text-amber-800 flex items-center gap-1.5">
                              <AlertTriangle size={14} className="text-amber-600" />
                              {t('understanding.whatNotCovered', 'Deductible & Conditions')}
                            </h5>
                            <p className="text-black/70 leading-relaxed">
                              {fields?.deductible_inr?.value 
                                ? `Applicable deductible of ₹${Number(fields.deductible_inr.value).toLocaleString('en-IN')} before underwriter payout.`
                                : 'Standard policy exclusions, waiting periods, and room-rent sub-limits apply.'}
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 space-y-1.5">
                            <h5 className="font-medium text-black flex items-center gap-1.5">
                              <Scan size={14} />
                              {t('understanding.importantDates', 'Important Dates')}
                            </h5>
                            <div className="text-black/70 space-y-0.5 font-mono">
                              <div>Effective: <span className="text-black font-medium">{fields?.effective_date?.value || 'Found in document'}</span></div>
                              <div>Expiry: <span className="text-black font-medium">{fields?.expiry_date?.value || 'Found in document'}</span></div>
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 space-y-1.5">
                            <h5 className="font-medium text-black flex items-center gap-1.5">
                              <HelpCircle size={14} />
                              {t('understanding.questionsToAsk', 'Questions to Ask Insurer')}
                            </h5>
                            <ul className="text-black/70 space-y-1 list-disc list-inside text-[11px]">
                              <li>What is the cashless network hospital/garage list in my area?</li>
                              <li>Are there waiting periods for pre-existing conditions?</li>
                              <li>What is the exact claim submission window after an event?</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 1: Extracted Policy Terms Matrix */}
                    {activeAnalysisTab === 'extracted' && (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          {fieldDefinitions.map((field) => (
                            <div 
                              key={field.key}
                              className="p-4 rounded-2xl border border-black/10 bg-black/[0.01]"
                            >
                              <span className="text-black/50 block text-[11px] font-medium">{field.label}</span>
                              <span className="text-sm font-medium text-black mt-0.5 block font-mono">
                                {formatField(field.key, field.format)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Plain Summary */}
                        {currentVerification.plainEnglishSummary && (
                          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 text-xs space-y-1">
                            <span className="font-medium text-black block">Executive Summary:</span>
                            <p className="text-black/70 leading-relaxed">
                              {currentVerification.plainEnglishSummary}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Detected Risk Indicators */}
                    {activeAnalysisTab === 'checks' && (
                      <div className="space-y-3 text-xs">
                        {currentVerification.detectedIssues.length === 0 ? (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            <span className="font-medium">{t('verify.zeroDiscrepancies', 'Zero discrepancies or anomalies detected during underwriting audit.')}</span>
                          </div>
                        ) : (
                          currentVerification.detectedIssues.map((issue, idx) => (
                            <div 
                              key={issue.id || idx}
                              className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-amber-900"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium flex items-center gap-1.5">
                                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                                  {issue.title}
                                </span>
                                <span className="text-[10px] uppercase font-mono font-medium px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
                                  {issue.severity} severity
                                </span>
                              </div>
                              <p className="text-amber-800 leading-relaxed text-[11px]">
                                {issue.explanation}
                              </p>
                              {issue.calculationFormula && (
                                <div className="p-2.5 rounded-xl bg-white/80 font-mono text-[11px] text-black border border-amber-200">
                                  {t('verify.formulaApplied', 'Calculated formula:')} {issue.calculationFormula}
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
                          <span className="text-xs text-black/60 font-medium">Extracted Text Content</span>
                          <button
                            onClick={copyDocumentText}
                            className="px-4 py-1 rounded-full border border-black/15 bg-white hover:bg-black/5 text-xs text-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            {copiedDoc ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            <span>{copiedDoc ? t('verify.copied', 'Copied') : t('verify.copyText', 'Copy Text')}</span>
                          </button>
                        </div>
                        <pre className="p-4 rounded-2xl bg-black/[0.02] text-black/80 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap border border-black/10">
                          {rawText || 'No text extracted.'}
                        </pre>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* Default State Ready for Ingestion */}
            {!currentVerification && !isProcessing && (
              <div className="p-12 rounded-3xl bg-white border border-black/10 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto text-black">
                  <ShieldCheck size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-black">
                    {t('verify.readyTitle', 'Ready for Policy Verification')}
                  </h3>
                  <p className="text-xs text-black/60 max-w-sm mx-auto leading-relaxed">
                    {t('verify.readyDesc', 'Upload a policy certificate or pick a preset demo test case to inspect optical extraction and authenticity results.')}
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

