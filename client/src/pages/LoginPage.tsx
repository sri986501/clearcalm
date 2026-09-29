import React, { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { LogoIcon } from '../components/common/LogoIcon';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

const DEMO_ACCOUNTS = [
  {
    role: 'Legal Counsel',
    email: 'counsel@clearclaim.legal',
    desc: 'Audit policy covenants & source evidence'
  },
  {
    role: 'Chief Underwriter',
    email: 'underwriter@falconmutual.com',
    desc: 'Review high-risk policies & ML flags'
  },
  {
    role: 'Actuarial Auditor',
    email: 'actuary@audits.org',
    desc: 'Validate mathematical rate tables'
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('counsel@clearclaim.legal');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg(null);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to sign in. Please verify your credentials.');
    }
  };

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMsg(null);
  };

  const handleGuestAccess = () => {
    if (isLoading) return;
    useAuthStore.setState({
      user: { id: 'guest-user-123', name: 'Guest Auditor', email: 'guest@clearclaim.legal' },
      token: 'demo-guest-token',
      isAuthenticated: true
    });
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black relative flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* Professional Watermark Background */}
      <div 
        className="fixed inset-0 pointer-events-none bg-[url('/images/portal_bg.jpg')] bg-cover bg-center opacity-[0.07] z-0" 
        aria-hidden="true" 
      />

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-12 bg-white border border-black/10 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Left Brand Panel */}
        <aside className="md:col-span-5 bg-[#2B2644] text-white p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <LogoIcon className="w-8 h-8 text-white" />
              <span className="font-semibold text-lg tracking-tight text-white">
                ClearClaim
              </span>
            </div>

            <div className="pt-6 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>FINTECH VERIFICATION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
                Policy Intelligence &amp; Document Audit
              </h1>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Sign in to review verified insurance contracts, resolve calculation discrepancies, and generate compliance audit transcripts.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 hidden md:block text-xs text-white/50">
            Enterprise grade · Cryptographic SHA-256 verification
          </div>
        </aside>

        {/* Right Form Panel */}
        <main className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">
                Sign in to workspace
              </h2>
              <p className="text-xs text-black/60">
                Enter your credentials or pick a demo role below.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-black/80">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="auditor@clearclaim.legal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-black/[0.02] text-black text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-black/80">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-black/[0.02] text-black text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white hover:bg-gray-800 transition-colors py-3 px-5 rounded-full text-xs font-medium tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Signing in…' : 'Sign in to workspace'}</span>
                {!isLoading && <ArrowRight size={14} />}
              </button>
            </form>

            {/* Demo Profiles */}
            <div className="pt-4 border-t border-black/10 space-y-2">
              <span className="text-xs font-medium text-black/70 block">
                Quick preset roles (demo)
              </span>

              <div className="space-y-1.5">
                {DEMO_ACCOUNTS.map((demo) => {
                  const isSelected = email === demo.email;
                  return (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => handleSelectDemo(demo.email)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-black/[0.04] border-black text-black' 
                          : 'bg-white border-black/10 hover:border-black/30 text-black/80'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-semibold text-black block">{demo.role}</span>
                        <span className="text-[11px] text-black/50">{demo.desc}</span>
                      </div>
                      <ChevronRight size={14} className={isSelected ? 'text-black' : 'text-black/30'} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Guest Access & Register Navigation */}
            <div className="pt-2 flex items-center justify-between text-xs text-black/60">
              <button
                type="button"
                onClick={handleGuestAccess}
                className="text-black font-semibold hover:underline cursor-pointer"
              >
                Explore as guest
              </button>

              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-black/70 hover:text-black hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
};
