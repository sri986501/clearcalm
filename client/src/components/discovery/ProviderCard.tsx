import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, AlertTriangle, ExternalLink, Bookmark, CheckCircle, Globe, Award, Phone } from 'lucide-react';
import { InsuranceProvider, ProviderSourceState, useProviderStore } from '../../store/useProviderStore';

interface ProviderCardProps {
  provider: InsuranceProvider;
  token?: string;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, token }) => {
  const { t } = useTranslation();
  const { openRedirectModal, toggleSaveProvider } = useProviderStore();

  const getSourceBadge = (state: ProviderSourceState) => {
    switch (state) {
      case 'OFFICIAL_VERIFIED':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dot: 'bg-emerald-500',
          icon: ShieldCheck,
          label: t('sourceStates.officialVerified', 'Official Provider'),
          btnText: t('discovery.visitOfficialWebsite', 'Visit Website ↗'),
          btnClass: 'bg-black hover:bg-gray-800 text-white shadow-sm'
        };
      case 'OFFICIAL_POLICY_PAGE':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dot: 'bg-emerald-500',
          icon: ShieldCheck,
          label: t('sourceStates.officialPolicyVerified', 'Official Policy'),
          btnText: t('discovery.viewOnProviderWebsite', 'View on Website ↗'),
          btnClass: 'bg-black hover:bg-gray-800 text-white shadow-sm'
        };
      case 'SOURCE_CONFIRMED':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
          dot: 'bg-blue-500',
          icon: ShieldCheck,
          label: t('sourceStates.sourceConfirmed', 'Source Confirmed'),
          btnText: t('discovery.openSource', 'Open Source ↗'),
          btnClass: 'bg-black hover:bg-gray-800 text-white shadow-sm'
        };
      case 'PENDING_VERIFICATION':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          label: t('sourceStates.pendingVerification', 'Verification Pending'),
          btnText: t('discovery.openLink', 'Open Link ↗'),
          btnClass: 'bg-black hover:bg-gray-800 text-white shadow-sm'
        };
      case 'UNVERIFIED':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-700',
          dot: 'bg-orange-500',
          icon: AlertTriangle,
          label: t('sourceStates.unverified', 'Unverified Source'),
          btnText: t('discovery.openWithCaution', 'Open With Caution ↗'),
          btnClass: 'bg-neutral-800 hover:bg-black text-white shadow-sm'
        };
      case 'UNAVAILABLE':
        return {
          bg: 'bg-neutral-100 border-neutral-200 text-neutral-500',
          dot: 'bg-neutral-400',
          icon: AlertTriangle,
          label: t('sourceStates.unavailable', 'Link Unavailable'),
          btnText: t('sourceStates.unavailable', 'Unavailable'),
          btnClass: 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
        };
      case 'BLOCKED':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          dot: 'bg-rose-500',
          icon: AlertTriangle,
          label: t('sourceStates.blocked', 'Link Disabled'),
          btnText: t('sourceStates.blocked', 'Disabled'),
          btnClass: 'bg-rose-100 text-rose-400 cursor-not-allowed'
        };
      default:
        return {
          bg: 'bg-neutral-100 border-neutral-200 text-neutral-600',
          dot: 'bg-neutral-400',
          icon: ShieldCheck,
          label: t('sourceStates.unknown', 'External Link'),
          btnText: t('discovery.openLink', 'Open Link ↗'),
          btnClass: 'bg-black hover:bg-gray-800 text-white shadow-sm'
        };
    }
  };

  const badge = getSourceBadge(provider.sourceState);
  const BadgeIcon = badge.icon;
  const isActionDisabled = provider.sourceState === 'UNAVAILABLE' || provider.sourceState === 'BLOCKED';

  const formattedDate = provider.lastCheckedAt
    ? new Date(provider.lastCheckedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recent';

  return (
    <div className="relative group bg-white border border-black/10 hover:border-black/30 rounded-2xl p-6 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Header Row: Name & Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-medium tracking-wider text-black/60 uppercase bg-black/5 border border-black/10 px-2 py-0.5 rounded-full">
                {provider.providerType} INSURER
              </span>
              {provider.isPopular && (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  ★ REPUTED
                </span>
              )}
            </div>
            <h3 className="text-lg font-medium text-black leading-snug">
              {provider.providerName}
            </h3>
            <p className="text-xs text-black/60 mt-1 line-clamp-2">
              {provider.tagline || provider.description}
            </p>
          </div>

          <button
            onClick={() => toggleSaveProvider(provider.id, token)}
            title={provider.isSaved ? 'Remove from Saved' : 'Save Provider'}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              provider.isSaved
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-black/40 border-black/10 hover:text-black hover:border-black/30'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${provider.isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Source State Badge */}
        <div className="my-3 flex flex-wrap items-center gap-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-black/60 bg-black/5 px-2.5 py-1 rounded-full border border-black/5">
            <Globe className="w-3 h-3 text-black/50" />
            <span>{provider.officialDomain}</span>
          </div>
        </div>

        {/* Provider Metrics */}
        <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-black/[0.03] border border-black/5 rounded-xl text-xs">
          <div>
            <span className="text-black/50 text-[11px] block">{t('discovery.settlementRatio', 'Claim Settlement')}</span>
            <span className="font-medium text-emerald-700 font-mono">{provider.claimSettlementRatio}</span>
          </div>
          <div>
            <span className="text-black/50 text-[11px] block">{t('discovery.lastCheck', 'Last check')}</span>
            <span className="font-mono text-black/60 text-[11px]">{formattedDate}</span>
          </div>
        </div>

        {/* Categories Tags */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {provider.categoriesOffered.map((cat) => (
            <span
              key={cat}
              className="text-[10px] font-medium text-black/70 bg-black/5 border border-black/5 px-2.5 py-0.5 rounded-full capitalize"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-black/10 flex items-center justify-between gap-3 mt-2">
        <div className="text-[11px] text-black/50 truncate" title={provider.verificationMethod}>
          {provider.regulatoryRegistrationNumber ? (
            <span className="font-mono text-black/60">{provider.regulatoryRegistrationNumber}</span>
          ) : (
            <span>Verified official domain</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => !isActionDisabled && openRedirectModal(provider)}
          disabled={isActionDisabled}
          className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${badge.btnClass}`}
        >
          <span>{badge.btnText}</span>
        </button>
      </div>
    </div>
  );
};

export default ProviderCard;
