import React, { useEffect, useState } from 'react';
import { 
  FileText, Upload, ShieldCheck, AlertTriangle, Search, 
  CheckCircle2, Building2, Shield, Bookmark, Bell, Eye, Lock, FileCheck, ArrowRight, Clock, Plus, HelpCircle, Phone
} from 'lucide-react';
import { Header, AppViewTab } from '../components/common/Header';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { useVerifyStore } from '../store/useVerifyStore';
import { useDocStore, DocumentItem } from '../store/useDocStore';
import { usePolicyStore } from '../store/usePolicyStore';
import { useClaimStore } from '../store/useClaimStore';
import { useProviderStore } from '../store/useProviderStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { ProviderCard } from '../components/discovery/ProviderCard';
import { ExternalRedirectModal } from '../components/discovery/ExternalRedirectModal';
import { VerificationReportModal } from '../components/common/VerificationReportModal';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { PolicySummaryCard } from '../components/ui/PolicySummaryCard';
import { ClaimTimeline } from '../components/ui/ClaimTimeline';
import { DocumentRow } from '../components/ui/DocumentRow';
import { EmptyState } from '../components/ui/EmptyState';
import { SupportCard } from '../components/ui/SupportCard';

interface DashboardProps {
  onSelectTab?: (tab: AppViewTab) => void;
  onSelectDocument?: (doc: DocumentItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTab }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { 
    verifications, 
    fetchVerifications, 
    selectVerification, 
    openReportModal,
    isReportModalOpen,
    closeReportModal,
    selectedReportDoc
  } = useVerifyStore();
  const { fetchDocuments, documents } = useDocStore();
  const { policies, fetchPolicies } = usePolicyStore();
  const { claims, fetchClaims, openClaimModal } = useClaimStore();
  const { savedProviders, fetchSavedProviders } = useProviderStore();
  const { notifications, fetchNotifications } = useNotificationStore();

  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'policies' | 'claims' | 'documents' | 'providers'>('overview');

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchVerifications(),
      fetchDocuments(),
      fetchPolicies(),
      fetchClaims(),
      fetchSavedProviders(),
      fetchNotifications()
    ]).finally(() => {
      if (active) setInitialLoading(false);
    });
    return () => { active = false; };
  }, [fetchVerifications, fetchDocuments, fetchPolicies, fetchClaims, fetchSavedProviders, fetchNotifications]);

  const verifiedDocsCount = verifications.filter(v => v.status === 'Verified / Likely Original' || v.status === 'CONSISTENT').length;
  const flaggedDocsCount = verifications.filter(v => v.status !== 'Verified / Likely Original' && v.status !== 'CONSISTENT').length;

  const totalCoverage = policies.reduce((acc, p) => acc + (p.coverageAmount || 0), 0);
  const activePoliciesCount = policies.filter(p => p.status === 'ACTIVE').length;
  const openClaimsCount = claims.filter(c => c.status !== 'COMPLETED').length;

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const getSystemStatus = () => {
    if (flaggedDocsCount > 0) {
      return {
        variant: 'attention' as const,
        badge: 'Action Recommended',
        title: `${flaggedDocsCount} contract ${flaggedDocsCount === 1 ? 'discrepancy' : 'discrepancies'} flagged`,
        detail: 'One or more of your analyzed documents have date, mathematical, or registry terms that require your review.',
        actionText: 'Review Flagged Documents',
        actionTab: 'history' as AppViewTab
      };
    }

    if (policies.length > 0 || verifiedDocsCount > 0) {
      return {
        variant: 'verified' as const,
        badge: 'All Systems Normal',
        title: 'Your coverage is up to date and verified',
        detail: 'All in-force policies and uploaded verification records match official insurer registry standards.',
        actionText: 'Verify Another Document',
        actionTab: 'verify' as AppViewTab
      };
    }

    return {
      variant: 'neutral' as const,
      badge: 'Getting Started',
      title: 'Welcome to ClearCalm',
      detail: 'Upload your first insurance policy or claims invoice to instantly check covenants, dates, and mathematical accuracy.',
      actionText: 'Verify Your First Policy',
      actionTab: 'verify' as AppViewTab
    };
  };

  const currentStatus = getSystemStatus();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans transition-colors selection:bg-[#0369A1] selection:text-white">
      <Header activeTab="dashboard" onSelectTab={onSelectTab} />

      {initialLoading ? (
        <div role="status" aria-label="Loading your insurance workspace" className="p-8">
          <DashboardSkeleton />
        </div>
      ) : (
        <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">

          {/* ═══════════════════════════════════════════════════════════════
              1. SERENE STATUS BANNER (Answers: Status, What Matters, Action)
          ═══════════════════════════════════════════════════════════════ */}
          <section 
            aria-labelledby="overview-status-title"
            className={`p-6 sm:p-8 rounded-2xl border transition-all shadow-sm ${
              currentStatus.variant === 'attention'
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : currentStatus.variant === 'verified'
                ? 'bg-white border-slate-200/90 text-[#0F172A]'
                : 'bg-white border-slate-200/90 text-[#0F172A]'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <StatusIndicator status={currentStatus.badge} variant={currentStatus.variant} size="sm" />
                  <span className="text-xs text-slate-500 font-medium">
                    Account: <strong className="text-slate-700 font-semibold">{user?.name || 'Primary Policyholder'}</strong>
                  </span>
                </div>

                <h1 id="overview-status-title" className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F172A]">
                  {currentStatus.title}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                  {currentStatus.detail}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
                <button
                  onClick={() => onSelectTab?.(currentStatus.actionTab)}
                  className="btn-primary"
                >
                  <Upload className="w-4 h-4" />
                  <span>{currentStatus.actionText}</span>
                </button>

                <button
                  onClick={() => onSelectTab?.('discovery')}
                  className="btn-secondary"
                >
                  <Shield className="w-4 h-4 text-[#0369A1]" />
                  <span>Explore Insurance</span>
                </button>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              2. REAL DATA SNAPSHOT (No fake KPIs — Real, grounded numbers)
          ═══════════════════════════════════════════════════════════════ */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Insurance Overview Metrics">
            <div className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total In-Force Coverage
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                {totalCoverage > 0 ? formatCurrency(totalCoverage) : '—'}
              </div>
              <p className="text-xs text-slate-500">
                {activePoliciesCount > 0 ? `Across ${activePoliciesCount} connected policy contracts` : 'No connected policies yet'}
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Policies
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                {policies.length}
              </div>
              <p className="text-xs text-slate-500">
                {policies.length > 0 ? 'Protected under official carriers' : 'Ready to connect or upload'}
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Audit Status
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                  {verifiedDocsCount}
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {flaggedDocsCount > 0 ? `${flaggedDocsCount} flagged for discrepancies` : 'Zero unresolved red flags'}
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Open Claims / Assistance
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                {openClaimsCount}
              </div>
              <p className="text-xs text-slate-500">
                {openClaimsCount > 0 ? 'Ongoing review & guidance' : 'No active incident filings'}
              </p>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              3. CONTENT NAVIGATION FILTER TABS (Responsive & Clean)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
            <nav className="flex items-center gap-1.5 flex-wrap" aria-label="Overview categories">
              <button
                onClick={() => setActiveSubTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === 'overview'
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                Comprehensive Overview
              </button>

              <button
                onClick={() => setActiveSubTab('policies')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === 'policies'
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                Connected Policies ({policies.length})
              </button>

              <button
                onClick={() => setActiveSubTab('claims')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === 'claims'
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                Claims &amp; Incidents ({claims.length})
              </button>

              <button
                onClick={() => setActiveSubTab('documents')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === 'documents'
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                Documents &amp; Audits ({documents.length})
              </button>

              <button
                onClick={() => setActiveSubTab('providers')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === 'providers'
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                Saved Providers ({savedProviders.length})
              </button>
            </nav>

            <button
              onClick={() => onSelectTab?.('verify')}
              className="text-xs font-semibold text-[#0369A1] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Verify New Contract</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              4. ACTIVE SUBTAB CONTENT AREAS
          ═══════════════════════════════════════════════════════════════ */}

          {/* (A) COMPREHENSIVE OVERVIEW VIEW */}
          {(activeSubTab === 'overview' || activeSubTab === 'policies') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0F172A]">
                    Active Policy Protection
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your connected insurance coverage records, sum insured, and validity.
                  </p>
                </div>

                <button
                  onClick={() => onSelectTab?.('policies')}
                  className="text-xs font-semibold text-[#0369A1] hover:underline cursor-pointer"
                >
                  View All Policies ({policies.length})
                </button>
              </div>

              {policies.length === 0 ? (
                <EmptyState
                  icon={Shield}
                  title="No Policies Connected Yet"
                  description="Upload your policy copy to ClearCalm or explore verified insurance plans from official carriers."
                  actionLabel="Verify Policy Document"
                  onAction={() => onSelectTab?.('verify')}
                  secondaryActionLabel="Explore Insurance"
                  onSecondaryAction={() => onSelectTab?.('discovery')}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {policies.slice(0, 4).map(policy => (
                    <PolicySummaryCard
                      key={policy.id}
                      policy={policy}
                      onFileClaim={() => openClaimModal()}
                      onViewDetails={() => onSelectTab?.('policies')}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* (B) CLAIMS SECTION */}
          {(activeSubTab === 'overview' || activeSubTab === 'claims') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0F172A]">
                    Claims &amp; Assistance Tracking
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time status updates and step-by-step guidance for your filings.
                  </p>
                </div>

                <button
                  onClick={() => openClaimModal()}
                  className="btn-secondary !text-xs !py-1.5 !px-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Claim Request</span>
                </button>
              </div>

              {claims.length === 0 ? (
                <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-semibold text-[#0F172A]">No Open Claims</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    All your policies are in good standing. If an incident occurs, file assistance anytime.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map(claim => (
                    <ClaimTimeline 
                      key={claim.claimId} 
                      claim={claim}
                      onUploadAdditionalDoc={() => onSelectTab?.('verify')}
                      onContactSupport={() => onSelectTab?.('discovery')}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* (C) DOCUMENTS & AUDITS */}
          {(activeSubTab === 'overview' || activeSubTab === 'documents') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0F172A]">
                    Recent Documents &amp; Verification Audits
                  </h2>
                  <p className="text-xs text-slate-500">
                    Uploaded policies, invoices, and certificates evaluated by ClearCalm.
                  </p>
                </div>

                <button
                  onClick={() => onSelectTab?.('history')}
                  className="text-xs font-semibold text-[#0369A1] hover:underline cursor-pointer"
                >
                  Audit History Archive ({verifications.length})
                </button>
              </div>

              {verifications.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Documents Uploaded Yet"
                  description="Upload any insurance policy PDF, JPEG, or PNG to check validity, sums insured, and red flags."
                  actionLabel="Verify a Document Now"
                  onAction={() => onSelectTab?.('verify')}
                />
              ) : (
                <div className="space-y-3">
                  {verifications.slice(0, 5).map(v => (
                    <DocumentRow
                      key={v.verificationId}
                      id={v.verificationId}
                      name={v.filename}
                      fileType={v.fileType || 'PDF'}
                      fileSize={v.fileSize}
                      uploadedAt={v.verifiedAt || new Date().toISOString()}
                      status={v.status}
                      policyOrClaimRef={v.extractedFields?.policy_number?.value || undefined}
                      onVerify={() => {
                        selectVerification(v);
                        openReportModal(v);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* (D) SAVED OFFICIAL PROVIDERS */}
          {(activeSubTab === 'overview' || activeSubTab === 'providers') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0F172A]">
                    Saved Official Providers
                  </h2>
                  <p className="text-xs text-slate-500">
                    Bookmarked legitimate insurance carriers with verified direct portals.
                  </p>
                </div>

                <button
                  onClick={() => onSelectTab?.('discovery')}
                  className="text-xs font-semibold text-[#0369A1] hover:underline cursor-pointer"
                >
                  Explore All Providers
                </button>
              </div>

              {savedProviders.length === 0 ? (
                <EmptyState
                  icon={Bookmark}
                  title="No Providers Bookmarked"
                  description="Browse authorized insurance providers and bookmark official portals for quick claim intimation."
                  actionLabel="Discover Official Providers"
                  onAction={() => onSelectTab?.('discovery')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedProviders.map(provider => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              5. ALWAYS DISCOVERABLE SUPPORT
          ═══════════════════════════════════════════════════════════════ */}
          <SupportCard onOpenChat={() => onSelectTab?.('discovery')} />
        </main>
      )}

      {isReportModalOpen && selectedReportDoc && (
        <VerificationReportModal
          isOpen={isReportModalOpen}
          onClose={closeReportModal}
          doc={selectedReportDoc}
        />
      )}
      <ExternalRedirectModal />
    </div>
  );
};

export default Dashboard;
