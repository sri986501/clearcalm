import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Sparkles, AlertTriangle, AlertOctagon, CheckCircle2, Eye } from 'lucide-react';

export type GuardianState = 'idle' | 'uploading' | 'scanning' | 'validating' | 'success' | 'suspicious' | 'altered';

interface GuardianMascotProps {
  state?: GuardianState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSpeechBubble?: boolean;
  customMessage?: string;
  className?: string;
}

export const GuardianMascot: React.FC<GuardianMascotProps> = ({
  state = 'idle',
  size = 'md',
  showSpeechBubble = true,
  customMessage,
  className = '',
}) => {
  const { t } = useTranslation();

  // Size dimensions
  const dimension = {
    sm: { width: 48, height: 48, container: 'w-12 h-12' },
    md: { width: 96, height: 96, container: 'w-24 h-24' },
    lg: { width: 140, height: 140, container: 'w-36 h-36' },
    hero: { width: 200, height: 200, container: 'w-52 h-52' },
  }[size];

  // Theme colors based on state
  const stateTheme = {
    idle: {
      auraClass: 'guardian-aura-glow',
      glowColor: '#06b6d4',
      eyeColor: '#22d3ee',
      runeColor: '#38bdf8',
      particleColor: '#67e8f9',
      defaultMsg: t('guardian.stateIdle'),
      badgeIcon: Shield,
    },
    uploading: {
      auraClass: 'guardian-aura-glow',
      glowColor: '#3b82f6',
      eyeColor: '#60a5fa',
      runeColor: '#93c5fd',
      particleColor: '#bfdbfe',
      defaultMsg: t('guardian.stateUploading'),
      badgeIcon: Eye,
    },
    scanning: {
      auraClass: 'guardian-aura-glow',
      glowColor: '#8b5cf6',
      eyeColor: '#a78bfa',
      runeColor: '#c4b5fd',
      particleColor: '#ddd6fe',
      defaultMsg: t('guardian.stateScanning'),
      badgeIcon: Sparkles,
    },
    validating: {
      auraClass: 'guardian-aura-glow',
      glowColor: '#0ea5e9',
      eyeColor: '#38bdf8',
      runeColor: '#7dd3fc',
      particleColor: '#bae6fd',
      defaultMsg: t('guardian.stateValidating'),
      badgeIcon: Sparkles,
    },
    success: {
      auraClass: 'guardian-aura-success',
      glowColor: '#22c55e',
      eyeColor: '#4ade80',
      runeColor: '#86efac',
      particleColor: '#bbf7d0',
      defaultMsg: t('guardian.stateComplete'),
      badgeIcon: CheckCircle2,
    },
    suspicious: {
      auraClass: 'guardian-aura-warning',
      glowColor: '#f59e0b',
      eyeColor: '#fbbf24',
      runeColor: '#fde68a',
      particleColor: '#fef3c7',
      defaultMsg: t('guardian.stateSuspicious'),
      badgeIcon: AlertTriangle,
    },
    altered: {
      auraClass: 'guardian-aura-danger',
      glowColor: '#ef4444',
      eyeColor: '#f87171',
      runeColor: '#fca5a5',
      particleColor: '#fee2e2',
      defaultMsg: t('guardian.stateAltered'),
      badgeIcon: AlertOctagon,
    },
  }[state];

  const currentMessage = customMessage || stateTheme.defaultMsg;
  const BadgeIcon = stateTheme.badgeIcon;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <div className="mb-2 relative px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md max-w-xs text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-cyan-400">
            <BadgeIcon className="w-3 h-3 shrink-0" />
            <span>{t('guardian.name')}</span>
          </div>
          <p className="text-xs text-slate-200 mt-0.5 leading-snug">{currentMessage}</p>
          {/* Bubble tail */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/90 border-r border-b border-slate-700/80 rotate-45" />
        </div>
      )}

      {/* Creature SVG Graphic */}
      <div className={`relative flex items-center justify-center ${dimension.container} ${stateTheme.auraClass}`}>
        {/* Ambient Ring Wave */}
        <div
          className="absolute inset-0 rounded-full opacity-30 animate-ping"
          style={{ backgroundColor: stateTheme.glowColor, animationDuration: '3s' }}
        />

        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-lg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id={`glowGrad-${state}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={stateTheme.glowColor} stopOpacity="0.8" />
              <stop offset="60%" stopColor={stateTheme.glowColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={stateTheme.glowColor} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`bodyGrad-${state}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id={`earGrad-${state}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={stateTheme.glowColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Background Elemental Halo */}
          <circle cx="60" cy="60" r="50" fill={`url(#glowGrad-${state})`} />
          <circle
            cx="60"
            cy="60"
            r="44"
            stroke={stateTheme.glowColor}
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="animate-spin"
            style={{ transformOrigin: 'center', animationDuration: '16s' }}
          />

          {/* Guardian Cat/Fox Ears */}
          {/* Left Ear */}
          <polygon
            points="32,48 24,16 48,32"
            fill="url(#bodyGrad-idle)"
            stroke={stateTheme.glowColor}
            strokeWidth="1.5"
          />
          <polygon points="32,44 27,22 44,32" fill={`url(#earGrad-${state})`} />

          {/* Right Ear */}
          <polygon
            points="88,48 96,16 72,32"
            fill="url(#bodyGrad-idle)"
            stroke={stateTheme.glowColor}
            strokeWidth="1.5"
          />
          <polygon points="88,44 93,22 76,32" fill={`url(#earGrad-${state})`} />

          {/* Head Shape */}
          <ellipse
            cx="60"
            cy="58"
            rx="34"
            ry="28"
            fill="url(#bodyGrad-idle)"
            stroke={stateTheme.glowColor}
            strokeWidth="2"
          />

          {/* Guardian Cheeks Tufts */}
          <path d="M26 62 Q18 64 22 70 Q28 68 30 64" fill="#0f172a" stroke={stateTheme.glowColor} strokeWidth="1" />
          <path d="M94 62 Q102 64 98 70 Q92 68 90 64" fill="#0f172a" stroke={stateTheme.glowColor} strokeWidth="1" />

          {/* Mystical Forehead Rune */}
          <path
            d="M60 40 L64 47 L60 52 L56 47 Z"
            fill={stateTheme.runeColor}
            className="animate-pulse"
          />
          <circle cx="60" cy="46" r="2" fill="#ffffff" />

          {/* Glowing Eyes */}
          {state === 'scanning' ? (
            // Scanning visor mode
            <>
              <line x1="42" y1="58" x2="78" y2="58" stroke={stateTheme.eyeColor} strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              <line x1="46" y1="58" x2="74" y2="58" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            </>
          ) : (
            // Normal / expressive glowing eyes
            <>
              {/* Left Eye */}
              <ellipse cx="46" cy="58" rx="6" ry="7" fill={stateTheme.eyeColor} />
              <ellipse cx="46" cy="58" rx="2.5" ry="5.5" fill="#020617" />
              <circle cx="44" cy="55" r="2" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="74" cy="58" rx="6" ry="7" fill={stateTheme.eyeColor} />
              <ellipse cx="74" cy="58" rx="2.5" ry="5.5" fill="#020617" />
              <circle cx="72" cy="55" r="2" fill="#ffffff" />
            </>
          )}

          {/* Cute Nose */}
          <polygon points="58,68 62,68 60,71" fill={stateTheme.glowColor} />

          {/* Guardian Mouth */}
          <path
            d={
              state === 'success'
                ? 'M53 72 Q60 80 67 72'
                : state === 'suspicious' || state === 'altered'
                ? 'M54 75 Q60 71 66 75'
                : 'M54 73 Q60 76 66 73'
            }
            stroke={stateTheme.glowColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cute Whiskers */}
          <line x1="26" y1="68" x2="40" y2="69" stroke={stateTheme.glowColor} strokeWidth="1" strokeOpacity="0.6" />
          <line x1="27" y1="73" x2="39" y2="72" stroke={stateTheme.glowColor} strokeWidth="1" strokeOpacity="0.6" />
          <line x1="94" y1="68" x2="80" y2="69" stroke={stateTheme.glowColor} strokeWidth="1" strokeOpacity="0.6" />
          <line x1="93" y1="73" x2="81" y2="72" stroke={stateTheme.glowColor} strokeWidth="1" strokeOpacity="0.6" />

          {/* Chest Guardian Shield Emblem */}
          <path
            d="M60 84 L69 88 L69 97 Q69 104 60 108 Q51 104 51 97 L51 88 Z"
            fill="#0f172a"
            stroke={stateTheme.glowColor}
            strokeWidth="1.5"
          />
          <path
            d="M60 88 L65 91 L65 96 Q65 101 60 104 Q55 101 55 96 L55 91 Z"
            fill={stateTheme.glowColor}
            opacity="0.8"
          />
        </svg>
      </div>
    </div>
  );
};
