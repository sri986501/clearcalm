import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, ShieldCheck, AlertTriangle, X, CheckCircle2, Lock, ArrowUpRight } from 'lucide-react';
import { useProviderStore, ProviderSourceState } from '../../store/useProviderStore';
import { RobotAssistant } from '../robot/RobotAssistant';

export const ExternalRedirectModal: React.FC = () => {
  const { t } = useTranslation();
  const { redirectModal, closeRedirectModal } = useProviderStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!redirectModal.isOpen || !redirectModal.provider) return null;

  const { provider, destinationUrl, isPolicyPage } = redirectModal;

  const getSourceBadge = (state: ProviderSourceState) => {
    switch (state) {
      case 'OFFICIAL_VERIFIED':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: ShieldCheck,
          label: isPolicyPage ? t('sourceStates.officialPolicyVerified', '🟢 Official Policy Information') : t('sourceStates.officialVerified', '🟢 Official Provider')
        };
      case 'OFFICIAL_POLICY_PAGE':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: ShieldCheck,
          label: t('sourceStates.officialPolicyVerified', '🟢 Official Policy Information')
        };
      case 'SOURCE_CONFIRMED':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-400',
          icon: ShieldCheck,
          label: t('sourceStates.sourceConfirmed', '🔵 Source Confirmed')
        };
      case 'PENDING_VERIFICATION':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          icon: AlertTriangle,
          label: t('sourceStates.pendingVerification', '🟡 Verification Pending')
        };
      case 'UNVERIFIED':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          dot: 'bg-orange-400',
          icon: AlertTriangle,
          label: t('sourceStates.unverified', '🟠 Unverified Source')
        };
      case 'UNAVAILABLE':
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          dot: 'bg-slate-400',
          icon: AlertTriangle,
          label: t('sourceStates.unavailable', '⚪ Link Unavailable')
        };
      case 'BLOCKED':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          icon: AlertTriangle,
          label: t('sourceStates.blocked', '🔴 Link Disabled')
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          dot: 'bg-slate-400',
          icon: ShieldCheck,
          label: t('sourceStates.unknown', '⚪ External Link')
        };
    }
  };

  const badge = getSourceBadge(provider.sourceState);
  const BadgeIcon = badge.icon;
  const isActionDisabled = provider.sourceState === 'UNAVAILABLE' || provider.sourceState === 'BLOCKED';

  let destinationHostname = provider.officialDomain;
  try {
    destinationHostname = new URL(destinationUrl).hostname;
  } catch (e) {}

  const handleContinue = () => {
    if (isActionDisabled) return;
    setIsRedirecting(true);

    setTimeout(() => {
      window.open(destinationUrl, '_blank', 'noopener,noreferrer');
      setIsRedirecting(false);
      closeRedirectModal();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#0B0F19] border border-cyan-500/30 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,240,255,0.15)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Futuristic hairline top glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Close Button */}
        <button
          onClick={closeRedirectModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Robot & Title */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <RobotAssistant state={isRedirecting ? 'analyzing' : 'idle'} size="sm" showSpeechBubble={false} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase mb-1">
              <Lock className="w-3.5 h-3.5" />
              {t('redirectModal.securityHandshake', 'SECURE EXTERNAL REDIRECTION')}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {t('redirectModal.title', "You're Leaving Our Platform")}
            </h3>
          </div>
        </div>

        {/* Content Box */}
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t('redirectModal.provider', 'Insurance Provider')}:</span>
              <span className="font-semibold text-slate-200">{provider.providerName}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t('redirectModal.destination', 'Destination Domain')}:</span>
              <span className="font-mono text-cyan-300 font-semibold">{destinationHostname}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('redirectModal.sourceStatus', 'Source Status')}:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
                <BadgeIcon className="w-3.5 h-3.5" />
                {badge.label}
              </span>
            </div>

            {provider.regulatoryRegistrationNumber && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t('redirectModal.registration', 'IRDAI Registration')}:</span>
                <span className="font-mono text-slate-300">{provider.regulatoryRegistrationNumber}</span>
              </div>
            )}
          </div>

          {/* Pending Warning */}
          {provider.sourceState === 'PENDING_VERIFICATION' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{t('redirectModal.pendingWarning', 'This provider link has not yet been independently verified as an official destination. Proceed with caution.')}</span>
            </div>
          )}

          {/* Disclaimers & Trust Notice */}
          <div className="text-xs text-slate-400 leading-relaxed space-y-1.5">
            <p>
              {t('redirectModal.disclaimer', 'You are being redirected to the insurance provider’s official platform. The insurer directly controls its policy availability, terms, premium calculations, transactions, and claim settlements.')}
            </p>
            <p className="text-slate-500">
              {t('redirectModal.subDisclaimer', 'Our platform does not collect payments or issue insurance policies on behalf of external providers.')}
            </p>
          </div>
        </div>

        {/* Transition message if clicked */}
        {isRedirecting && (
          <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-3 text-cyan-300 text-xs font-mono animate-pulse">
            <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>{t('redirectModal.connecting', 'Connecting you securely to the official provider...')}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeRedirectModal}
            className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            {t('common.cancel', 'Cancel')}
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isActionDisabled || isRedirecting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              isActionDisabled
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)]'
            }`}
          >
            <span>
              {isPolicyPage
                ? t('discovery.viewOnProviderWebsite', 'View on Provider Website ↗')
                : t('discovery.visitOfficialWebsite', 'Visit Official Website ↗')}
            </span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
