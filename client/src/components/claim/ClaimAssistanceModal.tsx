import React, { useState, useRef, useEffect } from 'react';
import {
  X, ShieldCheck, ExternalLink, FileText, User, Phone, Mail,
  Building2, Hash, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight,
  Upload, Trash2, CalendarDays, MessageSquare, HelpCircle, ClipboardList,
  ChevronRight, AlertCircle, Loader2, Sparkles, FileCheck, Lock
} from 'lucide-react';
import { useClaimStore, ClaimFormData, CLAIM_STATUS_STEPS, lookupVerifiedClaimPortal } from '../../store/useClaimStore';
import { useVerifyStore, VerificationRecord } from '../../store/useVerifyStore';
import { useProviderStore } from '../../store/useProviderStore';

// ─── Document Checklist by Policy Type ────────────────────────────────────────
const CHECKLIST_BY_POLICY_TYPE: Record<string, { label: string; available: boolean }[]> = {
  health: [
    { label: 'Insurance Policy Document', available: true },
    { label: 'Government-issued Identity Proof', available: true },
    { label: 'Hospital Bills & Discharge Summary', available: false },
    { label: "Doctor's Prescription & Medical Reports", available: false },
    { label: 'Laboratory / Diagnostic Test Reports', available: false },
    { label: 'Claim Form (from insurer)', available: false },
  ],
  vehicle: [
    { label: 'Insurance Policy Certificate', available: true },
    { label: 'Vehicle Registration Certificate (RC)', available: false },
    { label: "Driver's License of Driver at Time of Incident", available: false },
    { label: 'FIR / Police Report (for theft or major accident)', available: false },
    { label: 'Repair Estimate from Authorized Garage', available: false },
    { label: 'Photographs of Damage', available: false },
  ],
  life: [
    { label: 'Original Policy Bond / Document', available: true },
    { label: 'Death Certificate (for death claims)', available: false },
    { label: "Nominee's Identity Proof", available: false },
    { label: 'Medical / Hospital Certificate', available: false },
    { label: 'NEFT Bank Account Details of Nominee', available: false },
  ],
  travel: [
    { label: 'Insurance Policy / Certificate', available: true },
    { label: 'Passport & Visa Copies', available: false },
    { label: 'Flight Ticket & Boarding Pass', available: false },
    { label: 'Medical / Hospital Bills (for medical claims)', available: false },
    { label: 'Property Irregularity Report (for baggage claims)', available: false },
  ],
  property: [
    { label: 'Insurance Policy Document', available: true },
    { label: 'FIR / Fire Brigade Report', available: false },
    { label: 'Property Ownership Documents', available: false },
    { label: 'Photographs of Damage / Loss', available: false },
    { label: 'Repair / Replacement Estimates', available: false },
  ],
};

const DEFAULT_CHECKLIST = [
  { label: 'Insurance Policy Document', available: true },
  { label: 'Government-issued Identity Proof', available: true },
  { label: 'Bills / Receipts Related to Claim', available: false },
  { label: 'Incident Report / FIR (if applicable)', available: false },
  { label: 'Supporting Medical Documents (if applicable)', available: false },
  { label: 'Other Supporting Documents', available: false },
];

function getChecklist(policyType?: string | null) {
  if (!policyType) return DEFAULT_CHECKLIST;
  const lower = policyType.toLowerCase();
  if (lower.includes('health') || lower.includes('medical')) return CHECKLIST_BY_POLICY_TYPE.health;
  if (lower.includes('vehicle') || lower.includes('motor') || lower.includes('car') || lower.includes('auto')) return CHECKLIST_BY_POLICY_TYPE.vehicle;
  if (lower.includes('life') || lower.includes('term')) return CHECKLIST_BY_POLICY_TYPE.life;
  if (lower.includes('travel')) return CHECKLIST_BY_POLICY_TYPE.travel;
  if (lower.includes('property') || lower.includes('home')) return CHECKLIST_BY_POLICY_TYPE.property;
  return DEFAULT_CHECKLIST;
}

