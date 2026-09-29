import React, { useEffect, useState } from 'react';
import { 
  Shield, CheckCircle2, AlertTriangle, Download, ArrowRight, 
  Clock, Calendar, FileText, Bookmark, ExternalLink, RefreshCw, Lock, Upload, CreditCard, Plus
} from 'lucide-react';
import { Header, AppViewTab } from '../components/common/Header';
import { usePolicyStore, PolicyItem } from '../store/usePolicyStore';
import { useProviderStore } from '../store/useProviderStore';
import { useClaimStore } from '../store/useClaimStore';
import { ProviderCard } from '../components/discovery/ProviderCard';
import { ExternalRedirectModal } from '../components/discovery/ExternalRedirectModal';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PolicySummaryCard } from '../components/ui/PolicySummaryCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SupportCard } from '../components/ui/SupportCard';
import { StatusIndicator } from '../components/ui/StatusIndicator';

interface MyPoliciesPageProps {
  onSelectTab?: (tab: AppViewTab) => void;
}

export const MyPoliciesPage: React.FC<MyPoliciesPageProps> = ({ onSelectTab }) => {
  const { t } = useTranslation();
  const { policies, fetchPolicies, transactions, fetchTransactions, isLoading } = usePolicyStore();
  const { savedProviders, fetchSavedProviders } = useProviderStore();
  const { openClaimModal } = useClaimStore();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeViewMode, setActiveViewMode] = useState<'policies' | 'payments' | 'saved'>('policies');

  useEffect(() => {
    fetchPolicies();
    fetchTransactions();
    fetchSavedProviders();
  }, [fetchPolicies, fetchTransactions, fetchSavedProviders]);

  const filteredPolicies = policies.filter(p => {
    if (activeCategoryFilter === 'all') return true;
    return (p.category || '').toLowerCase() === activeCategoryFilter.toLowerCase();
  });

  const totalCoverage = policies.reduce((acc, p) => acc + (p.coverageAmount || 0), 0);
  const activeCount = policies.filter(p => p.status === 'ACTIVE').length;

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans transition-colors selection:bg-[#0369A1] selection:text-white">
      <Header activeTab="policies" onSelectTab={onSelectTab} />

      <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Page Context & Header */}
        <div className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-6">
          <SectionHeader
            contextBadge="POLICY & COVERAGE PORTAL"
            title="Connected Policies & Coverage"
            subtitle="Understand your active insurance contracts, coverage limits, renewal dates, and payment history in plain language."
            action={
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onSelectTab?.('verify')}
                  className="btn-primary"
                >
                  <Upload className="w-4 h-4" />
                  <span>Verify New Policy</span>
                </button>
                <button
                  onClick={() => onSelectTab?.('discovery')}
                  className="btn-secondary"
                >
                  <Shield className="w-4 h-4 text-[#0369A1]" />
                  <span>Explore Insurance</span>
                </button>
              </div>
            }
          />

          {/* Quick Summary Pill Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">In-Force Coverage</span>
              <div className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                {totalCoverage > 0 ? formatCurrency(totalCoverage) : '—'}
              </div>
              <p className="text-xs text-slate-500">Comprehensive protection ceiling</p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Contracts</span>
              <div className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                {activeCount}
              </div>
              <p className="text-xs text-slate-500">Official registered policies on record</p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Transactions</span>
              <div className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                {transactions.length}
              </div>
              <p className="text-xs text-slate-500">Verified payment receipts on file</p>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveViewMode('policies')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeViewMode === 'policies'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              My Policies ({policies.length})
            </button>

            <button
              onClick={() => setActiveViewMode('payments')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeViewMode === 'payments'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              Payment History ({transactions.length})
            </button>

            <button
              onClick={() => setActiveViewMode('saved')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeViewMode === 'saved'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              Saved Providers ({savedProviders.length})
            </button>
          </div>

          {activeViewMode === 'policies' && policies.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto">
              {['all', 'health', 'vehicle', 'life', 'travel', 'property'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors cursor-pointer ${
                    activeCategoryFilter === cat
                      ? 'bg-sky-100 text-[#0369A1] font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 1. POLICIES VIEW */}
        {activeViewMode === 'policies' && (
          <section className="space-y-4">
            {filteredPolicies.length === 0 ? (
              <EmptyState
                icon={Lock}
                title="No Connected Policies Found"
                description={
                  policies.length === 0
                    ? 'ClearCalm does not have direct access to your insurer account yet. Upload your policy PDF or scan to automatically verify covenants and add it here.'
                    : 'No policies found under the selected category filter.'
                }
                actionLabel="Verify Policy Document"
                onAction={() => onSelectTab?.('verify')}
                secondaryActionLabel={policies.length === 0 ? 'Explore Insurance' : 'Show All Policies'}
                onSecondaryAction={() => {
                  if (policies.length === 0) onSelectTab?.('discovery');
                  else setActiveCategoryFilter('all');
                }}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPolicies.map(policy => (
                  <PolicySummaryCard
                    key={policy.id}
                    policy={policy}
                    onFileClaim={() => openClaimModal()}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. PAYMENT TRANSACTIONS VIEW */}
        {activeViewMode === 'payments' && (
          <section className="space-y-4">
            {transactions.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No Payment Records Found"
                description="Payment transactions, premium receipts, and renewal records will be archived here once processed."
                actionLabel="Explore Plans"
                onAction={() => onSelectTab?.('discovery')}
              />
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
                <div className="p-4 bg-slate-50 font-semibold text-xs text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2">
                  <div className="col-span-5 sm:col-span-4">Plan &amp; Gateway</div>
                  <div className="col-span-4 sm:col-span-3">Order / Payment ID</div>
                  <div className="col-span-3 sm:col-span-2 text-right">Amount</div>
                  <div className="hidden sm:block sm:col-span-3 text-right">Date &amp; Status</div>
                </div>

                {transactions.map(txn => (
                  <div key={txn.id} className="p-4 grid grid-cols-12 gap-2 items-center text-xs text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-5 sm:col-span-4 space-y-0.5">
                      <span className="font-semibold text-slate-900 block truncate">{txn.planName || 'Insurance Policy'}</span>
                      <span className="text-[11px] text-slate-400 capitalize">{txn.gateway || 'Razorpay / Gateway'} • {txn.paymentMethod || 'Online'}</span>
                    </div>

                    <div className="col-span-4 sm:col-span-3 font-mono text-slate-500 truncate" title={txn.paymentId || txn.orderId}>
                      {txn.paymentId || txn.orderId}
                    </div>

                    <div className="col-span-3 sm:col-span-2 text-right font-semibold text-slate-900">
                      {formatCurrency(txn.amount)}
                    </div>

                    <div className="hidden sm:flex sm:col-span-3 items-center justify-end gap-3 text-right">
                      <span className="text-slate-500">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <StatusIndicator status={txn.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. SAVED PROVIDERS VIEW */}
        {activeViewMode === 'saved' && (
          <section className="space-y-4">
            {savedProviders.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No Saved Providers"
                description="Explore legitimate, IRDAI-registered insurance carriers and bookmark them for quick access."
                actionLabel="Explore Providers"
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

        {/* Support Section */}
        <SupportCard onOpenChat={() => onSelectTab?.('discovery')} />
      </main>

      <ExternalRedirectModal />
    </div>
  );
};

export default MyPoliciesPage;
