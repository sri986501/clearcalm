import React from 'react';
import { ArrowRight } from 'lucide-react';
import { LogoIcon } from '../components/common/LogoIcon';

interface LandingPageProps {
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onQuickAccess?: (targetTab?: 'dashboard' | 'verify' | 'discovery' | 'marketplace') => void;
}

const HERO_PARTNERS = [
  { name: 'Meridian', style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'SENTINEL', style: { fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'Northbridge', style: { fontFamily: 'Trebuchet MS', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px', fontStyle: 'italic' as const } },
  { name: 'AEGIS', style: { fontFamily: 'Courier New, monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'Falcon Mutual', style: { fontFamily: 'Palatino, "Book Antiqua"', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' } },
  { name: 'VERITAS', style: { fontFamily: 'Impact, "Arial Narrow"', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' } },
  { name: 'Anchorpoint', style: { fontFamily: 'Verdana', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' } },
];

const TRUSTED_BY_PARTNERS = [
  { name: 'Harborstone Re', style: { fontFamily: 'Times New Roman, serif', fontWeight: 400, letterSpacing: '0.02em', fontSize: '14px' } },
  { name: 'RISKGUARD', style: { fontFamily: 'Arial Black', fontWeight: 900, letterSpacing: '0.08em', fontSize: '16px' } },
  { name: 'Certis Audit', style: { fontFamily: 'Impact', fontWeight: 700, letterSpacing: '0.05em', fontSize: '18px' } },
  { name: 'Northgate Trust', style: { fontFamily: 'Georgia', fontWeight: 600, letterSpacing: '-0.02em', fontSize: '17px' } },
  { name: 'Bluepeak Capital', style: { fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '15px' } },
  { name: 'CLAIMSHIELD', style: { fontFamily: 'Verdana', fontWeight: 700, letterSpacing: '0.06em', fontSize: '14px', textTransform: 'uppercase' as const } },
  { name: 'SAFEHOLD', style: { fontFamily: 'Courier New', fontWeight: 700, letterSpacing: '0.18em', fontSize: '14px' } },
  { name: 'Veridian Partners', style: { fontFamily: 'Palatino, "Book Antiqua"', fontWeight: 500, letterSpacing: '0.03em', fontSize: '15px' } },
];

const WORKFLOW_STEPS = [
  {
    step: '01 — Upload',
    desc: 'Ingest PDF, JPG, PNG or scanned policy documents into encrypted staging.',
  },
  {
    step: '02 — Analyze',
    desc: 'Extract policyholder, dates, sums and covenants via optical intelligence.',
  },
  {
    step: '03 — Verify',
    desc: 'Run chronology checks, arithmetic validation and trusted registry matching.',
  },
  {
    step: '04 — Protect',
    desc: 'Deliver a transparent, evidence-backed verdict you can act on.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onQuickAccess,
}) => {
  const handleVerify = () => {
    if (onQuickAccess) {
      onQuickAccess('verify');
    } else if (onNavigateRegister) {
      onNavigateRegister();
    }
  };

  const handleRegister = () => {
    if (onNavigateRegister) {
      onNavigateRegister();
    } else if (onQuickAccess) {
      onQuickAccess('dashboard');
    }
  };

  const handleMarketplace = () => {
    if (onQuickAccess) {
      onQuickAccess('marketplace');
    }
  };

  return (
    <div className="flex flex-col bg-[#F5F5F5] min-h-screen text-black selection:bg-black selection:text-white">
      {/* Scoped CSS Keyframe Marquees */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes backers-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .backers-track {
          display: flex;
          width: max-content;
          animation: backers-marquee 30s linear infinite;
        }
        .backers-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ═════════════════════════════════════════════════════════════════
          1. NAVBAR + HERO WRAPPER (h-screen flex flex-col overflow-hidden)
      ═════════════════════════════════════════════════════════════════ */}
      <div className="h-screen flex flex-col overflow-hidden relative">
        {/* Navbar (absolute, transparent over hero) */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
          <div className="max-w-[88rem] mx-auto w-full flex items-center justify-between">
            {/* Left: LogoIcon + word ClearClaim */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <LogoIcon className="w-7 h-7 text-black" />
              <span className="text-2xl font-medium tracking-tight text-black">ClearClaim</span>
            </div>

            {/* Center (hidden below md): Verify · Marketplace · Pipeline · Trust · Help */}
            <div className="hidden md:flex items-center gap-8 text-base text-gray-700 hover:text-black font-medium transition-colors duration-200">
              <button
                type="button"
                onClick={handleVerify}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium cursor-pointer"
              >
                Verify
              </button>
              <button
                type="button"
                onClick={handleMarketplace}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium cursor-pointer"
              >
                Marketplace
              </button>
              <a
                href="#pipeline"
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Pipeline
              </a>
              <a
                href="#info"
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Trust
              </a>
              <button
                type="button"
                onClick={() => onNavigateLogin?.()}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium cursor-pointer"
              >
                Help
              </button>
            </div>

            {/* Right: Black pill button "Get Started" */}
            <button
              id="nav-get-started-btn"
              type="button"
              onClick={handleRegister}
              className="bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* ═══════════════════════════════════════════════════════════════
            2. HERO SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="flex-1 px-6 pt-20 pb-6 flex items-end">
          <div
            className="relative w-full rounded-2xl overflow-hidden max-w-[88rem] mx-auto bg-neutral-900"
            style={{ height: 'calc(100vh - 96px)' }}
          >
            {/* Background video with poster and fallback */}
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="/images/hero_cinematic_scan.jpg"
              className="object-cover absolute inset-0 w-full h-full select-none pointer-events-none"
            >
              <source src="/videos/hero_scan.mp4" type="video/mp4" />
            </video>

            {/* Static high-res visual image fallback in case video is loading */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center -z-1 opacity-90 transition-opacity"
              style={{ backgroundImage: `url('/images/hero_cinematic_scan.jpg')` }}
            />

            {/* Subtle soft gradient scrim to ensure extreme legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5F5]/90 via-[#F5F5F5]/70 to-transparent pointer-events-none" />

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
              <h1
                className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4"
                style={{ letterSpacing: '-0.04em' }}
              >
                Your Claims<br />Verified
              </h1>

              <p
                className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed"
                style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
              >
                An AI verification engine that reads your insurance documents, flags inconsistencies instantly, and connects you to legitimate, registry-checked providers.
              </p>

              {/* Pill button "Verify Now" with arrow circle */}
              <button
                id="hero-verify-now-btn"
                type="button"
                onClick={handleVerify}
                className="inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              >
                <span>Verify Now</span>
                <span className="bg-white rounded-full p-2 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-black" />
                </span>
              </button>

              {/* Partner Marquee (inside hero, below button) */}
              <div className="mt-24 w-full max-w-md overflow-hidden">
                <div className="marquee-track">
                  {/* First render */}
                  {HERO_PARTNERS.map((partner, idx) => (
                    <span
                      key={`p1-${idx}`}
                      className="mx-7 shrink-0 text-black/60 whitespace-nowrap select-none"
                      style={partner.style}
                    >
                      {partner.name}
                    </span>
                  ))}
                  {/* Second render for seamless loop */}
                  {HERO_PARTNERS.map((partner, idx) => (
                    <span
                      key={`p2-${idx}`}
                      className="mx-7 shrink-0 text-black/60 whitespace-nowrap select-none"
                      style={partner.style}
                    >
                      {partner.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          3. INFO SECTION ("Meet ClearClaim.")
      ═════════════════════════════════════════════════════════════════ */}
      <section id="info" className="bg-[#F5F5F5] px-6 py-24">
        <div className="max-w-[88rem] mx-auto">
          {/* Row 1: 2-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
            {/* Left */}
            <div>
              <h2
                className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8"
                style={{ letterSpacing: '-0.03em' }}
              >
                Meet ClearClaim.
              </h2>
              {/* Black pill "See It Work" with white arrow circle */}
              <button
                id="info-see-it-work-btn"
                type="button"
                onClick={handleVerify}
                className="inline-flex items-center gap-3 bg-black text-white text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              >
                <span>See It Work</span>
                <span className="bg-white rounded-full p-2 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-black" />
                </span>
              </button>
            </div>

            {/* Right */}
            <div>
              <p className="text-black/70 text-2xl md:text-3xl leading-relaxed">
                ClearClaim is an AI verification layer that checks your insurance documents against dates, arithmetic, and trusted insurer registries — so you always know what you're actually covered by.
              </p>
            </div>
          </div>

          {/* Row 2 — 4-col card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 (spans 2 cols on lg) */}
            <div
              className="lg:col-span-2 rounded-2xl overflow-hidden relative shadow-sm"
              style={{
                backgroundImage: `url('/images/policy_doc_scan.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Soft overlay gradient for optimal contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent pointer-events-none" />

              <div className="relative z-10 p-7 min-h-80 flex flex-col justify-between h-full">
                {/* Title (top) */}
                <h3
                  className="text-black text-2xl font-medium leading-snug"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  Verification that scales
                </h3>

                {/* Body (bottom) */}
                <p className="text-black/70 text-base max-w-xs">
                  Every upload is cross-checked for chronology, math, and registry accreditation before you ever act on it.
                </p>
              </div>
            </div>

            {/* Card 2: solid #2B2644 */}
            <div className="bg-[#2B2644] rounded-2xl p-7 min-h-80 flex flex-col justify-between shadow-sm">
              <h3
                className="text-2xl font-medium text-white leading-snug"
                style={{ letterSpacing: '-0.02em' }}
              >
                Always clear,<br />always covered.
              </h3>
              <p className="text-white/60 text-base leading-relaxed">
                Stay anchored to accurate policy data with instant, on-demand access — no waiting on paperwork or callbacks.
              </p>
            </div>

            {/* Card 3: solid #2B2644 */}
            <div className="bg-[#2B2644] rounded-2xl p-7 min-h-80 flex flex-col justify-between shadow-sm">
              <h3
                className="text-2xl font-medium text-white leading-snug"
                style={{ letterSpacing: '-0.02em' }}
              >
                Fully<br />automated
              </h3>
              <p className="text-white/60 text-base leading-relaxed">
                Skip manual review. ClearClaim's pipeline runs OCR, anomaly detection and registry checks in the background for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          4. TRUSTED BY SECTION (marquee row)
      ═════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F5F5] px-6 py-8">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
          {/* Left col (1/4) */}
          <div className="text-black/70 text-base leading-relaxed">
            Trusted by insurers,<br />auditors, and risk teams.
          </div>

          {/* Right col (3/4): infinite marquee */}
          <div className="md:col-span-3 overflow-hidden">
            <div className="backers-track">
              {/* First render */}
              {TRUSTED_BY_PARTNERS.map((partner, idx) => (
                <span
                  key={`tb1-${idx}`}
                  className="mx-10 shrink-0 text-black/50 whitespace-nowrap select-none"
                  style={partner.style}
                >
                  {partner.name}
                </span>
              ))}
              {/* Second render for seamless loop */}
              {TRUSTED_BY_PARTNERS.map((partner, idx) => (
                <span
                  key={`tb2-${idx}`}
                  className="mx-10 shrink-0 text-black/50 whitespace-nowrap select-none"
                  style={partner.style}
                >
                  {partner.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          5. USE CASES SECTION
      ═════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F5F5] px-6 py-24">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left column */}
          <div className="md:pr-12 md:pt-2">
            <p className="text-black/60 text-sm mb-2 font-medium">ClearClaim in Practice</p>
            <h2
              className="text-5xl md:text-6xl font-medium leading-none mb-6"
              style={{ letterSpacing: '-0.04em' }}
            >
              Use modes
            </h2>
            <p className="text-black/60 text-base leading-relaxed max-w-sm">
              ClearClaim powers document verification, provider discovery, and coverage understanding for individuals, brokers, and risk teams who need answers they can trust.
            </p>
          </div>

          {/* Right column */}
          <div className="relative rounded-3xl overflow-hidden min-h-[720px] bg-neutral-900 shadow-md">
            {/* Background video */}
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="/images/usecase_claims_review.jpg"
              className="object-cover absolute inset-0 w-full h-full select-none pointer-events-none"
            >
              <source src="/videos/claims_review.mp4" type="video/mp4" />
            </video>

            {/* High-res static fallback */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center -z-1 opacity-90"
              style={{ backgroundImage: `url('/images/usecase_claims_review.jpg')` }}
            />

            {/* Gradient scrim for clear text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* Overlay content */}
            <div className="relative z-10 p-10 md:p-12 flex flex-col justify-end min-h-[720px]">
              <h3
                className="text-4xl md:text-5xl font-medium leading-tight mb-5 text-white"
                style={{ letterSpacing: '-0.03em' }}
              >
                Claims Review
              </h3>

              <p className="text-white/80 text-base max-w-md mb-8 leading-relaxed">
                Cut manual review time by letting ClearClaim flag inconsistent dates, broken arithmetic, and unaccredited insurers before a claim ever reaches a human reviewer.
              </p>

              {/* Inline-flex link "Learn more" with leading circular icon */}
              <button
                type="button"
                onClick={handleVerify}
                className="group inline-flex items-center gap-3 text-white text-base font-medium cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-white transition-colors duration-200">
                  <ArrowRight className="w-4 h-4 text-black" />
                </span>
                <span className="underline-offset-4 group-hover:underline">Learn more</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          6. BONUS SECTION — VERIFICATION WORKFLOW
      ═════════════════════════════════════════════════════════════════ */}
      <section id="pipeline" className="bg-[#F5F5F5] px-6 py-24">
        <div className="max-w-[88rem] mx-auto">
          {/* Eyebrow & Headline */}
          <p className="text-black/60 text-sm mb-2 font-medium">How It Works</p>
          <h2
            className="text-4xl md:text-5xl font-medium leading-tight mb-12"
            style={{ letterSpacing: '-0.03em' }}
          >
            Four-stage pipeline
          </h2>

          {/* 4-col card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {WORKFLOW_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#2B2644] p-7 min-h-64 flex flex-col justify-between text-white hover:scale-[1.02] transition-transform duration-200 shadow-sm"
              >
                <h3
                  className="text-xl font-medium leading-snug"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {step.step}
                </h3>
                <p className="text-white/60 text-base leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Centered black pill button "Start Verifying" */}
          <div className="flex justify-center">
            <button
              id="workflow-start-verifying-btn"
              type="button"
              onClick={handleVerify}
              className="inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
            >
              <span>Start Verifying</span>
              <span className="bg-white rounded-full p-2 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-black" />
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
