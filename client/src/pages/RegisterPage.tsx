import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Terminal } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { LogoIcon } from '../components/common/LogoIcon';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin, onSuccess }) => {
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg(null);
    try {
      await register(name, email, password);
      onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to create your account. Please try again.');
    }
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
                <span>AUDITOR ONBOARDING</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
                Zero-Trust Contract Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Create your auditor credentials to unlock high-resolution OCR parsing, automated policy discrepancy discovery, and cryptographic audit export.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 hidden md:block space-y-2.5">
            {[
              'Instant PDF parsing & OCR extraction',
              'Automated mathematical rate verification',
              'Cryptographic SHA-256 tamper logs'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-white/80">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Form Panel */}
        <main className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">
                Create auditor account
              </h2>
              <p className="text-xs text-black/60">
                Set up your profile to manage policy audits and verification runs.
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
                <label className="text-xs font-medium text-black/80">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alexandra Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-black/[0.02] text-black text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-black/80">Work email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexandra@firm.legal"
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
                <span>{isLoading ? 'Creating profile…' : 'Generate Auditor Access'}</span>
                {!isLoading && <ArrowRight size={14} />}
              </button>
            </form>

            {/* Quick Guest Bypass & Sign In Navigation */}
            <div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs text-black/60">
              <button
                type="button"
                onClick={handleGuestAccess}
                className="text-black font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Terminal size={13} />
                <span>Instant Guest Access</span>
              </button>

              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-black/70 hover:text-black hover:underline cursor-pointer"
              >
                Already have an account? Sign In
              </button>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
};
