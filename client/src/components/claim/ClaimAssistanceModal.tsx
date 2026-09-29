import React, { useState, useRef, useEffect } from 'react';
import {
  X, ShieldCheck, ExternalLink, FileText, User, Phone, Mail,
  Building2, Hash, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight,
  Upload, Trash2, CalendarDays, MessageSquare, HelpCircle, ClipboardList,
  ChevronRight, AlertCircle, Loader2, FileCheck, Lock
} from 'lucide-react';
import { useClaimStore, ClaimFormData, CLAIM_STATUS_STEPS, lookupVerifiedClaimPortal } from '../../store/useClaimStore';
import { useVerifyStore, VerificationRecord } from '../../store/useVerifyStore';
import { useProviderStore } from '../../store/useProviderStore';
import { StatusIndicator } from '../ui/StatusIndicator';

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

// Helper styles for inputs
const clsInput = (err?: string) => `
  w-full px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 outline-none
  bg-white border ${err ? 'border-rose-400 bg-rose-50/20 text-rose-950' : 'border-slate-300 text-slate-900'}
  placeholder:text-slate-400 focus:border-[#0369A1] focus:ring-2 focus:ring-sky-100
`;

interface ClaimAssistanceModalProps {
  verification: VerificationRecord;
}

export const ClaimAssistanceModal: React.FC<ClaimAssistanceModalProps> = ({ verification }) => {
  const { isModalOpen, activeStep, closeClaimModal, setActiveStep, submitClaimAssistance, isSubmitting, submitError, lastSubmittedClaimId, clearSubmitError } = useClaimStore();
  const { openRedirectModal, providers } = useProviderStore();

  const fields = verification?.extractedFields;
  const extractedInsurer = (verification as any)?.carrierName || fields?.insurer?.value || verification?.trustedRegistryMatch?.providerName || '';
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
      errors.email = 'Provide at least one contact email or phone.';
      errors.phone = 'Provide at least one contact email or phone.';
    }
    if (!form.insuranceCompany.trim()) errors.insuranceCompany = 'Insurance company is required.';
    if (!form.policyNumber.trim()) errors.policyNumber = 'Policy number is required.';
    if (!form.claimType) errors.claimType = 'Please select a claim category.';
    if (!form.dateOfIncident) errors.dateOfIncident = 'Date of incident is required.';
    if (!form.description.trim() || form.description.trim().length < 15) errors.description = 'Please describe the incident in at least 15 characters.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAssistanceForm()) return;
    try {
      await submitClaimAssistance(form, verification.verificationId);
    } catch (_e) {
      // Error in store
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) closeClaimModal(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Claim Filing & Guidance"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0369A1] flex items-center justify-center border border-sky-100">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">Claim Assistance &amp; Guidance</h2>
              <p className="text-xs text-slate-500 font-medium">
                {activeStep === 'choose' && 'Choose your preferred claim path'}
                {activeStep === 'direct' && 'Direct official insurer portal'}
                {activeStep === 'assistance' && 'ClearCalm claim concierge form'}
                {activeStep === 'success' && 'Filing recorded successfully'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(activeStep === 'direct' || activeStep === 'assistance') && (
              <button
                onClick={() => setActiveStep('choose')}
                className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            )}
            <button
              onClick={closeClaimModal}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">

          {/* 1. CHOOSE STEP */}
          {activeStep === 'choose' && (
            <div className="p-6 space-y-6">
              {/* Verified policy pill */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <FileCheck size={16} className="text-emerald-700 shrink-0" />
                  <span>Verified Policy Contract: {extractedPolicyNumber || 'Uploaded Copy'}</span>
                </div>
                <span className="text-emerald-800 font-medium truncate max-w-[200px]">{extractedInsurer || 'Official Carrier'}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[#0F172A]">
                  How would you like to proceed?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You can file directly on your insurer's official IRDAI portal, or request guidance from ClearCalm to prepare your documents and checklist.
                </p>
              </div>

              {/* Two clear choices without visual noise */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Option 1: Direct */}
                <div
                  onClick={() => setActiveStep('direct')}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0369A1] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-sky-50 group-hover:text-[#0369A1] transition-colors flex items-center justify-center">
                      <ExternalLink size={18} />
                    </div>
                    <h4 className="text-sm font-semibold text-[#0F172A]">
                      Claim Directly with Insurer
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Go directly to {extractedInsurer || "your carrier"}'s verified claims portal with your document checklist.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0369A1] pt-1">
                    <span>View Direct Portal</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                {/* Option 2: Assistance */}
                <div
                  onClick={() => setActiveStep('assistance')}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0369A1] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0369A1] flex items-center justify-center">
                      <MessageSquare size={18} />
                    </div>
                    <h4 className="text-sm font-semibold text-[#0F172A]">
                      ClearCalm Claim Assistance
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      We pre-fill your policy terms, review required bills, and audit coverage limits before you submit to the insurer.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0369A1] pt-1">
                    <span>Prepare Assistance Request</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>

              {/* Informational Checklist Preview */}
              <DocumentChecklist policyType={extractedPolicyType} />
            </div>
          )}

          {/* 2. DIRECT INSURER STEP */}
          {activeStep === 'direct' && (
            <DirectInsurerPanel
              insurer={extractedInsurer}
              policyNumber={extractedPolicyNumber}
              policyType={extractedPolicyType}
              portalInfo={portalInfo}
              providers={providers}
              openRedirectModal={openRedirectModal}
            />
          )}

          {/* 3. ASSISTANCE FORM STEP */}
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

          {/* 4. SUCCESS STEP */}
          {activeStep === 'success' && lastSubmittedClaimId && (
            <SuccessPanel claimId={lastSubmittedClaimId} onClose={closeClaimModal} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Checklist Component ─────────────────────────────────────────────────────
function DocumentChecklist({ policyType }: { policyType?: string }) {
  const checklist = getChecklist(policyType);
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
        <ClipboardList size={14} className="text-[#0369A1]" />
        <span>Essential Documents Usually Required for Settlement</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
              {item.available ? <CheckCircle2 size={11} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
            </div>
            <span className={item.available ? 'font-medium text-slate-900' : 'text-slate-600'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Direct Insurer Panel ────────────────────────────────────────────────────
function DirectInsurerPanel({ insurer, policyNumber, policyType, portalInfo, providers, openRedirectModal }: any) {
  const matchedProvider = providers.find((p: any) =>
    insurer && (
      p.providerName.toLowerCase().includes(insurer.toLowerCase()) ||
      insurer.toLowerCase().includes(p.shortName.toLowerCase())
    )
  );

  return (
    <div className="p-6 space-y-6">
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
          <Building2 size={16} className="text-[#0369A1]" />
          <span>Official Carrier Claim Portal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[11px]">Carrier</span>
            <span className="font-semibold text-slate-900">{insurer || 'Official Provider'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Policy Number</span>
            <span className="font-mono font-medium text-slate-900">{policyNumber || 'Not extracted'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Type</span>
            <span className="text-slate-800 capitalize">{policyType || 'General'}</span>
          </div>
        </div>

        {portalInfo ? (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-slate-600 leading-relaxed">
              ClearCalm has verified the official claim portal for {insurer}. Click below to visit the authentic insurer page safely in a new tab.
            </p>
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-[#0369A1] block">{portalInfo.label}</span>
                <span className="text-xs text-slate-500">Official IRDAI-accredited portal link</span>
              </div>
              <a
                href={portalInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !text-xs !py-2 !px-4"
              >
                <span>Go to Official Claim Page</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2 text-amber-950">
            <span className="font-semibold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle size={14} />
              Portal Link Not Auto-Resolved
            </span>
            <p className="text-slate-700 leading-relaxed">
              We couldn't auto-resolve the exact portal for <strong>{insurer || 'this insurer'}</strong>. For your safety, we do not provide unverified links. Please visit your insurer's official website directly.
            </p>
            {matchedProvider && (
              <button
                onClick={() => openRedirectModal(matchedProvider)}
                className="btn-secondary !text-xs !py-1.5 !px-3 mt-1"
              >
                <ExternalLink size={12} />
                <span>Visit {matchedProvider.shortName} Official Registry Page</span>
              </button>
            )}
          </div>
        )}
      </div>

      <DocumentChecklist policyType={policyType} />

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-center gap-2">
        <Lock size={13} className="text-slate-500 shrink-0" />
        <span>ClearCalm guarantees never to submit claims without your explicit review and consent.</span>
      </div>
    </div>
  );
}

// ─── Assistance Form Component ───────────────────────────────────────────────
function AssistanceForm({ form, errors, isSubmitting, submitError, fileInputRef, updateField, handleSubmit, handleFileAdd, removeFile, checklist }: any) {
  return (
    <div className="p-6 space-y-5">
      <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-xs text-[#0369A1] flex items-center gap-2">
        <CheckCircle2 size={14} className="shrink-0 text-[#0369A1]" />
        <span>Information has been pre-filled from your verified policy document. Please review and complete remaining incident details.</span>
      </div>

      {submitError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0 text-rose-600" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Policyholder Details */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={e => updateField('fullName', e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className={clsInput(errors.fullName)}
            />
            {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => updateField('email', e.target.value)}
              placeholder="name@example.com"
              className={clsInput(errors.email)}
            />
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => updateField('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className={clsInput(errors.phone)}
            />
            {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Contact</label>
            <select
              value={form.preferredContactMethod}
              onChange={e => updateField('preferredContactMethod', e.target.value)}
              className={clsInput()}
            >
              <option value="email">Email</option>
              <option value="phone">Phone / WhatsApp</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Policy Identification */}
        <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Insurer Carrier *</label>
            <input
              type="text"
              value={form.insuranceCompany}
              onChange={e => updateField('insuranceCompany', e.target.value)}
              className={clsInput(errors.insuranceCompany)}
            />
            {errors.insuranceCompany && <p className="text-[11px] text-rose-600 mt-1">{errors.insuranceCompany}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Policy Contract Number *</label>
            <input
              type="text"
              value={form.policyNumber}
              onChange={e => updateField('policyNumber', e.target.value)}
              className={`${clsInput(errors.policyNumber)} font-mono`}
            />
            {errors.policyNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.policyNumber}</p>}
          </div>
        </div>

        {/* Claim Nature */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Claim Incident Type *</label>
            <select
              value={form.claimType}
              onChange={e => updateField('claimType', e.target.value)}
              className={clsInput(errors.claimType)}
            >
              <option value="">Select claim category…</option>
              {CLAIM_TYPES.map(ct => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
            {errors.claimType && <p className="text-[11px] text-rose-600 mt-1">{errors.claimType}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Date of Incident *</label>
            <input
              type="date"
              value={form.dateOfIncident}
              onChange={e => updateField('dateOfIncident', e.target.value)}
              className={clsInput(errors.dateOfIncident)}
            />
            {errors.dateOfIncident && <p className="text-[11px] text-rose-600 mt-1">{errors.dateOfIncident}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Incident Summary &amp; Loss Details *</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => updateField('description', e.target.value)}
            placeholder="Briefly describe what happened, hospital or repair shop details, and estimated expenses…"
            className={clsInput(errors.description)}
          />
          {errors.description && <p className="text-[11px] text-rose-600 mt-1">{errors.description}</p>}
        </div>

        {/* Supporting Files Upload */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-700 block">Supporting Receipts / Documents (Optional, up to 5)</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={e => handleFileAdd(e.target.files)}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border border-dashed border-slate-300 hover:border-[#0369A1] hover:bg-slate-50 transition-colors text-center cursor-pointer"
          >
            <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <span className="text-xs font-medium text-slate-700 block">Click to attach hospital bills, repair estimates, or FIR copies</span>
            <span className="text-[11px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
          </div>

          {form.supportingFiles.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {form.supportingFiles.map((f: File, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="truncate max-w-xs text-slate-700 font-medium">{f.name}</span>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    aria-label={`Remove ${f.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-primary !px-6 !py-2.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Submitting Claim Request…</span>
            </>
          ) : (
            <>
              <span>Submit Claim Assistance Request</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Success Panel Component ─────────────────────────────────────────────────
function SuccessPanel({ claimId, onClose }: { claimId: string; onClose: () => void }) {
  return (
    <div className="p-8 text-center space-y-5">
      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
        <CheckCircle2 size={28} />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Request Logged Successfully
        </span>
        <h3 className="text-xl font-bold text-[#0F172A] mt-2">
          Your Claim Assistance Request is Active
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Reference Number: <strong className="font-mono text-slate-900">{claimId}</strong>
        </p>
      </div>

      {/* What Happens Next Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2 max-w-md mx-auto">
        <span className="font-semibold text-slate-900 block">What Happens Next:</span>
        <ol className="list-decimal pl-4 space-y-1 text-slate-600">
          <li>Our claims auditor validates your policy limits and deduction clauses.</li>
          <li>We prepare your official claim dossier checklist within 24 hours.</li>
          <li>You can track active milestones under the "Claims" tab anytime.</li>
        </ol>
      </div>

      <div className="pt-2">
        <button
          onClick={onClose}
          className="btn-primary !px-8 !py-2.5"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ClaimAssistanceModal;
