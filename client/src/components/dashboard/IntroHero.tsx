import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Upload, 
  BarChart3, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  Layers, 
  FileCheck2, 
  Eye, 
  ChevronRight,
  ArrowRight,
  Calculator,
  Lock
} from 'lucide-react';

interface IntroHeroProps {
  onGetStarted: () => void;
  onExploreMetrics: () => void;
  onSelectSamplePolicy?: (sampleName: string) => void;
}

const FEATURE_STEPS = [
  {
    id: 'vision',
    step: '01',
    badge: 'MULTI-MODAL VISION',
    title: 'Visual AI Document Parsing',
    description: 'CAFormer-B36 vision transformer parses complex multi-column insurance layouts, rate tables, signatures, and scanned stamps without lossy compression.',
    icon: Cpu,
    color: 'amber',
    stats: '90.9% Test Accuracy',
    sampleOutput: {
      type: 'EXTRACTED ENTITIES',
      items: [
        { label: 'Policyholder', val: 'Apex Global Logistics LLC' },
        { label: 'Policy Number', val: 'POL-2026-0891-COMM' },
        { label: 'Carrier', val: 'Falcon Mutual Syndicate' }
      ]
    }
  },
  {
    id: 'math',
    step: '02',
    badge: 'ACTUARIAL PROOF',
    title: '100% Deterministic Math Verification',
    description: 'Validates premium rate matrices, deductible arithmetic, endorsements, and retroactive inception chronology with mathematical certainty and zero hallucinations.',
    icon: Calculator,
    color: 'sage',
    stats: '100% Deterministic',
    sampleOutput: {
      type: 'UNDERWRITING AUDIT',
      items: [
        { label: 'Base Rate ($1,250) + Surcharge ($320)', val: '✓ $1,570 Passed' },
        { label: 'Chronology Inception vs Signature', val: '✓ Valid (2026-01-01)' },
        { label: 'Aggregate Limit vs Occurrence Limit', val: '✓ $2M / $1M Compliant' }
      ]
    }
  },
  {
    id: 'evidence',
    step: '03',
    badge: 'VERIFIABLE STUDIO',
    title: 'Synchronized Evidence & AI Q&A',
    description: 'Audit policies in a split-screen workspace with click-to-highlight source citations. Ask legal and coverage questions with zero hallucinations.',
    icon: Layers,
    color: 'forest',
    stats: '<320ms Engine Latency',
    sampleOutput: {
      type: 'VERIFIED CITATION',
      items: [
        { label: 'Citation Source', val: 'Section 4.2, Page 2, Line 14' },
        { label: 'Policy Covenant', val: '"Excludes punitive damages outside USA"' },
        { label: 'Legal Audit Status', val: '✓ Source-Grounded & Highlighted' }
      ]
    }
  }
];