const CLAIM_TYPES = [
  'Hospitalisation / Medical Claim',
  'Accident / Injury Claim',
  'Property Damage / Loss Claim',
  'Vehicle Accident Claim',
  'Vehicle Theft Claim',
  'Travel Disruption / Baggage Loss',
  'Life / Death Benefit Claim',
  'Critical Illness Claim',
  'Disability Claim',
  'Other',
];

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeIn = 'animate-[fadeInUp_0.3s_ease_both]';

// ─── Main Modal ───────────────────────────────────────────────────────────────
interface ClaimAssistanceModalProps {
  verification: VerificationRecord;
}

export const ClaimAssistanceModal: React.FC<ClaimAssistanceModalProps> = ({ verification }) => {
  const { isModalOpen, activeStep, closeClaimModal, setActiveStep, submitClaimAssistance, isSubmitting, submitError, lastSubmittedClaimId, clearSubmitError } = useClaimStore();
  const { openRedirectModal, providers } = useProviderStore();

  const fields = verification.extractedFields;
  const extractedInsurer = (verification as any).carrierName || fields?.insurer?.value || verification.trustedRegistryMatch?.providerName || '';
  const extractedPolicyNumber = fields?.policy_number?.value || '';
  const extractedPolicyType = fields?.policy_type?.value || '';
  const extractedPolicyholder = fields?.policyholder?.value || '';

  const portalInfo = lookupVerifiedClaimPortal(extractedInsurer);
  const checklist = getChecklist(extractedPolicyType);

  // Pre-fill form from extracted data
  const [form, setForm] = useState<ClaimFormData>({
    fullName: extractedPolicyholder || '',
    email: '',
    phone: '',
    insuranceCompany: extractedInsurer || '',
    policyNumber: extractedPolicyNumber || '',
    policyType: extractedPolicyType || '',
    claimType: '',
    dateOfIncident: '',
    description: '',
    preferredContactMethod: 'email',
    supportingFiles: [],
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ClaimFormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      clearSubmitError();
      setFormErrors({});
    }
  }, [isModalOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) closeClaimModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const updateField = (key: keyof ClaimFormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setFormErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validateAssistanceForm = (): boolean => {
    const errors: Partial<Record<keyof ClaimFormData, string>> = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!form.email.trim() && !form.phone.trim()) {
      errors.email = 'Provide at least one contact method.';
      errors.phone = 'Provide at least one contact method.';
    }
    if (!form.insuranceCompany.trim()) errors.insuranceCompany = 'Insurance company is required.';
    if (!form.policyNumber.trim()) errors.policyNumber = 'Policy number is required.';
    if (!form.claimType) errors.claimType = 'Please select a claim type.';
    if (!form.dateOfIncident) errors.dateOfIncident = 'Date of incident is required.';
    if (!form.description.trim() || form.description.trim().length < 20) errors.description = 'Please provide at least 20 characters.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAssistanceForm()) return;
    try {
      await submitClaimAssistance(form, verification.verificationId);
    } catch (_e) {
      // Error is in store already
    }
  };

  const handleFileAdd = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.size <= 10 * 1024 * 1024);
    setForm(prev => ({
      ...prev,
      supportingFiles: [...prev.supportingFiles, ...newFiles].slice(0, 5)
    }));
  };

  const removeFile = (idx: number) => {
    setForm(prev => ({
      ...prev,
      supportingFiles: prev.supportingFiles.filter((_, i) => i !== idx)
    }));
  };

  // ─── Backdrop & Container ────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) closeClaimModal(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Claim Insurance Modal"
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-2xl bg-[#0D131F] border border-slate-700/60 rounded-3xl shadow-2xl shadow-black/60 flex flex-col max-h-[92vh] overflow-hidden ${fadeIn}`}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <ShieldCheck size={18} className="text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Claim Insurance</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {activeStep === 'choose' && 'Choose how to proceed with your claim'}
                {activeStep === 'direct' && 'Claim Directly With Your Insurer'}
                {activeStep === 'assistance' && 'Request Claim Assistance'}
                {activeStep === 'success' && 'Request Submitted'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(activeStep === 'direct' || activeStep === 'assistance') && (
              <button
                onClick={() => setActiveStep('choose')}
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                aria-label="Go back"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <button
              onClick={closeClaimModal}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ─── Step: Choose ──────────────────────────────────────────────── */}
          {activeStep === 'choose' && (
            <div className={`p-6 space-y-5 ${fadeIn}`}>
              {/* Verified Policy Summary */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-700/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <FileCheck size={14} />
                  <span>Verified Policy Ready for Claim</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mt-1">
                  <div>
                    <span className="text-slate-400 block">Insurance Company</span>
                    <span className="text-slate-100 font-semibold">{extractedInsurer || 'Not extracted'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Policy Number</span>
                    <span className="text-slate-100 font-semibold font-mono">{extractedPolicyNumber || 'Not extracted'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Policy Type</span>
                    <span className="text-slate-100 font-semibold">{extractedPolicyType || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Policyholder</span>
                    <span className="text-slate-100 font-semibold">{extractedPolicyholder || 'Not extracted'}</span>
                  </div>
                </div>
              </div>

              {/* Choose Method Cards */}
              <p className="text-xs text-slate-400 font-medium">How would you like to proceed?</p>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Option A: Direct Insurer */}
                <button
                  id="claim-direct-btn"
                  onClick={() => setActiveStep('direct')}
                  className="text-left p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 hover:bg-cyan-950/30 hover:border-cyan-400/60 transition-all group space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Claim Through Insurer</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Go directly to your insurance company's official claim portal to submit your claim.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold">
                    <span>View Portal Details</span>
                    <ChevronRight size={12} />
                  </div>
                </button>

                {/* Option B: Claim Assistance */}
                <button
                  id="claim-assistance-btn"
                  onClick={() => setActiveStep('assistance')}
                  className="text-left p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 hover:bg-emerald-950/30 hover:border-emerald-400/60 transition-all group space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <HelpCircle size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Request Claim Assistance</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Not sure how to file a claim? Submit your details and get step-by-step guidance from ClearClaim.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <span>Start Assistance Request</span>
                    <ChevronRight size={12} />
                  </div>
                </button>
              </div>

              {/* Document Checklist */}
              <DocumentChecklist policyType={extractedPolicyType} />

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 leading-relaxed flex items-start gap-2">
                <Lock size={12} className="text-slate-500 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-slate-300">ClearClaim is a verification and guidance platform</strong> — not an insurance company. Claim assistance requests are logged securely and not shared with insurers without your consent.
                </span>
              </div>
            </div>
          )}

          {/* ─── Step: Direct Insurer ──────────────────────────────────────── */}
          {activeStep === 'direct' && (
            <DirectInsurerPanel
              insurer={extractedInsurer}
              policyNumber={extractedPolicyNumber}
              policyType={extractedPolicyType}
              portalInfo={portalInfo}
              providers={providers}
              openRedirectModal={openRedirectModal}
              checklist={checklist}
            />
          )}

          {/* ─── Step: Assistance Form ─────────────────────────────────────── */}
          {activeStep === 'assistance' && (
            <AssistanceForm
              form={form}
              errors={formErrors}
              isSubmitting={isSubmitting}
              submitError={submitError}
              fileInputRef={fileInputRef}
              updateField={updateField}
              handleSubmit={handleSubmit}
              handleFileAdd={handleFileAdd}
              removeFile={removeFile}
              checklist={checklist}
            />
          )}

          {/* ─── Step: Success ─────────────────────────────────────────────── */}
          {activeStep === 'success' && lastSubmittedClaimId && (
            <SuccessPanel claimId={lastSubmittedClaimId} onClose={closeClaimModal} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Document Checklist Sub-component ────────────────────────────────────────
function DocumentChecklist({ policyType }: { policyType?: string }) {
  const checklist = getChecklist(policyType);
  return (
    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
        <ClipboardList size={14} className="text-cyan-400" />
        <span>Documents You May Need</span>
      </div>
      <div className="space-y-1.5">
        {checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              {item.available ? <CheckCircle2 size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
            </div>
            <span className={item.available ? 'text-slate-200' : 'text-slate-400'}>{item.label}</span>
            {item.available && <span className="text-[10px] text-emerald-500 font-semibold">(Available from policy)</span>}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        This checklist is informational only. Actual document requirements vary by insurer, claim type, and individual circumstances.
      </p>
    </div>
  );
}

// ─── Direct Insurer Panel ─────────────────────────────────────────────────────
function DirectInsurerPanel({
  insurer, policyNumber, policyType, portalInfo, providers, openRedirectModal, checklist
}: any) {
  const matchedProvider = providers.find((p: any) =>
    insurer && (
      p.providerName.toLowerCase().includes(insurer.toLowerCase()) ||
      insurer.toLowerCase().includes(p.shortName.toLowerCase())
    )
  );

  return (
    <div className={`p-6 space-y-5 ${fadeIn}`}>
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Building2 size={16} className="text-cyan-400" />
          Claim Directly With Your Insurer
        </h3>

        <div className="grid grid-cols-1 gap-3 text-xs">
          <InfoRow label="Insurance Provider" value={insurer || 'Not detected from document'} highlight />
          <InfoRow label="Policy Number" value={policyNumber || 'Not extracted'} mono />
          <InfoRow label="Policy Type" value={policyType || 'Not specified'} />
        </div>

        {portalInfo ? (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Use the insurer's official claim portal to submit your claim. ClearClaim will open this link in a new tab for your safety.
            </p>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-700/40 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-emerald-400 font-semibold">{portalInfo.label}</span>
                <p className="text-slate-400 text-[10px] mt-0.5">Verified official claims page</p>
              </div>
              <a
                id="go-to-official-claim-page"
                href={portalInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all whitespace-nowrap"
                onClick={() => {
                  // Audit-friendly: log before redirect
                  console.info('[ClearClaim] User redirecting to official insurer claim portal:', portalInfo.url);
                }}
              >
                <ExternalLink size={13} />
                Go to Official Claim Page
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-700/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <AlertTriangle size={14} />
              <span>Official Claim Portal Not Found</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              We couldn't verify the official claim portal for <strong>{insurer || 'this insurer'}</strong>.
              For your security, ClearClaim will not provide an unverified link.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Please visit your insurer's official website directly and locate their "Claims" or "File a Claim" section.
            </p>
            {matchedProvider && (
              <button
                onClick={() => openRedirectModal(matchedProvider)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
              >
                <ExternalLink size={12} />
                Visit {matchedProvider.shortName} Official Website
              </button>
            )}
          </div>
        )}
      </div>

      {/* Checklist */}
      <DocumentChecklist policyType={policyType} />

      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 leading-relaxed flex items-start gap-2">
        <Lock size={12} className="text-slate-500 mt-0.5 shrink-0" />
        <span>
          ClearClaim does not submit claims on your behalf when using the direct insurer option. You will be redirected to the insurer's official portal to complete the process independently.
        </span>
      </div>
    </div>
  );
}

// ─── Assistance Form ──────────────────────────────────────────────────────────
function AssistanceForm({ form, errors, isSubmitting, submitError, fileInputRef, updateField, handleSubmit, handleFileAdd, removeFile, checklist }: any) {
  return (
    <div className={`p-6 space-y-5 ${fadeIn}`}>
      <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-cyan-200 leading-relaxed flex items-start gap-2">
        <Sparkles size={12} className="text-cyan-400 mt-0.5 shrink-0" />
        <span>Policy information has been <strong>auto-filled</strong> from your verified document. Please review and correct any inaccurate details before submitting.</span>
      </div>

      <div className="space-y-4">
        {/* Personal Information */}
        <SectionHeading icon={<User size={14} />} title="Personal Information" />

        <FormField
          label="Full Name"
          required
          error={errors.fullName}
          hint="Name of the primary policyholder or claimant"
        >
          <input
            id="claim-fullname"
            type="text"
            value={form.fullName}
            onChange={e => updateField('fullName', e.target.value)}
            placeholder="e.g. Aditya Sharma"
            className={clsInput(errors.fullName)}
          />
        </FormField>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Email Address" error={errors.email}>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="claim-email"
                type="email"
                value={form.email}
                onChange={e => updateField('email', e.target.value)}
                placeholder="you@example.com"
                className={`${clsInput(errors.email)} pl-8`}
              />
            </div>
          </FormField>

          <FormField label="Phone Number" error={errors.phone}>
            <div className="relative">
              <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="claim-phone"
                type="tel"
                value={form.phone}
                onChange={e => updateField('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className={`${clsInput(errors.phone)} pl-8`}
              />
            </div>
          </FormField>
        </div>

        {/* Policy Details */}
        <SectionHeading icon={<FileText size={14} />} title="Policy Details" />

        <FormField label="Insurance Company" required error={errors.insuranceCompany}>
          <div className="relative">
            <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="claim-insurer"
              type="text"
              value={form.insuranceCompany}
              onChange={e => updateField('insuranceCompany', e.target.value)}
              placeholder="e.g. HDFC ERGO General Insurance"
              className={`${clsInput(errors.insuranceCompany)} pl-8`}
            />
          </div>
        </FormField>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Policy Number" required error={errors.policyNumber}>
            <div className="relative">
              <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="claim-policy-number"
                type="text"
                value={form.policyNumber}
                onChange={e => updateField('policyNumber', e.target.value)}
                placeholder="e.g. POL-2026-001234"
                className={`${clsInput(errors.policyNumber)} pl-8 font-mono`}
              />
            </div>
          </FormField>

          <FormField label="Policy Type">
            <input
              id="claim-policy-type"
              type="text"
              value={form.policyType}
              onChange={e => updateField('policyType', e.target.value)}
              placeholder="e.g. Health Insurance"
              className={clsInput()}
            />
          </FormField>
        </div>

        {/* Claim Details */}
        <SectionHeading icon={<ClipboardList size={14} />} title="Claim Details" />

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Claim Type" required error={errors.claimType}>
            <select
              id="claim-type"
              value={form.claimType}
              onChange={e => updateField('claimType', e.target.value)}
              className={clsInput(errors.claimType)}
            >
              <option value="">Select claim type…</option>
              {CLAIM_TYPES.map(ct => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Date of Incident" required error={errors.dateOfIncident}>
            <div className="relative">
              <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="claim-date"
                type="date"
                value={form.dateOfIncident}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => updateField('dateOfIncident', e.target.value)}
                className={`${clsInput(errors.dateOfIncident)} pl-8`}
              />
            </div>
          </FormField>
        </div>

        <FormField label="Short Description of Claim" required error={errors.description} hint="Minimum 20 characters">
          <div className="relative">
            <MessageSquare size={13} className="absolute left-3 top-3.5 text-slate-500" />
            <textarea
              id="claim-description"
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Briefly describe what happened and what you are claiming for…"
              className={`${clsInput(errors.description)} pl-8 resize-none`}
            />
          </div>
          <div className="text-right text-[10px] text-slate-500">{form.description.length}/2000</div>
        </FormField>

        {/* Preferred Contact */}
        <FormField label="Preferred Contact Method">
          <div className="flex gap-3 flex-wrap">
            {(['email', 'phone', 'both'] as const).map(method => (
              <label key={method} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="contactMethod"
                  value={method}
                  checked={form.preferredContactMethod === method}
                  onChange={() => updateField('preferredContactMethod', method)}
                  className="accent-cyan-400"
                />
                <span className="text-xs text-slate-300 capitalize group-hover:text-white transition-colors">{method}</span>
              </label>
            ))}
          </div>
        </FormField>

        {/* Document Upload */}
        <SectionHeading icon={<Upload size={14} />} title="Upload Supporting Documents" />
        <p className="text-[11px] text-slate-400 -mt-2 leading-relaxed">
          Upload up to 5 files (PDF, JPG, PNG, DOC — max 10MB each). Documents are stored securely and not shared publicly.
        </p>

        <div
          className="border-2 border-dashed border-slate-700 rounded-2xl p-5 text-center cursor-pointer hover:border-cyan-500/60 transition-colors group"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={22} className="text-slate-500 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
          <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
            Click to upload or drag & drop
          </p>
          <p className="text-[10px] text-slate-500 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx"
            className="hidden"
            onChange={e => handleFileAdd(e.target.files)}
          />
        </div>

        {form.supportingFiles.length > 0 && (
          <div className="space-y-2">
            {form.supportingFiles.map((f: File, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-cyan-400 shrink-0" />
                  <span className="text-slate-300 truncate max-w-xs">{f.name}</span>
                  <span className="text-slate-500">({(f.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Checklist */}
        <DocumentChecklist policyType={form.policyType} />

        {/* Submit Error */}
        {submitError && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 leading-relaxed flex items-start gap-2">
          <Lock size={12} className="text-slate-500 mt-0.5 shrink-0" />
          <span>
            This is a <strong className="text-slate-300">ClearClaim assistance request</strong> — not an actual insurance claim with your insurer. Our team will review your information and provide guidance on how to proceed with your insurer's official claims process.
          </span>
        </div>

        {/* Submit Button */}
        <button
          id="submit-claim-assistance"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full btn-primary !py-3 text-sm"
        >
          {isSubmitting
            ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
            : <><CheckCircle2 size={16} /> Submit Claim Assistance Request</>}
        </button>
      </div>
    </div>
  );
}

// ─── Success Panel ────────────────────────────────────────────────────────────
function SuccessPanel({ claimId, onClose }: { claimId: string; onClose: () => void }) {
  return (
    <div className={`p-6 space-y-6 ${fadeIn}`}>
      {/* Success Banner */}
      <div className="text-center space-y-3 py-2">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-700/60 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-lg font-bold text-white">Request Submitted Successfully</h3>
        <p className="text-sm text-slate-400">Your claim assistance request has been received.</p>
      </div>

      {/* Claim ID */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-700/40 text-center space-y-1">
        <p className="text-[11px] text-slate-400 font-medium">Claim Assistance Request ID</p>
        <p className="text-2xl font-black text-cyan-300 font-mono tracking-widest">{claimId}</p>
        <p className="text-[11px] text-slate-500">Save this ID to track your request status</p>
      </div>

      {/* Status Timeline */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Assistance Progress Timeline</h4>
        <div className="space-y-0">
          {CLAIM_STATUS_STEPS.map((step, idx) => {
            const isActive = idx === 0;
            const isDone = false;
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors ${
                    isActive
                      ? 'border-emerald-400 bg-emerald-950 text-emerald-400'
                      : isDone
                      ? 'border-cyan-500 bg-cyan-950 text-cyan-400'
                      : 'border-slate-700 bg-slate-900 text-slate-600'
                  }`}>
                    {isActive ? <CheckCircle2 size={12} /> : idx + 1}
                  </div>
                  {idx < CLAIM_STATUS_STEPS.length - 1 && (
                    <div className={`w-0.5 h-6 mt-0.5 ${isActive ? 'bg-emerald-700/40' : 'bg-slate-800'}`} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-xs font-semibold ${isActive ? 'text-emerald-300' : 'text-slate-400'}`}>{step.label}</p>
                  {isActive && (
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guidance Note */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-2">
        <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
          <HelpCircle size={13} />
          <span>What Happens Next</span>
        </div>
        <p>
          Our team can review the submitted information and guide you through the next steps for your insurance claim. This is an <strong>assistance service</strong> — your actual claim must be filed directly with your insurance company.
        </p>
      </div>

      <button onClick={onClose} className="w-full btn-secondary !py-2.5 text-xs">
        Close
      </button>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────
function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-cyan-400">{icon}</span>
      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{title}</h4>
    </div>
  );
}

function FormField({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-slate-500 font-normal">— {hint}</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
      <span className="text-slate-400 text-[11px] shrink-0">{label}</span>
      <span className={`font-semibold text-right truncate max-w-[60%] ${mono ? 'font-mono text-cyan-300' : highlight ? 'text-slate-100' : 'text-slate-300'}`}>
        {value}
      </span>
    </div>
  );
}

function clsInput(error?: string) {
  return `w-full bg-slate-900/70 border ${error ? 'border-red-700/70 focus:border-red-500' : 'border-slate-700 focus:border-cyan-500/70'} rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none transition-colors`;
}
