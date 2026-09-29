import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, User } from 'lucide-react';
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
                <span>EASY POLICY MANAGEMENT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
                Clear, Reassuring Insurance Experience
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Create an account to keep your active coverage organized, audit claim validity, and eliminate paperwork anxiety.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 hidden md:block space-y-2.5">
            {[
              'Direct policy and covenant extraction',
              'Mathematical rate & chronology checks',
              'Assistance with claim filing & official portals'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
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
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                Create your account
              </h2>
              <p className="text-xs text-slate-500">
                Set up your profile to manage and audit your policies.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#0369A1] focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#0369A1] focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#0369A1] focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary !py-2.5 mt-2"
              >
                <span>{isLoading ? 'Creating account…' : 'Create ClearCalm Account'}</span>
                {!isLoading && <ArrowRight size={14} />}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={handleGuestAccess}
                className="text-[#0369A1] font-semibold hover:underline cursor-pointer"
              >
                Instant Guest Access
              </button>

              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                Already registered? Sign in
              </button>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
};

export default RegisterPage;
