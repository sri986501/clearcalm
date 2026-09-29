import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield, Search, CheckCircle2, AlertCircle, HelpCircle,
  FileText, HeartPulse, Car, ShieldCheck, Plane, Home, Briefcase, Filter, Info, Layers
} from 'lucide-react';
import { useProviderStore, CategoryGuide, InsuranceProvider } from '../store/useProviderStore';
import { ProviderCard } from '../components/discovery/ProviderCard';
import { ExternalRedirectModal } from '../components/discovery/ExternalRedirectModal';
import { Header } from '../components/common/Header';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SupportCard } from '../components/ui/SupportCard';

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans transition-colors selection:bg-[#0369A1] selection:text-white">
      <Header activeTab="discovery" />

      <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Header Section */}
        <div className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm text-center max-w-4xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0369A1] border border-sky-100 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Insurance Knowledge &amp; Carrier Directory</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            Understand Your Insurance Options
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Learn what different policy types cover, review common exclusions, and connect directly with verified, IRDAI-accredited insurance carriers in India.
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap" role="tablist" aria-label="Insurance categories">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0F2942] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Categories</span>
          </button>

          {categories.map((cat: CategoryGuide) => {
            const Icon = categoryIcons[cat.id] || Shield;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Grid: Guide (if category selected) & Verified Carriers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Educational Guide */}
          {currentCategoryGuide && selectedCategory !== 'all' && (
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  {(() => {
                    const CatIcon = categoryIcons[currentCategoryGuide.id] || Shield;
                    return (
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0369A1] flex items-center justify-center shrink-0 border border-sky-100">
                        <CatIcon className="w-5 h-5" />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="text-xl font-bold text-[#0F172A]">{currentCategoryGuide.name} Guide</h2>
                    <p className="text-xs text-slate-500 font-medium">Plain-language coverage overview</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentCategoryGuide.whatIsIt}
                </div>

                {/* Who Should Consider */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#0369A1]" />
                    <span>Who Needs This Protection</span>
                  </h3>
                  <ul className="space-y-1.5 pl-1">
                    {currentCategoryGuide.whoShouldConsider.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0369A1] mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Coverage */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Typical Covered Benefits</span>
                  </h3>
                  <ul className="space-y-1.5 pl-1">
                    {currentCategoryGuide.commonCoverageAreas.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Exclusions */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Key Exclusions &amp; Waiting Clauses</span>
                  </h3>
                  <ul className="space-y-1.5 pl-1">
                    {currentCategoryGuide.commonExclusions.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Questions to Ask */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#0369A1]" />
                    <span>Questions to Check Before Buying</span>
                  </h3>
                  <ul className="space-y-1.5 pl-1">
                    {currentCategoryGuide.questionsToAskBeforePurchasing.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Right Column (or Full Width): Provider Directory */}
          <div className={`${selectedCategory !== 'all' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
            
            {/* Search & Filter Header */}
            <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search carrier name, plan keyword, or official website…"
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0369A1] focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
                  {filteredProviders.length} Official Carriers
                </span>
              </div>
            </div>

            {/* Providers Grid */}
            {filteredProviders.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-2">
                <p className="text-sm font-semibold text-slate-700">No verified providers found matching your query.</p>
                <p className="text-xs text-slate-500">Try clearing the search input or selecting a different category.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${selectedCategory === 'all' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                {filteredProviders.map(provider => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Support Card */}
        <SupportCard />
      </main>

      <ExternalRedirectModal />
    </div>
  );
};

export default InsuranceDiscoveryPage;
