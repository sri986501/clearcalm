import React, { useEffect } from 'react';
import { 
  Shield, CheckCircle2, AlertTriangle, Download, ArrowRight, 
  Clock, Calendar, FileText, Bookmark, ExternalLink, RefreshCw, Sparkles, Lock, Upload
} from 'lucide-react';
import { Header, AppViewTab } from '../components/common/Header';
import { usePolicyStore } from '../store/usePolicyStore';
import { useProviderStore } from '../store/useProviderStore';
import { ProviderCard } from '../components/discovery/ProviderCard';
import { ExternalRedirectModal } from '../components/discovery/ExternalRedirectModal';
import { useTranslation } from 'react-i18next';

interface MyPoliciesPageProps {
  onSelectTab?: (tab: AppViewTab) => void;
}

export const MyPoliciesPage: React.FC<MyPoliciesPageProps> = ({ onSelectTab }) => {
  const { t } = useTranslation();
  const { policies, fetchPolicies, isLoading } = usePolicyStore();
  const { savedProviders, fetchSavedProviders } = useProviderStore();

  useEffect(() => {
    fetchPolicies();
    fetchSavedProviders();
  }, [fetchPolicies, fetchSavedProviders]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black flex flex-col font-sans transition-colors relative selection:bg-black selection:text-white">
      {/* Subtle professional background image watermark */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.06] bg-cover bg-center"
        style={{ backgroundImage: `url('/images/portal_bg.jpg')` }}
      />

      <Header activeTab="policies" onSelectTab={onSelectTab} />

      <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 z-10">
        {/* Header Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-3xl bg-white border border-black/10 shadow-sm">
          <div className="space-y-1.5">
            <span className="inline-block text-xs font-medium uppercase tracking-wider text-black/60 bg-black/5 px-3 py-1 rounded-full border border-black/5">
              {t('policies.vaultBadge', 'POLICY & PROVIDER PORTAL')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-black">
              {t('policies.title', 'Connected Policies & Saved Providers')}
            </h1>
            <p className="text-xs sm:text-sm text-black/60 max-w-xl leading-relaxed">
              {t('policies.subtitle', 'Access your verified document copies, saved official insurer links, and connection status.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab?.('verify')}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-xs font-medium tracking-tight flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>{t('dashboard.verifyNewDoc', 'Verify Document')}</span>
            </button>
            <button
              onClick={() => onSelectTab?.('discovery')}
              className="px-6 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Shield className="w-4 h-4" />
              <span>{t('discovery.heroTitle', 'Explore Insurance')}</span>
            </button>
          </div>
        </div>

        {/* Connected Policies State */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-black uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-black/60" />
              <span>{t('dashboard.tabConnectedPolicies', 'Connected Policies')}</span>
            </h2>
          </div>

          {policies.length === 0 ? (
            <div className="p-10 sm:p-12 text-center bg-white border border-black/10 rounded-3xl space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mx-auto text-black">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-medium text-black">
                  {t('dashboard.noPoliciesConnectedTitle', 'No Policies Connected')}
                </h3>
                <p className="text-xs text-black/60 leading-relaxed">
                  {t(
                    'dashboard.noPoliciesConnectedDesc',
                    'We do not currently have access to your insurer account or policy records. To analyze coverage or check authentic policy terms, upload your document copy.'
                  )}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onSelectTab?.('verify')}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-xs font-medium cursor-pointer shadow-sm"
                >
                  {t('dashboard.verifyADocument', 'Verify a Document')}
                </button>
                <button
                  onClick={() => onSelectTab?.('discovery')}
                  className="px-6 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-xs font-medium cursor-pointer shadow-sm"
                >
                  {t('dashboard.exploreInsurance', 'Explore Insurance')}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map(p => (
                <div key={p.id} className="p-6 bg-white border border-black/10 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-black text-base">{p.planName}</h4>
                      <p className="text-xs text-black/60 mt-0.5">{p.providerName}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-black/70 bg-black/[0.02] border border-black/5 p-3 rounded-xl">
                    <div>
                      <span className="text-black/40 text-[10px] block">Policy Number</span>
                      <span className="font-medium text-black">{p.policyNumber}</span>
                    </div>
                    <div>
                      <span className="text-black/40 text-[10px] block">Valid Until</span>
                      <span className="font-medium text-black">{new Date(p.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Providers Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-black uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-black/60" />
              <span>{t('dashboard.tabSavedProviders', 'Saved Official Providers')}</span> ({savedProviders.length})
            </h2>
          </div>

          {savedProviders.length === 0 ? (
            <div className="p-10 text-center bg-white border border-black/10 rounded-3xl text-xs text-black/60 space-y-3 shadow-sm">
              <Bookmark className="w-8 h-8 text-black/40 mx-auto" />
              <p>{t('dashboard.noSavedProvidersDesc', 'You have not saved any official insurance providers yet.')}</p>
              <button
                onClick={() => onSelectTab?.('discovery')}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-xs font-medium mx-auto inline-block cursor-pointer shadow-sm"
              >
                {t('dashboard.exploreInsurance', 'Discover Legitimate Providers')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedProviders.map(provider => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </section>
      </main>

      <ExternalRedirectModal />
    </div>
  );
};

export default MyPoliciesPage;
