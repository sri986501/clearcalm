import React from 'react';
import { CheckCircle2, Clock, HelpCircle, AlertCircle, ArrowRight, ShieldCheck, FileText, Phone } from 'lucide-react';
import { ClaimStatus, CLAIM_STATUS_STEPS, ClaimRecord } from '../../store/useClaimStore';
import { StatusIndicator } from './StatusIndicator';

interface ClaimTimelineProps {
  claim: ClaimRecord;
  onUploadAdditionalDoc?: () => void;
  onContactSupport?: () => void;
}

export const ClaimTimeline: React.FC<ClaimTimelineProps> = ({
  claim,
  onUploadAdditionalDoc,
  onContactSupport
}) => {
  const steps = CLAIM_STATUS_STEPS;
  const currentStepIndex = steps.findIndex(s => s.key === claim.status);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  // Guidance for "What happens next" & "Do I need to do anything"
  const getActionGuidance = (status: ClaimStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          happeningNow: 'Your submission has been queued and is undergoing intake validation.',
          happensNext: 'An insurance specialist will review your incident summary and documentation within 24 hours.',
          actionNeeded: false,
          actionText: 'No action required right now. We will notify you when review commences.'
        };
      case 'UNDER_REVIEW':
        return {
          happeningNow: 'Your documentation is being actively audited against insurer covenants.',
          happensNext: 'We will verify eligibility and prepare direct claim intimation files.',
          actionNeeded: false,
          actionText: 'Everything looks good. You do not need to submit anything further unless requested.'
        };
      case 'ADDITIONAL_INFO_REQUIRED':
        return {
          happeningNow: 'We need one or more additional bills or verification proofs to proceed.',
          happensNext: 'Once provided, our claims advocate will immediately resume processing.',
          actionNeeded: true,
          actionText: 'Please upload the requested supporting receipts or identity verification below.'
        };
      case 'GUIDANCE_PROVIDED':
        return {
          happeningNow: 'Official claims packet and guidance report have been prepared for your insurer.',
          happensNext: 'Follow the step-by-step checklist to submit directly to your insurer portal.',
          actionNeeded: true,
          actionText: 'Review your personalized guidance packet and proceed with direct filing.'
        };
      case 'COMPLETED':
        return {
          happeningNow: 'All assistance steps have concluded successfully.',
          happensNext: 'Retain your claim reference number for settlement tracking with the carrier.',
          actionNeeded: false,
          actionText: 'Claim assistance is complete. Feel free to contact support if settlement issues arise.'
        };
    }
  };

  const guidance = getActionGuidance(claim.status);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
      {/* Top Status & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Claim ID: <span className="font-mono text-slate-800">{claim.claimId}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-600">{claim.insuranceCompany}</span>
          </div>
          <h3 className="text-xl font-semibold text-[#0F172A]">
            {claim.claimType || 'Insurance Claim Filing'}
          </h3>
          <p className="text-xs text-slate-500">
            Filed on {new Date(claim.submittedAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div>
          <StatusIndicator status={claim.status} size="lg" />
        </div>
      </div>

      {/* Visual Step-by-Step Progress Bar (Calm & Non-Anxious) */}
      <div className="py-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Claim Resolution Progress
        </h4>

        <div className="relative">
          {/* Connector Line */}
          <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200" aria-hidden="true" />
          
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={step.key} className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold transition-colors z-10 ${
                      isPast 
                        ? 'bg-emerald-600 text-white' 
                        : isCurrent 
                        ? 'bg-[#0369A1] text-white ring-4 ring-sky-100' 
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div>
                    <span className={`block text-xs font-medium ${isCurrent ? 'text-[#0369A1] font-semibold' : isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                    <span className="hidden sm:block text-[11px] text-slate-500 mt-0.5 max-w-[130px] mx-auto leading-tight">
                      {isCurrent ? 'Current Phase' : isPast ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Immediate Clarity Boxes: What's Happening Now vs What Happens Next */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0369A1] block">
            What We Are Doing Now
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {guidance.happeningNow}
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
            What Happens Next
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {guidance.happensNext}
          </p>
        </div>
      </div>

      {/* Action Directive Box: Clear Call to Action */}
      <div className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        guidance.actionNeeded 
          ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
          : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex items-start gap-3">
          {guidance.actionNeeded ? (
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block mb-0.5">
              {guidance.actionNeeded ? 'Action Required From You' : 'Status: You are all set'}
            </span>
            <p className="text-xs sm:text-sm leading-relaxed">
              {guidance.actionText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {guidance.actionNeeded && onUploadAdditionalDoc && (
            <button
              onClick={onUploadAdditionalDoc}
              className="btn-primary !text-xs !py-2 !px-4"
            >
              Upload Documents
            </button>
          )}
          {onContactSupport && (
            <button
              onClick={onContactSupport}
              className="btn-secondary !text-xs !py-2 !px-3"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
