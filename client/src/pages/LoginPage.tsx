import React, { useState } from 'react';
import { ArrowRight, ChevronRight, ShieldCheck, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { LogoIcon } from '../components/common/LogoIcon';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

const DEMO_ACCOUNTS = [
  {
    role: 'Primary Policyholder',
    email: 'counsel@clearclaim.legal',
    desc: 'Audit policy covenants & coverage limits'
  },
  {
    role: 'Claims Underwriter',
    email: 'underwriter@falconmutual.com',
    desc: 'Review claims and contract discrepancies'
  },
  {
    role: 'Actuarial Auditor',
    email: 'actuary@audits.org',
    desc: 'Validate mathematical rate schedules'
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
      user: { id: 'guest-user-123', name: 'Verified Policyholder', email: 'guest@clearclaim.legal' },
      token: 'demo-guest-token',
      isAuthenticated: true
    });
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative flex flex-col justify-center items-center p-4 sm:p-6 font-sans selection:bg-[#0369A1] selection:text-white">
      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-12 bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Left Brand Panel */}
        <aside className="md:col-span-5 bg-[#0F2942] text-white p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <LogoIcon className="w-5 h-5 text-sky-300" />
              </div>
              <span className="font-semibold text-xl tracking-tight text-white">
                ClearCalm
              </span>
            </div>

            <div className="pt-6 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-medium">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>CLARITY WITHOUT ANXIETY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
                Understand Your Insurance Coverage
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sign in to verify policy documents, audit claim validity, detect discrepancies, and connect with trusted providers.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 hidden md:block text-xs text-slate-400">
            Encrypted session · Privacy-first document analysis
          </div>
        </aside>

        {/* Right Form Panel */}
        <main className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                Sign in to ClearCalm
              </h2>
              <p className="text-xs text-slate-500">
                Enter your credentials or choose a pre-configured demo role below.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#0369A1] focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#0369A1] focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary !py-2.5 mt-2"
              >
                <span>{isLoading ? 'Signing in…' : 'Sign in to Workspace'}</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={handleGuestAccess}
                className="w-full btn-secondary !py-2.5"
              >
                <span>Instant Demo Access</span>
              </button>
            </form>

            {/* Quick Demo Pickers */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Preset Demo Roles
              </span>
              <div className="space-y-1.5">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemo(acc.email)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block group-hover:text-[#0369A1] transition-colors">{acc.role}</span>
                      <span className="text-[11px] text-slate-500">{acc.desc}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-800" />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-xs font-semibold text-[#0369A1] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
};

export default LoginPage;
