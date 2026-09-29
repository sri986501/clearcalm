import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, ShieldCheck, Search, Filter, ArrowRight, 
  CheckCircle2, Star, Shield, Car, Heart, Plane, Home, 
  Sparkles, Check, Info, Lock
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { useProductStore, InsuranceProduct } from '../store/useProductStore';
import { PurchaseModal } from '../components/marketplace/PurchaseModal';
import { useTranslation } from 'react-i18next';

interface InsuranceMarketplacePageProps {
  onSelectTab?: (tab: any) => void;
}

export const InsuranceMarketplacePage: React.FC<InsuranceMarketplacePageProps> = ({ onSelectTab }) => {
  const { t } = useTranslation();
  const { 
    products, selectedCategory, searchQuery, isLoading, 
    fetchProducts, setSelectedCategory, setSearchQuery 
  } = useProductStore();

  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<InsuranceProduct | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = [
    { id: 'all', label: t('marketplace.catAll', 'All Insurance'), icon: Shield },
    { id: 'health', label: t('marketplace.catHealth', 'Health Insurance'), icon: Heart },
    { id: 'vehicle', label: t('marketplace.catVehicle', 'Vehicle Insurance'), icon: Car },
    { id: 'life', label: t('marketplace.catLife', 'Life Insurance'), icon: ShieldCheck },
    { id: 'travel', label: t('marketplace.catTravel', 'Travel Insurance'), icon: Plane },
    { id: 'property', label: t('marketplace.catProperty', 'Property Insurance'), icon: Home }
  ];

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col font-sans transition-colors relative selection:bg-cyan-500/30">
      <Header activeTab="marketplace" onSelectTab={onSelectTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 z-10">
        
        {/* Marketplace Banner */}
        <div className="p-6 sm:p-8 rounded-3xl cyber-card space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-800">
            <Sparkles size={14} className="text-cyan-400" />
            <span>{t('marketplace.badge', 'Curated Online Insurance Marketplace')}</span>
          </div>

          <div className="max-w-2xl space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('marketplace.title', 'Secure Online Insurance & Instant Policy Issuance')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {t('marketplace.subtitle', 'Compare certified insurance products, calculate customized premiums, and complete server-verified policy generation in under 60 seconds.')}
            </p>
          </div>

          {/* Development / Demo Provider Transparency Disclaimer */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 inline-block">
              {t('marketplace.demoNotice', 'Notice: Products provided by Demo Insurance Providers for software development and simulation testing.')}
            </span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map(({ id, label, icon: Icon }) => {
              const isSelected = selectedCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Icon size={14} className={isSelected ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('marketplace.searchPlaceholder', 'Search plans, coverage...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="p-6 rounded-3xl cyber-card animate-pulse space-y-4">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-16 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 space-y-3 cyber-card rounded-3xl p-8">
            <ShoppingBag size={32} className="text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">{t('marketplace.noProducts', 'No insurance products found')}</h3>
            <p className="text-xs text-slate-400">{t('marketplace.noProductsDesc', 'Try switching categories or clearing search filters.')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="rounded-3xl cyber-card p-6 flex flex-col justify-between space-y-6 hover:border-cyan-500/40 transition-all group"
              >
                <div className="space-y-4">
                  
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  {/* Plan Name & Provider */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {product.planName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      by {product.providerName}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    {product.features?.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check size={14} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">{t('marketplace.sumInsuredLabel', 'Sum Insured')}</span>
                      <span className="font-mono font-bold text-white">
                        ₹{(product.sumInsured / 100000).toFixed(0)} Lakhs
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">{t('marketplace.claimSettlementLabel', 'Claim Settlement')}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {product.claimSettlementRatio}%
                      </span>
                    </div>
                  </div>

                </div>

                {/* Pricing & CTA */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('marketplace.startingFrom', 'Starting from')}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-white font-mono">
                        ₹{product.annualPremiumBase?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500">{t('marketplace.perYear', ' / yr')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProductForPurchase(product)}
                    className="btn-primary !py-2 !px-4 text-xs font-bold"
                  >
                    {t('marketplace.buyPolicy', 'Buy Policy')}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* 4-Step Checkout Modal */}
      {selectedProductForPurchase && (
        <PurchaseModal
          isOpen={Boolean(selectedProductForPurchase)}
          onClose={() => setSelectedProductForPurchase(null)}
          product={selectedProductForPurchase}
          onSuccess={() => {
            setSelectedProductForPurchase(null);
            onSelectTab?.('policies');
          }}
        />
      )}
    </div>
  );
};
