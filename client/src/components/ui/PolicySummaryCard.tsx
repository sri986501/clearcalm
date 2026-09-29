import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, FileText, Calendar, IndianRupee, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';
import { PolicyItem } from '../../store/usePolicyStore';

interface PolicySummaryCardProps {
  policy: PolicyItem;
  onFileClaim?: (policy: PolicyItem) => void;
  onViewDetails?: (policy: PolicyItem) => void;
}

export const PolicySummaryCard: React.FC<PolicySummaryCardProps> = ({
  policy,
  onFileClaim,
  onViewDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isExpiringSoon = () => {
    if (!policy.expiryDate) return false;
    const expiry = new Date(policy.expiryDate).getTime();
    const now = Date.now();
    const daysLeft = (expiry - now) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft <= 30;
  };

  return (
    <article className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:border-slate-300 transition-all duration-200 overflow-hidden">
      {/* Primary Summary Header */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {policy.category || 'General'} Insurance
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600 font-medium">
                {policy.providerName}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A]">
              {policy.planName}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Policy ID: {policy.policyNumber}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isExpiringSoon() && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                Renews Soon
              </span>
            )}
            <StatusIndicator status={policy.status || 'ACTIVE'} size="md" />
          </div>
        </div>

        {/* Primary Metrics Grid - Clear & High Contrast */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50/70 border border-slate-100 rounded-xl">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-0.5">Sum Insured / Coverage</span>
            <span className="text-base sm:text-lg font-bold text-[#0F172A]">
              {formatCurrency(policy.coverageAmount)}
            </span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500 block mb-0.5">Valid Through</span>
            <span className="text-sm sm:text-base font-semibold text-[#0F172A] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              {policy.expiryDate ? new Date(policy.expiryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Continuous'}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
            <span className="text-xs font-medium text-slate-500 block mb-0.5">Annual Premium</span>
            <span className="text-sm sm:text-base font-semibold text-slate-800">
              {formatCurrency(policy.annualPremium)} / yr
            </span>
          </div>
        </div>

        {/* Primary Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0369A1] transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Details' : 'View Policy Breakdown'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onFileClaim && (
              <button
                onClick={() => onFileClaim(policy)}
                className="btn-secondary !text-xs !py-2 !px-4"
              >
                File Claim
              </button>
            )}
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(policy)}
                className="btn-primary !text-xs !py-2 !px-4"
              >
                <span>Full Contract</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progressive Disclosure Section (Revealed on click) */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-6 space-y-4 animate-fade-in text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-500 font-medium block">Policyholder</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">{policy.policyHolderName || 'Primary Insured'}</span>
              <span className="text-slate-500 text-[11px]">{policy.policyHolderEmail}</span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Nominee &amp; Relation</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {policy.nomineeName ? `${policy.nomineeName} (${policy.nomineeRelation || 'Nominee'})` : 'Standard Nominee on record'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Start Date</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {policy.startDate ? new Date(policy.startDate).toLocaleDateString() : 'Active since purchase'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Transaction Ref</span>
              <span className="font-mono text-slate-600 mt-0.5 block truncate" title={policy.transactionId || policy.paymentId}>
                {policy.transactionId || policy.paymentId || 'TXN-DIRECT'}
              </span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