export const IntroHero: React.FC<IntroHeroProps> = ({
  onGetStarted,
  onExploreMetrics,
  onSelectSamplePolicy
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = FEATURE_STEPS[activeStepIndex];

  return (
    <div className="relative rounded-3xl luxury-hero-dark text-white overflow-hidden shadow-paper-lg border border-forest-500/20 p-8 md:p-12 space-y-10">
      {/* Ambient Moving Aurora Backdrops */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.25, 0.45, 0.25]
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/4 -bottom-20 w-[500px] h-[500px] bg-forest-400/25 rounded-full blur-3xl pointer-events-none"
      />

      {/* Top Intro Section */}
      <div className="relative z-10 max-w-4xl space-y-6">
        {/* System Pill Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="bracket-tag text-xs text-amber-300 bg-white/10 dark:bg-white/15 px-3 py-1 rounded-full border border-white/25 shadow-xs flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>CLEARCLAIM PLATFORM INTRO</span>
          </span>
          <span className="text-xs font-mono text-forest-100/90 flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>AI-Powered Verifiable Document Intelligence</span>
          </span>
        </div>

        {/* Big Hero Title & Paragraph */}
        <div className="space-y-4">
          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-paper-bg tracking-tight leading-[1.12]">
            Never guess an insurance covenant. <br className="hidden sm:inline" />
            <span className="italic font-normal text-amber-300">Audit, verify &amp; prove</span> every word.
          </h1>
          <p className="text-base sm:text-lg text-forest-100/90 leading-relaxed font-sans max-w-3xl">
            ClearClaim combines multi-modal visual transformers with deterministic underwriting mathematics. Automatically ingest policy contracts, audit premium rate equations, detect chronological anomalies, and inspect source-grounded citations in real time.
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            onClick={onGetStarted}
            className="u-btn-glide px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center space-x-2.5 hover:scale-[1.02]"
          >
            <Upload className="w-4 h-4" />
            <span>Verify Policy Document Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreMetrics}
            className="u-btn-glide px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white border border-white/35 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center space-x-2 shadow-sm hover:border-amber-400/60"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Explore ML Telemetry</span>
          </button>
        </div>
      </div>

      {/* Interactive 3-Step Live Tour Component */}
      <div className="relative z-10 pt-4 border-t border-white/15 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-wider text-amber-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>How ClearClaim Works — Interactive Technology Tour</span>
            </h2>
            <p className="text-xs text-forest-100/70 mt-0.5">Click through the pipeline steps to see real-time extraction, math verification, and grounded citations in action.</p>
          </div>
          <span className="text-xs font-mono text-warmgray bg-black/40 px-3 py-1 rounded-lg border border-white/10 self-start sm:self-auto">
            Interactive Architecture
          </span>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FEATURE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStepIndex === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'bg-forest-950/90 dark:bg-[#0E1B15] border-amber-400/70 shadow-lg ring-1 ring-amber-400/40'
                    : 'bg-white/5 hover:bg-white/10 border-white/15 text-forest-100/80 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-amber-400 text-charcoal-900' : 'bg-white/10 text-forest-100/70'
                  }`}>
                    STEP {step.step}
                  </span>
                  <span className="text-[10px] font-mono text-forest-100/60">{step.stats}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-amber-500 text-charcoal-900 shadow-md' : 'bg-white/10 text-amber-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-snug">{step.title}</h3>
                    <p className="text-[11px] font-mono text-amber-300/90">{step.badge}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Interactive Showcase Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="bg-black/40 dark:bg-[#07100D]/80 backdrop-blur-md rounded-2xl border border-white/15 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            {/* Step Description */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-mono text-xs text-amber-300 font-semibold">{activeStep.badge}</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">{activeStep.title}</h3>
              <p className="text-xs sm:text-sm text-forest-100/85 leading-relaxed font-sans">{activeStep.description}</p>
            </div>

            {/* Live Simulated Output Data Box */}
            <div className="lg:col-span-6 bg-black/50 dark:bg-[#0D1813] rounded-xl border border-white/15 p-4 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[10px] text-forest-100/60 uppercase tracking-wider">{activeStep.sampleOutput.type}</span>
                <span className="text-[10px] text-sage-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-sage-400" />
                  <span>VERIFIED LIVE</span>
                </span>
              </div>

              <div className="space-y-2">
                {activeStep.sampleOutput.items.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 gap-1">
                    <span className="text-forest-100/70 text-[11px]">{item.label}</span>
                    <span className="text-white font-semibold text-[11px] truncate">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Trust & Engineering Metric Badges */}
      <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-lg sm:text-xl font-serif font-bold text-amber-300">&lt; 320 ms</p>
          <p className="text-[10px] text-forest-100/70 mt-0.5">End-to-End OCR &amp; Math</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-lg sm:text-xl font-serif font-bold text-sage-300">100%</p>
          <p className="text-[10px] text-forest-100/70 mt-0.5">Deterministic Validation</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-lg sm:text-xl font-serif font-bold text-amber-300">90.9%</p>
          <p className="text-[10px] text-forest-100/70 mt-0.5">Multi-Modal AI Accuracy</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-lg sm:text-xl font-serif font-bold text-sage-300">Zero</p>
          <p className="text-[10px] text-forest-100/70 mt-0.5">LLM Hallucinations</p>
        </div>
      </div>
    </div>
  );
};
