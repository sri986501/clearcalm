import React, { useEffect, useState } from 'react';
import { 
  FileText, Upload, ShieldCheck, AlertTriangle, Search, 
  CheckCircle2, Building2, 
  Shield, Bookmark, Bell, Eye, Lock, FileCheck
} from 'lucide-react';
import { Header, AppViewTab } from '../components/common/Header';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { useVerifyStore } from '../store/useVerifyStore';
import { useDocStore, DocumentItem } from '../store/useDocStore';
import { useProviderStore } from '../store/useProviderStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { ProviderCard } from '../components/discovery/ProviderCard';
import { ExternalRedirectModal } from '../components/discovery/ExternalRedirectModal';

interface DashboardProps {
  onSelectTab?: (tab: AppViewTab) => void;
  onSelectDocument?: (doc: DocumentItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTab }) => {
  const { t } = useTranslation();
  const { verifications, fetchVerifications, selectVerification, openReportModal } = useVerifyStore();
  const { fetchDocuments, documents } = useDocStore();
  const { savedProviders, fetchSavedProviders } = useProviderStore();
  const { notifications, fetchNotifications, markAsRead } = useNotificationStore();
  const { user } = useAuthStore();

  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'documents' | 'connectedPolicies' | 'savedProviders' | 'alerts'>('documents');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchVerifications(),
      fetchDocuments(),
      fetchSavedProviders(),
      fetchNotifications()
    ]).finally(() => {
      if (active) setInitialLoading(false);
    });
    return () => { active = false; };
  }, [fetchVerifications, fetchDocuments, fetchSavedProviders, fetchNotifications]);

  const verifiedDocsCount = verifications.filter(v => v.status === 'Verified / Likely Original' || v.status === 'CONSISTENT').length;
  const flaggedDocsCount = verifications.filter(v => v.status !== 'Verified / Likely Original' && v.status !== 'CONSISTENT').length;

  const stats = [
    { 
      label: t('dashboard.kpiUploadedDocs', 'Uploaded Documents'), 
      value: documents.length, 
      detail: t('dashboard.kpiUploadedDocsDetail', 'Processed in security vault'), 
      icon: FileText,
      badge: 'Processed'
    },
    { 
      label: t('dashboard.kpiVerifiedDocs', 'Verified Documents'), 
      value: verifiedDocsCount, 
      detail: t('dashboard.kpiVerifiedDocsDetail', 'Zero major discrepancies'), 
      icon: CheckCircle2,
      badge: 'Verified'
    },
    { 
      label: t('dashboard.kpiFlagged', 'Discrepancies Flagged'), 
      value: flaggedDocsCount, 
      detail: t('dashboard.kpiFlaggedDetail', 'Requires underwriter review'), 
      icon: AlertTriangle,
      badge: 'Attention'
    },
    { 
      label: t('dashboard.kpiSavedProviders', 'Saved Official Providers'), 
      value: savedProviders.length, 
      detail: t('dashboard.kpiSavedProvidersDetail', 'Bookmarked for direct inquiry'), 
      icon: Bookmark,
      badge: 'Registry'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black flex flex-col font-sans transition-colors relative selection:bg-black selection:text-white">
      {/* Subtle professional background image watermark related to insurance intelligence */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.06] bg-cover bg-center"
        style={{ backgroundImage: `url('/images/portal_bg.jpg')` }}
      />

      <Header activeTab="dashboard" onSelectTab={onSelectTab} />
      
      {initialLoading ? (
        <div role="status" aria-label="Loading your workspace">
          <DashboardSkeleton />
        </div>
      ) : (
        <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 z-10">
          
          {/* Welcome Header Banner */}
          <header className="relative overflow-hidden rounded-3xl bg-white border border-black/10 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-block text-xs font-medium uppercase tracking-wider text-black/60 bg-black/5 px-3 py-1 rounded-full border border-black/5">
                {t('dashboard.portalBadge', 'Insurance Verification & Discovery Hub')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-black">
                {t('dashboard.welcomeBack', 'Welcome back,')} {user?.name || 'Policyholder'}
              </h1>
              <p className="text-sm text-black/60 leading-relaxed max-w-lg">
                Stay anchored to accurate policy data, flag contract discrepancies, and connect with IRDAI-registered carriers.
              </p>
              <div className="text-xs text-black/40 pt-1">
                {t('dashboard.lastSecureSession', 'Secure Session')} • {new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => onSelectTab?.('verify')}
                className="bg-black hover:bg-gray-800 text-white px-7 py-3 rounded-full text-sm font-medium tracking-tight transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>{t('dashboard.verifyNewDoc', 'Verify Document')}</span>
              </button>
              <button 
                onClick={() => onSelectTab?.('discovery')}
                className="bg-white hover:bg-black/5 text-black border border-black/15 px-6 py-3 rounded-full text-sm font-medium tracking-tight transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm hover:border-black/30"
              >
                <Shield className="w-4 h-4" />
                <span>{t('dashboard.exploreInsurance', 'Explore Insurance')}</span>
              </button>
            </div>
          </header>

          {/* Quick Action Entry Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => onSelectTab?.('verify')}
              className="p-6 rounded-2xl bg-white border border-black/10 hover:border-black/30 cursor-pointer transition-all duration-200 hover:shadow-md group flex flex-col justify-between min-h-[170px]"
            >
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-black mb-1">
                  {t('dashboard.actionVerifyTitle', 'Verify a Document')}
                </h3>
                <p className="text-xs text-black/60 leading-relaxed">
                  {t('dashboard.actionVerifyDesc', 'Check insurance documents for arithmetic, dates, and underwriter consistency.')}
                </p>
              </div>
            </div>

            <div
              onClick={() => onSelectTab?.('verify')}
              className="p-6 rounded-2xl bg-white border border-black/10 hover:border-black/30 cursor-pointer transition-all duration-200 hover:shadow-md group flex flex-col justify-between min-h-[170px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#2B2644] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-black mb-1">
                  {t('dashboard.actionUnderstandTitle', 'Understand My Policy')}
                </h3>
                <p className="text-xs text-black/60 leading-relaxed">
                  {t('dashboard.actionUnderstandDesc', 'Extract and explain coverage, exclusions, deductibles, and questions to ask.')}
                </p>
              </div>
            </div>

            <div
              onClick={() => onSelectTab?.('discovery')}
              className="p-6 rounded-2xl bg-white border border-black/10 hover:border-black/30 cursor-pointer transition-all duration-200 hover:shadow-md group flex flex-col justify-between min-h-[170px]"
            >
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-black mb-1">
                  {t('dashboard.actionExploreTitle', 'Explore Insurance')}
                </h3>
                <p className="text-xs text-black/60 leading-relaxed">
                  {t('dashboard.actionExploreDesc', 'Learn about Health, Vehicle, Life, Travel, and Property category overviews.')}
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                setActiveSubTab('savedProviders');
              }}
              className="p-6 rounded-2xl bg-white border border-black/10 hover:border-black/30 cursor-pointer transition-all duration-200 hover:shadow-md group flex flex-col justify-between min-h-[170px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#2B2644] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-black mb-1">
                  {t('dashboard.actionSavedTitle', 'Saved Providers')}
                </h3>
                <p className="text-xs text-black/60 leading-relaxed">
                  {t('dashboard.actionSavedDesc', 'View your bookmarked official insurance providers and quick verification links.')}
                </p>
              </div>
            </div>
          </section>

          {/* KPI Metrics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Portal Analytics">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-black/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-black/50">
                      {stat.label}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-medium tracking-tight text-black">
                      {stat.value}
                    </span>
                    <p className="text-xs text-black/50 mt-1">
                      {stat.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-black/10 pb-4 flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveSubTab('documents')}
                className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeSubTab === 'documents'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                {t('dashboard.tabDocuments', 'My Documents')} ({documents.length})
              </button>

              <button
                onClick={() => setActiveSubTab('connectedPolicies')}
                className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeSubTab === 'connectedPolicies'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                {t('dashboard.tabConnectedPolicies', 'Connected Policies')}
              </button>

              <button
                onClick={() => setActiveSubTab('savedProviders')}
                className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeSubTab === 'savedProviders'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                {t('dashboard.tabSavedProviders', 'Saved Providers')} ({savedProviders.length})
              </button>

              <button
                onClick={() => setActiveSubTab('alerts')}
                className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeSubTab === 'alerts'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                {t('dashboard.tabNotifications', 'Security Alerts')} ({notifications.filter(n => !n.isRead).length})
              </button>
            </div>

            {/* Search filter for tables */}
            {activeSubTab === 'documents' && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder={t('dashboard.searchDocs', 'Filter documents...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-black/15 text-xs text-black placeholder:text-black/40 focus:outline-none focus:border-black shadow-sm"
                />
              </div>
            )}
          </div>

          {/* TAB CONTENT: MY DOCUMENTS */}
          {activeSubTab === 'documents' && (
            <div className="space-y-4">
              {verifications.length === 0 ? (
                <div className="p-12 text-center bg-white border border-black/10 rounded-3xl space-y-4 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mx-auto text-black/50">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium text-black">
                      {t('dashboard.noDocsTitle', 'No insurance documents analyzed yet')}
                    </h3>
                    <p className="text-xs text-black/60 max-w-sm mx-auto leading-relaxed">
                      {t('dashboard.noDocsDesc', 'Upload a PDF, JPG, or PNG policy document to run automated mathematical and underwriter checks.')}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectTab?.('verify')}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-xs font-medium cursor-pointer transition-colors shadow-sm"
                  >
                    {t('dashboard.uploadFirstDoc', 'Upload First Document')}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
                  <table className="w-full text-left text-xs text-black">
                    <thead className="bg-[#F5F5F5] text-xs font-medium uppercase tracking-wider text-black/60 border-b border-black/10">
                      <tr>
                        <th className="py-3.5 px-5">Document / File</th>
                        <th className="py-3.5 px-5">Policy Number</th>
                        <th className="py-3.5 px-5">Carrier / Insurer</th>
                        <th className="py-3.5 px-5">Authenticity Result</th>
                        <th className="py-3.5 px-5">Analyzed At</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {verifications
                        .filter(v => {
                          const policyNum = v.extractedFields?.policy_number?.value || '';
                          const insurer = v.extractedFields?.insurer?.value || v.trustedRegistryMatch?.providerName || '';
                          const name = v.filename || '';
                          return (
                            !search ||
                            policyNum.toLowerCase().includes(search.toLowerCase()) ||
                            insurer.toLowerCase().includes(search.toLowerCase()) ||
                            name.toLowerCase().includes(search.toLowerCase())
                          );
                        })
                        .map((v) => {
                          const isConsistent = v.status === 'Verified / Likely Original' || v.status === 'CONSISTENT';
                          const policyNum = v.extractedFields?.policy_number?.value || 'N/A';
                          const insurer = v.extractedFields?.insurer?.value || v.trustedRegistryMatch?.providerName || 'Unknown Carrier';
                          return (
                            <tr key={v.verificationId || v._id} className="hover:bg-black/[0.02] transition-colors">
                              <td className="py-3.5 px-5 font-medium text-black flex items-center gap-2.5">
                                <FileText className="w-4 h-4 text-black/60 flex-shrink-0" />
                                <span className="truncate max-w-[200px]">{v.filename || 'Insurance Document'}</span>
                              </td>
                              <td className="py-3.5 px-5 font-mono text-black/70">{policyNum}</td>
                              <td className="py-3.5 px-5 text-black/80 font-medium">{insurer}</td>
                              <td className="py-3.5 px-5">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                  isConsistent
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {isConsistent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                  {v.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-black/50 text-xs">
                                {v.verifiedAt ? new Date(v.verifiedAt).toLocaleDateString() : 'Recent'}
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <button
                                  onClick={() => {
                                    selectVerification(v);
                                    openReportModal();
                                  }}
                                  className="px-4 py-1.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{t('dashboard.viewAuditReport', 'Audit Report')}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: CONNECTED POLICIES */}
          {activeSubTab === 'connectedPolicies' && (
            <div className="p-10 sm:p-14 text-center bg-white border border-black/10 rounded-3xl space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto text-black">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-xl font-medium text-black">
                  {t('dashboard.noPoliciesConnectedTitle', 'No Policies Connected')}
                </h3>
                <p className="text-xs text-black/60 leading-relaxed">
                  {t(
                    'dashboard.noPoliciesConnectedDesc',
                    'We do not currently have access to your insurer account or policy records. To view policy insights or verify documents, upload a document copy or explore verified providers.'
                  )}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onSelectTab?.('verify')}
                  className="bg-black hover:bg-gray-800 text-white flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium cursor-pointer transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('dashboard.verifyADocument', 'Verify a Document')}</span>
                </button>

                <button
                  onClick={() => onSelectTab?.('discovery')}
                  className="px-6 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span>{t('dashboard.exploreInsurance', 'Explore Insurance')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: SAVED PROVIDERS */}
          {activeSubTab === 'savedProviders' && (
            <div className="space-y-4">
              {savedProviders.length === 0 ? (
                <div className="p-12 text-center bg-white border border-black/10 rounded-3xl space-y-4 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mx-auto text-black/50">
                    <Bookmark className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium text-black">
                      {t('dashboard.noSavedProvidersTitle', 'No providers saved yet')}
                    </h3>
                    <p className="text-xs text-black/60 max-w-sm mx-auto leading-relaxed">
                      {t('dashboard.noSavedProvidersDesc', 'Bookmark official providers during insurance discovery for quick access to official portals.')}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectTab?.('discovery')}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-xs font-medium cursor-pointer transition-colors shadow-sm"
                  >
                    {t('dashboard.exploreInsurance', 'Explore Insurance Providers')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {savedProviders.map(provider => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: SECURITY ALERTS */}
          {activeSubTab === 'alerts' && (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-10 text-center bg-white border border-black/10 rounded-3xl text-xs text-black/50 shadow-sm">
                  {t('dashboard.noAlerts', 'No active notifications or alerts')}
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 bg-white shadow-sm ${
                      n.isRead 
                        ? 'border-black/5 text-black/60' 
                        : 'border-black/20 text-black'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black flex-shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-black mb-1">{n.title}</h4>
                        <p className="text-xs text-black/70 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-black/40 mt-1.5 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      )}

      {/* External Redirection Modal */}
      <ExternalRedirectModal />
    </div>
  );
};

export default Dashboard;
