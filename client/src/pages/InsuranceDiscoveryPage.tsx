import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  DollarSign,
  HeartPulse,
  Car,
  ShieldCheck,
  Plane,
  Home,
  Briefcase,
  Filter,
  Info,
  Layers
} from 'lucide-react';
import { useProviderStore, CategoryGuide, InsuranceProvider } from '../store/useProviderStore';
import { ProviderCard } from '../components/discovery/ProviderCard';
import { ExternalRedirectModal } from '../components/discovery/ExternalRedirectModal';
import { Header } from '../components/common/Header';

export const InsuranceDiscoveryPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    providers,
    categories,
    selectedCategory,
    searchQuery,
    sourceStateFilter,
    fetchProviders,
    fetchCategories,
    setSelectedCategory,
    setSearchQuery,
    setSourceStateFilter
  } = useProviderStore();

  useEffect(() => {
    fetchProviders();
    fetchCategories();
  }, [fetchProviders, fetchCategories]);

  const categoryIcons: Record<string, any> = {
    health: HeartPulse,
    vehicle: Car,
    life: ShieldCheck,
    travel: Plane,
    property: Home,
    business: Briefcase
  };

  const currentCategoryGuide: CategoryGuide | undefined =
    categories.find((c: CategoryGuide) => c.id === selectedCategory) || categories[0];

  const filteredProviders = providers.filter((p: InsuranceProvider) => {
    const matchesCat = selectedCategory === 'all' || p.categoriesOffered.includes(selectedCategory as any);
    const matchesState = sourceStateFilter === 'all' || p.sourceState === sourceStateFilter;
    const matchesSearch =
      !searchQuery ||
      p.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.officialDomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesState && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black flex flex-col font-sans transition-colors relative selection:bg-black selection:text-white">
      {/* Subtle professional background image watermark related to insurance intelligence */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.06] bg-cover bg-center"
        style={{ backgroundImage: `url('/images/portal_bg.jpg')` }}
      />

      <Header activeTab="discovery" />

      <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/10 text-black/70 text-xs font-medium tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5 text-black" />
            <span>{t('discovery.badge', 'INSURANCE DISCOVERY & VERIFIED PROVIDERS')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-black">
            {t('discovery.heroTitle', 'Discover & Understand Insurance')}
          </h1>
          <p className="text-base text-black/60 leading-relaxed">
            {t(
              'discovery.heroSubtitle',
              'Learn what different policies cover, understand key exclusions, and connect directly with official, accredited insurance providers in India.'
            )}
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-black/70 border border-black/10 hover:border-black/30 hover:bg-black/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t('discovery.allCategories', 'All Categories')}</span>
          </button>

          {categories.map((cat: CategoryGuide) => {
            const Icon = categoryIcons[cat.id] || Shield;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-black/70 border border-black/10 hover:border-black/30 hover:bg-black/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Category Educational Guide */}
          {currentCategoryGuide && selectedCategory !== 'all' && (
            <div className="lg:col-span-5 space-y-6">
              {/* Category Overview Card */}
              <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3.5 mb-4">
                  {(() => {
                    const CatIcon = categoryIcons[currentCategoryGuide.id] || Shield;
                    return (
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                        <CatIcon className="w-5 h-5" />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="text-xl font-medium text-black">{currentCategoryGuide.name}</h2>
                    <p className="text-xs text-black/50 font-medium">{t('discovery.educationalGuide', 'Educational Overview')}</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-black/70 leading-relaxed mb-6 bg-black/[0.02] border border-black/5 p-4 rounded-2xl">
                  {currentCategoryGuide.whatIsIt}
                </p>

                {/* Who Should Consider */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-black/60 mb-3 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-black" />
                    <span>{t('discovery.whoShouldConsider', 'Who Should Consider It')}</span>
                  </h3>
                  <ul className="space-y-2">
                    {currentCategoryGuide.whoShouldConsider.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-black/70 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Coverage */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('discovery.commonCoverage', 'Common Coverage Areas')}</span>
                  </h3>
                  <ul className="space-y-2">
                    {currentCategoryGuide.commonCoverageAreas.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-black/70 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Exclusions */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('discovery.commonExclusions', 'Common Exclusions & Waiting Periods')}</span>
                  </h3>
                  <ul className="space-y-2">
                    {currentCategoryGuide.commonExclusions.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-black/70 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Documents Required */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-black/60 mb-3 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-black/60" />
                    <span>{t('discovery.documentsRequired', 'Documents Commonly Required')}</span>
                  </h3>
                  <ul className="space-y-2">
                    {currentCategoryGuide.documentsRequired.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-black/70 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-black/60 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Questions To Ask */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-black/60 mb-3 flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-black/60" />
                    <span>{t('discovery.questionsToAsk', 'Questions to Ask Before Purchasing')}</span>
                  </h3>
                  <ul className="space-y-2">
                    {currentCategoryGuide.questionsToAskBeforePurchasing.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-black/70 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-black/60 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Non-invented Pricing Disclaimer */}
                <div className="p-4 bg-black/[0.03] border border-black/10 rounded-2xl text-xs text-black/70">
                  <div className="flex items-center gap-2 text-black font-medium mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{t('discovery.pricingNoticeTitle', 'Premium Calculation Notice')}</span>
                  </div>
                  <p className="text-black/60 leading-relaxed">
                    {currentCategoryGuide.pricingNote}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Right Column / Full Width: Verified Providers Directory */}
          <div className={selectedCategory === 'all' ? 'lg:col-span-12' : 'lg:col-span-7'}>
            {/* Search & Filter Toolbar */}
            <div className="bg-white border border-black/10 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('discovery.searchPlaceholder', 'Search providers, domains, types...')}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-black/15 rounded-full text-xs text-black placeholder:text-black/40 focus:outline-none focus:border-black shadow-sm"
                />
              </div>

              {/* Source State Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-black/50" />
                <select
                  value={sourceStateFilter}
                  onChange={(e) => setSourceStateFilter(e.target.value)}
                  className="bg-white border border-black/15 text-xs text-black py-2 px-3 rounded-full focus:outline-none focus:border-black w-full sm:w-auto shadow-sm cursor-pointer"
                >
                  <option value="all">{t('sourceStates.allStates', 'All Source States')}</option>
                  <option value="OFFICIAL_VERIFIED">{t('sourceStates.officialVerified', 'Official Provider')}</option>
                  <option value="OFFICIAL_POLICY_PAGE">{t('sourceStates.officialPolicyVerified', 'Official Policy Page')}</option>
                  <option value="SOURCE_CONFIRMED">{t('sourceStates.sourceConfirmed', 'Source Confirmed')}</option>
                  <option value="PENDING_VERIFICATION">{t('sourceStates.pendingVerification', 'Verification Pending')}</option>
                  <option value="UNVERIFIED">{t('sourceStates.unverified', 'Unverified Source')}</option>
                </select>
              </div>
            </div>

            {/* Providers Grid */}
            {filteredProviders.length === 0 ? (
              <div className="bg-white border border-black/10 rounded-3xl p-12 text-center shadow-sm">
                <Shield className="w-12 h-12 text-black/40 mx-auto mb-4" />
                <h3 className="text-base font-medium text-black mb-2">{t('discovery.noProvidersFound', 'No providers match your filter')}</h3>
                <p className="text-xs text-black/60 max-w-md mx-auto mb-4 leading-relaxed">
                  {t('discovery.noProvidersDesc', 'Try resetting your search query or selecting "All Categories" to view accredited carriers.')}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSourceStateFilter('all');
                  }}
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-medium cursor-pointer transition-colors shadow-sm"
                >
                  {t('discovery.resetFilters', 'Reset Filters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredProviders.map((provider: InsuranceProvider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trust & Transparency Banner */}
        <div className="p-6 bg-white border border-black/10 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-black uppercase tracking-wider mb-1">
                {t('discovery.trustTitle', 'Trust & Responsible Governance Notice')}
              </h4>
              <p className="text-xs text-black/60 leading-relaxed max-w-3xl">
                {t(
                  'discovery.trustDesc',
                  'We provide insurance discovery, educational guides, and document authenticity analysis tools. Policy availability, pricing, terms, underwriter decisions, and purchases are strictly controlled by the respective insurance provider.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-[11px] font-mono text-black/70 bg-black/5 border border-black/10 px-3 py-1.5 rounded-full">
              100% INDEPENDENT LAYER
            </span>
          </div>
        </div>
      </main>

      {/* External Redirection Handshake Modal */}
      <ExternalRedirectModal />
    </div>
  );
};

export default InsuranceDiscoveryPage;
