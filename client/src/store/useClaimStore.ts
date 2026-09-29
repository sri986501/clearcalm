import { create } from 'zustand';
import api from '../lib/axios';

export type ClaimStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'GUIDANCE_PROVIDED'
  | 'COMPLETED';

export interface ClaimStatusStep {
  key: ClaimStatus;
  label: string;
  description: string;
}

export const CLAIM_STATUS_STEPS: ClaimStatusStep[] = [
  { key: 'SUBMITTED', label: 'Request Submitted', description: 'Your claim assistance request has been received.' },
  { key: 'UNDER_REVIEW', label: 'Under Review', description: 'Our team is reviewing your submitted information.' },
  { key: 'ADDITIONAL_INFO_REQUIRED', label: 'Additional Information Required', description: 'We may need more documents or clarifications.' },
  { key: 'GUIDANCE_PROVIDED', label: 'Guidance Provided', description: 'Our team has prepared guidance for your claim process.' },
  { key: 'COMPLETED', label: 'Completed', description: 'Your claim assistance request is complete.' },
];

export interface ClaimRecord {
  claimId: string;
  userId?: string;
  verificationId?: string;
  insuranceCompany: string;
  policyNumber: string;
  policyType: string;
  fullName: string;
  email?: string;
  phone?: string;
  claimType: string;
  dateOfIncident: string;
  description: string;
  preferredContactMethod: 'email' | 'phone' | 'both';
  supportingDocuments?: string[];
  status: ClaimStatus;
  statusHistory?: { status: string; note: string; updatedAt: string }[];
  submittedAt: string;
}

export interface ClaimFormData {
  fullName: string;
  email: string;
  phone: string;
  insuranceCompany: string;
  policyNumber: string;
  policyType: string;
  claimType: string;
  dateOfIncident: string;
  description: string;
  preferredContactMethod: 'email' | 'phone' | 'both';
  supportingFiles: File[];
}

// Verified official claim/contact portal URLs for major Indian insurers
// IMPORTANT: Only real, publicly verifiable official URLs are listed here.
// If an insurer's URL is not known with certainty, we do NOT include it.
export const VERIFIED_CLAIM_PORTALS: Record<string, { url: string; label: string }> = {
  'lic': { url: 'https://licindia.in/Customer-Services/Claim-Status', label: 'LIC Claim Status Portal' },
  'life insurance corporation': { url: 'https://licindia.in/Customer-Services/Claim-Status', label: 'LIC Claim Status Portal' },
  'hdfc ergo': { url: 'https://www.hdfcergo.com/claims', label: 'HDFC ERGO Claims Portal' },
  'star health': { url: 'https://www.starhealth.in/claims', label: 'Star Health Claims Portal' },
  'icici lombard': { url: 'https://www.icicilombard.com/claims', label: 'ICICI Lombard Claims Portal' },
  'bajaj allianz': { url: 'https://www.bajajallianz.com/Corp/customer-care/claim-form.jsp', label: 'Bajaj Allianz Claim Form' },
  'new india assurance': { url: 'https://www.newindia.co.in/portal/motor/claim-intimation', label: 'New India Assurance Claims' },
  'new india': { url: 'https://www.newindia.co.in/portal/motor/claim-intimation', label: 'New India Assurance Claims' },
  'care health': { url: 'https://www.careinsurance.com/claim.html', label: 'Care Health Claims' },
  'care insurance': { url: 'https://www.careinsurance.com/claim.html', label: 'Care Health Claims' },
  'sbi general': { url: 'https://www.sbigeneral.in/portal/claims', label: 'SBI General Claims Portal' },
  'national insurance': { url: 'https://nationalinsurance.nic.co.in/en/claim', label: 'National Insurance Claims' },
  'oriental insurance': { url: 'https://orientalinsurance.org.in/web/guest/claims', label: 'Oriental Insurance Claims' },
  'united india': { url: 'https://uiic.co.in/claim-registration/', label: 'United India Claims' },
  'max bupa': { url: 'https://www.niva.co.in/claims', label: 'Niva Bupa (Max Bupa) Claims' },
  'niva bupa': { url: 'https://www.niva.co.in/claims', label: 'Niva Bupa Claims' },
};

export function lookupVerifiedClaimPortal(insurerName: string): { url: string; label: string } | null {
  if (!insurerName) return null;
  const lower = insurerName.toLowerCase().trim();
  for (const [key, val] of Object.entries(VERIFIED_CLAIM_PORTALS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return val;
    }
  }
  return null;
}

interface ClaimStoreState {
  claims: ClaimRecord[];
  isSubmitting: boolean;
  submitError: string | null;
  lastSubmittedClaimId: string | null;
  isModalOpen: boolean;
  activeStep: 'choose' | 'direct' | 'assistance' | 'success';

  openClaimModal: () => void;
  closeClaimModal: () => void;
  setActiveStep: (step: 'choose' | 'direct' | 'assistance' | 'success') => void;

  submitClaimAssistance: (formData: ClaimFormData, verificationId?: string) => Promise<string>;
  fetchClaims: () => Promise<void>;

  clearSubmitError: () => void;
  clearLastClaimId: () => void;
}

export const useClaimStore = create<ClaimStoreState>((set, _get) => ({
  claims: [],
  isSubmitting: false,
  submitError: null,
  lastSubmittedClaimId: null,
  isModalOpen: false,
  activeStep: 'choose',

  openClaimModal: () => set({ isModalOpen: true, activeStep: 'choose', submitError: null }),
  closeClaimModal: () => set({ isModalOpen: false, activeStep: 'choose', submitError: null }),
  setActiveStep: (step) => set({ activeStep: step }),

  submitClaimAssistance: async (formData: ClaimFormData, verificationId?: string) => {
    set({ isSubmitting: true, submitError: null });

    try {
      const fd = new FormData();
      fd.append('insuranceCompany', formData.insuranceCompany);
      fd.append('policyNumber', formData.policyNumber);
      fd.append('policyType', formData.policyType);
      fd.append('fullName', formData.fullName);
      if (formData.email) fd.append('email', formData.email);
      if (formData.phone) fd.append('phone', formData.phone);
      fd.append('claimType', formData.claimType);
      fd.append('dateOfIncident', formData.dateOfIncident);
      fd.append('description', formData.description);
      fd.append('preferredContactMethod', formData.preferredContactMethod);
      if (verificationId) fd.append('verificationId', verificationId);

      formData.supportingFiles.forEach(f => fd.append('supportingDocuments', f));

      const res = await api.post('/claims', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { claimId, claim } = res.data;

      set(state => ({
        claims: [claim, ...state.claims],
        lastSubmittedClaimId: claimId,
        isSubmitting: false,
        activeStep: 'success'
      }));

      return claimId;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Submission failed. Please try again.';
      set({ isSubmitting: false, submitError: errMsg });
      throw new Error(errMsg);
    }
  },

  fetchClaims: async () => {
    try {
      const res = await api.get('/claims');
      set({ claims: res.data.claims || [] });
    } catch (e) {
      console.warn('Failed to fetch claims:', e);
    }
  },

  clearSubmitError: () => set({ submitError: null }),
  clearLastClaimId: () => set({ lastSubmittedClaimId: null }),
}));
