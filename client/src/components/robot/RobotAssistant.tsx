import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Cpu, Scan, CheckCircle2, AlertTriangle, AlertOctagon, Lock, Eye, Sparkles } from 'lucide-react';

export type RobotState = 
  | 'idle' 
  | 'listening' 
  | 'uploading' 
  | 'scanning' 
  | 'analyzing' 
  | 'verified' 
  | 'suspicious' 
  | 'error' 
  | 'payment' 
  | 'success';

interface RobotAssistantProps {
  state?: RobotState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSpeechBubble?: boolean;
  customMessage?: string;
  className?: string;
}

export const RobotAssistant: React.FC<RobotAssistantProps> = ({
  state = 'idle',
  size = 'md',
  showSpeechBubble = true,
  customMessage,
  className = '',
}) => {
  const { t } = useTranslation();

  const dimension = {
    sm: { container: 'w-12 h-12', svgSize: 48 },
    md: { container: 'w-24 h-24', svgSize: 96 },
    lg: { container: 'w-36 h-36', svgSize: 144 },
    hero: { container: 'w-56 h-56 sm:w-64 sm:h-64', svgSize: 240 },
  }[size];

  // State Themes
  const stateTheme = {
    idle: {
      auraClass: 'robot-aura-glow',
      glowColor: '#00F0FF',
      visorColor: '#00F0FF',
      coreColor: '#38BDF8',
      ringColor: '#0EA5E9',
      defaultMsg: t('robot.stateIdle', 'Aegis AI is active and monitoring document integrity.'),
      badgeIcon: ShieldCheck,
    },
    listening: {
      auraClass: 'robot-aura-glow',
      glowColor: '#38BDF8',
      visorColor: '#60A5FA',
      coreColor: '#93C5FD',
      ringColor: '#3B82F6',
      defaultMsg: t('robot.stateListening', 'Aegis AI is ready. How can I assist with your policy?'),
      badgeIcon: Cpu,
    },
    uploading: {
      auraClass: 'robot-aura-glow',
      glowColor: '#38BDF8',
      visorColor: '#38BDF8',
      coreColor: '#60A5FA',
      ringColor: '#0284C7',
      defaultMsg: t('robot.stateUploading', 'Ingesting document into encrypted staging vault…'),
      badgeIcon: Eye,
    },
    scanning: {
      auraClass: 'robot-aura-scanning',
      glowColor: '#00F0FF',
      visorColor: '#00F0FF',
      coreColor: '#38BDF8',
      ringColor: '#00F0FF',
      defaultMsg: t('robot.stateScanning', 'Scanning optical parameters and verifying rate arithmetic…'),
      badgeIcon: Scan,
    },
    analyzing: {
      auraClass: 'robot-aura-scanning',
      glowColor: '#818CF8',
      visorColor: '#A5B4FC',
      coreColor: '#C7D2FE',
      ringColor: '#6366F1',
      defaultMsg: t('robot.stateAnalyzing', 'Cross-referencing authorized carrier database & date chronology…'),
      badgeIcon: Sparkles,
    },
    verified: {
      auraClass: 'robot-aura-success',
      glowColor: '#10B981',
      visorColor: '#34D399',
      coreColor: '#6EE7B7',
      ringColor: '#059669',
      defaultMsg: t('robot.stateVerified', 'Analysis Complete: No significant anomalies detected.'),
      badgeIcon: CheckCircle2,
    },
    suspicious: {
      auraClass: 'robot-aura-warning',
      glowColor: '#F59E0B',
      visorColor: '#FBBF24',
      coreColor: '#FDE68A',
      ringColor: '#D97706',
      defaultMsg: t('robot.stateSuspicious', 'Review Required: Inconsistencies detected in policy terms.'),
      badgeIcon: AlertTriangle,
    },
    error: {
      auraClass: 'robot-aura-danger',
      glowColor: '#EF4444',
      visorColor: '#F87171',
      coreColor: '#FCA5A5',
      ringColor: '#DC2626',
      defaultMsg: t('robot.stateError', 'Notice: Unable to verify document structure.'),
      badgeIcon: AlertOctagon,
    },
    payment: {
      auraClass: 'robot-aura-glow',
      glowColor: '#3B82F6',
      visorColor: '#60A5FA',
      coreColor: '#93C5FD',
      ringColor: '#2563EB',
      defaultMsg: t('robot.statePayment', 'Monitoring cryptographic server-side payment verification…'),
      badgeIcon: Lock,
    },
    success: {
      auraClass: 'robot-aura-success',
      glowColor: '#10B981',
      visorColor: '#34D399',
      coreColor: '#6EE7B7',
      ringColor: '#10B981',
      defaultMsg: t('robot.stateSuccess', 'Policy successfully bound and verified in digital vault.'),
      badgeIcon: CheckCircle2,
    },
  }[state];

  const currentMessage = customMessage || stateTheme.defaultMsg;
  const BadgeIcon = stateTheme.badgeIcon;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Speech / Telemetry Bubble */}
      {showSpeechBubble && (
        <div className="mb-2.5 relative px-3.5 py-2 rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-xl backdrop-blur-xl max-w-xs text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
            <BadgeIcon className="w-3 h-3 shrink-0" />
            <span>{t('robot.name', 'AEGIS AI')}</span>
            <span className="text-[9px] font-mono text-slate-400">CORE v3.4</span>
          </div>
          <p className="text-xs text-slate-200 mt-1 leading-snug font-medium">{currentMessage}</p>
          {/* Bubble tail */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950/90 border-r border-b border-cyan-500/30 rotate-45" />
        </div>
      )}

      {/* Futuristic Robot Graphic (Lightweight Vector SVG) */}
      <div className={`relative flex items-center justify-center ${dimension.container} ${stateTheme.auraClass}`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`chassisGrad-${state}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="40%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id={`visorGrad-${state}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={stateTheme.visorColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor={stateTheme.glowColor} stopOpacity="0.7" />
            </linearGradient>

            <radialGradient id={`coreGlow-${state}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={stateTheme.glowColor} stopOpacity="0.9" />
              <stop offset="70%" stopColor={stateTheme.glowColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={stateTheme.glowColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Telemetry Halo Ring */}
          <circle
            cx="60"
            cy="58"
            r="52"
            stroke={stateTheme.ringColor}
            strokeWidth="1.2"
            strokeDasharray="4 8"
            strokeOpacity="0.5"
            className="animate-spin"
            style={{ transformOrigin: 'center', animationDuration: '24s' }}
          />
          <circle
            cx="60"
            cy="58"
            r="46"
            stroke={stateTheme.glowColor}
            strokeWidth="0.8"
            strokeDasharray="2 12"
            strokeOpacity="0.4"
          />

          {/* Floating Head Hover Platform / Floating Base Shadow */}
          <ellipse cx="60" cy="112" rx="28" ry="4" fill={stateTheme.glowColor} opacity="0.25" className="animate-pulse" />

          {/* Mechanical Shoulder Mounts */}
          <rect x="26" y="80" width="12" height="14" rx="4" fill="#0F172A" stroke={stateTheme.glowColor} strokeWidth="1" strokeOpacity="0.4" />
          <rect x="82" y="80" width="12" height="14" rx="4" fill="#0F172A" stroke={stateTheme.glowColor} strokeWidth="1" strokeOpacity="0.4" />

          {/* Torso / Core Housing */}
          <path
            d="M38 78 L82 78 L78 102 L42 102 Z"
            fill={`url(#chassisGrad-${state})`}
            stroke={stateTheme.glowColor}
            strokeWidth="1.5"
          />
          {/* Core Reactor */}
          <circle cx="60" cy="90" r="10" fill={`url(#coreGlow-${state})`} />
          <circle cx="60" cy="90" r="5" fill="#0F172A" stroke={stateTheme.glowColor} strokeWidth="1.2" />
          <circle cx="60" cy="90" r="2.5" fill={stateTheme.coreColor} className="animate-pulse" />

          {/* Neck Link */}
          <rect x="54" y="68" width="12" height="12" rx="2" fill="#1E293B" stroke={stateTheme.glowColor} strokeWidth="1" strokeOpacity="0.6" />

          {/* Antenna / Optical Sensor Fin */}
          <path d="M60 12 L60 22" stroke={stateTheme.glowColor} strokeWidth="2" strokeLinecap="round" />
          <circle cx="60" cy="12" r="3" fill={stateTheme.glowColor} className="animate-pulse" />
          <circle cx="60" cy="12" r="6" stroke={stateTheme.glowColor} strokeWidth="0.8" strokeOpacity="0.6" />

          {/* Robot Head Chassis (Futuristic Sleek Angular Shape) */}
          <path
            d="M30 36 L44 24 L76 24 L90 36 L90 60 L78 70 L42 70 L30 60 Z"
            fill={`url(#chassisGrad-${state})`}
            stroke={stateTheme.glowColor}
            strokeWidth="1.8"
          />

          {/* Head Panel Seams */}
          <line x1="44" y1="24" x2="44" y2="34" stroke={stateTheme.glowColor} strokeWidth="1" strokeOpacity="0.4" />
          <line x1="76" y1="24" x2="76" y2="34" stroke={stateTheme.glowColor} strokeWidth="1" strokeOpacity="0.4" />
          <circle cx="34" cy="38" r="1.5" fill={stateTheme.glowColor} opacity="0.7" />
          <circle cx="86" cy="38" r="1.5" fill={stateTheme.glowColor} opacity="0.7" />

          {/* Holographic Visor Display Area */}
          <rect
            x="36"
            y="36"
            width="48"
            height="22"
            rx="6"
            fill="#020617"
            stroke={stateTheme.visorColor}
            strokeWidth="1.2"
          />

          {/* Visor Content Based on State */}
          {state === 'scanning' ? (
            // Laser Scanning Grid Visor
            <>
              <line x1="38" y1="47" x2="82" y2="47" stroke={stateTheme.visorColor} strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              <line x1="42" y1="41" x2="42" y2="53" stroke={stateTheme.visorColor} strokeWidth="1" strokeOpacity="0.5" />
              <line x1="60" y1="39" x2="60" y2="55" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
              <line x1="78" y1="41" x2="78" y2="53" stroke={stateTheme.visorColor} strokeWidth="1" strokeOpacity="0.5" />
            </>
          ) : state === 'verified' || state === 'success' ? (
            // Confirmed Eye Optics (Twin Curved HUD Arcs)
            <>
              <path d="M42 48 Q48 42 54 48" stroke={stateTheme.visorColor} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M66 48 Q72 42 78 48" stroke={stateTheme.visorColor} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="48" cy="45" r="1.5" fill="#FFFFFF" />
              <circle cx="72" cy="45" r="1.5" fill="#FFFFFF" />
            </>
          ) : state === 'suspicious' || state === 'error' ? (
            // Alert Optics (Narrowed Focus HUD)
            <>
              <line x1="42" y1="49" x2="54" y2="46" stroke={stateTheme.visorColor} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="66" y1="46" x2="78" y2="49" stroke={stateTheme.visorColor} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="48" cy="48" r="1.5" fill="#FFFFFF" />
              <circle cx="72" cy="48" r="1.5" fill="#FFFFFF" />
            </>
          ) : (
            // Default Intelligent Visor Optics (Twin Glowing HUD Rectangles)
            <>
              <rect x="43" y="42" width="11" height="10" rx="3" fill={`url(#visorGrad-${state})`} />
              <rect x="66" y="42" width="11" height="10" rx="3" fill={`url(#visorGrad-${state})`} />
              <circle cx="46" cy="45" r="1.2" fill="#FFFFFF" />
              <circle cx="69" cy="45" r="1.2" fill="#FFFFFF" />
            </>
          )}

          {/* Micro Telemetry Bar under Visor */}
          <line x1="44" y1="62" x2="76" y2="62" stroke={stateTheme.glowColor} strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
};
