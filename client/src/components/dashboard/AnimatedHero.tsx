import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
   Upload, 
   BarChart3, 
   Sparkles, 
   ShieldCheck, 
   CheckCircle2, 
   AlertTriangle, 
   Cpu, 
   Zap,
   Activity
 } from 'lucide-react';

interface AnimatedHeroProps {
  onVerifyClick: () => void;
  onMetricsClick: () => void;
}

const DEMO_COVENANTS = [
  {
    id: 'math',
    title: 'Actuarial Premium Proof',
    status: 'CONSISTENT',
    extracted: 'Base Premium $1,250 + Risk Surcharge $320 = Gross $1,570',
    valid: true,
    score: 0.02
  },
  {
    id: 'chronology',
    title: 'Retroactive Inception Audit',
    status: 'CONSISTENT',
    extracted: 'Policy Inception: 2026-01-01 > Signed Date: 2025-12-28',
    valid: true,
    score: 0.04
  },
  {
    id: 'deductible',
    title: 'Aggregate Limit Verification',
    status: 'NEEDS REVIEW',
    extracted: 'Per-Occurrence $500K exceeds stated Policy Aggregate $400K',
    valid: false,
    score: 0.88
  }
];

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({ onVerifyClick, onMetricsClick }) => {
  const [activeCovenantIndex, setActiveCovenantIndex] = useState(0);
  const currentCovenant = DEMO_COVENANTS[activeCovenantIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl luxury-hero-dark text-white overflow-hidden shadow-paper-lg border border-forest-500/20 p-8 md:p-12"
    >
      {/* Dynamic Ambient Background Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-0 w-[550px] h-[550px] bg-amber-500/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.25, 0.4, 0.25]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/4 bottom-0 w-96 h-96 bg-forest-400/25 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline & Action Triggers */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bracket-tag text-xs text-amber-300 bg-white/10 dark:bg-white/15 px-3 py-1 rounded-full border border-white/25 shadow-xs flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>SYSTEM ACTIVE // v2.4</span>
            </span>
            <span className="text-xs font-mono text-forest-100/90 flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>CAFormer Multi-Modal AI Engine</span>
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="font-serif font-bold text-3xl sm:text-5xl text-paper-bg tracking-tight leading-[1.15]">
              A policy is a <span className="italic font-normal text-amber-300">composition</span> of facts &amp; underwriting math.
            </h1>
            <p className="text-sm md:text-base text-forest-100/90 leading-relaxed font-sans max-w-xl">
              ClearClaim validates every insurance covenant in real time. We extract 11 core attributes, audit mathematical formulas, and flag chronological discrepancies with zero hallucinations.
            </p>
          </div>

          {/* Interactive CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onVerifyClick}
              className="u-btn-glide px-6 py-3 bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2.5 hover:scale-[1.02]"
            >
              <Upload className="w-4 h-4" />
              <span>Verify Policy Document</span>
            </button>

            <button
              onClick={onMetricsClick}
              className="u-btn-glide px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/35 text-xs font-semibold rounded-xl transition-all flex items-center space-x-2 shadow-xs hover:border-amber-400/60"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Inspect ML Metrics (90.9% Test Acc)</span>
            </button>
          </div>

          {/* Live Micro-stats ticker */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-forest-100/80 font-mono">
            <div className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Avg Latency: &lt;320ms</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-400" />
              <span>100% Deterministic Math</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Supabase / In-Memory Ready</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Policy Scanning Simulator */}
        <div className="lg:col-span-5">
          <div className="bg-forest-950/80 dark:bg-[#0C1511]/90 backdrop-blur-md rounded-2xl border border-white/15 p-5 shadow-2xl space-y-4 relative overflow-hidden">
            {/* Animated Laser Radar Scan Line */}
            <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none animate-radar-scan z-20 shadow-[0_0_15px_#E8A93B]" />

            {/* Simulator Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-forest-100">
                  Live Covenant Proof Engine
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ACTIVE SCAN
              </span>
            </div>

            {/* Covenant Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
              {DEMO_COVENANTS.map((cov, idx) => (
                <button
                  key={cov.id}
                  onClick={() => setActiveCovenantIndex(idx)}
                  className={`px-2 py-1.5 rounded-lg font-mono text-[10px] transition-all text-center truncate ${
                    activeCovenantIndex === idx
                      ? 'bg-amber-500 text-charcoal-900 font-bold shadow-xs'
                      : 'text-forest-100/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cov.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Live Covenant Display Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCovenant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="bg-black/30 rounded-xl p-4 border border-white/10 space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-forest-100/70">{currentCovenant.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                    currentCovenant.valid 
                      ? 'bg-sage-900/60 text-sage-300 border border-sage-500/40' 
                      : 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                  }`}>
                    {currentCovenant.valid ? (
                      <CheckCircle2 className="w-3 h-3 text-sage-400" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                    )}
                    <span>{currentCovenant.status}</span>
                  </span>
                </div>

                <p className="text-white/95 bg-white/5 p-2.5 rounded-lg border border-white/10 text-[11px] leading-relaxed">
                  {currentCovenant.extracted}
                </p>

                <div className="flex items-center justify-between text-[10px] text-forest-100/60 pt-1">
                  <span>Anomaly Rating: <strong className="text-amber-400">{currentCovenant.score}</strong></span>
                  <span>Confidence: <strong className="text-sage-400">99.8%</strong></span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footnote */}
            <div className="flex items-center justify-between text-[10px] font-mono text-forest-100/60 pt-1">
              <span>Audited under strict underwriting rules</span>
              <span className="text-amber-300">Click tabs to test rules</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
