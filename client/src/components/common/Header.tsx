import React from 'react';
import {
  LogOut, LayoutDashboard, CheckCircle2,
  History, Layers, Shield, Bell, UserCheck, Bookmark
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDocStore } from '../../store/useDocStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from './LogoIcon';

export type AppViewTab = 'dashboard' | 'verify' | 'discovery' | 'marketplace' | 'policies' | 'history' | 'analytics' | 'admin' | 'workspace';

interface HeaderProps {
  activeTab?: AppViewTab;
  onSelectTab?: (tab: AppViewTab) => void;
  onOpenUpload?: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab = 'dashboard', onSelectTab, onNavigateHome }) => {
  const { t } = useTranslation();
  const { user, logout, setDemoUser } = useAuthStore();
  const { currentDocument } = useDocStore();
  const { unreadCount } = useNotificationStore();

  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');

  const navItems: { id: AppViewTab; label: string; icon: any }[] = [
    { id: 'dashboard',  label: t('nav.overview', 'Overview'),           icon: LayoutDashboard },
    { id: 'policies',   label: t('nav.policies', 'My Policies'),        icon: Bookmark },
    { id: 'verify',     label: t('nav.verify', 'Verify Document'),      icon: CheckCircle2 },
    { id: 'discovery',  label: t('nav.discovery', 'Explore Insurance'), icon: Shield },
    { id: 'history',    label: t('nav.history', 'Audit Archive'),       icon: History },
    ...(isAdmin ? [{ id: 'admin' as AppViewTab, label: t('nav.admin', 'Admin Portal'), icon: UserCheck }] : []),
    ...(currentDocument ? [{ id: 'workspace' as AppViewTab, label: 'Active Document', icon: Layers }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-colors">
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigateHome ? onNavigateHome() : onSelectTab?.('dashboard')}
              aria-label="ClearCalm home"
              className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-[#0369A1] focus:ring-offset-2 rounded-xl p-1 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0369A1] flex items-center justify-center border border-sky-100 group-hover:bg-sky-100 transition-colors">
                <LogoIcon className="w-5 h-5 text-[#0369A1]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold tracking-tight text-[#0F172A]">
                  ClearCalm
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  INSURANCE CLARITY
                </span>
              </div>
            </button>

            {/* Desktop navigation tabs */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 pl-4 border-l border-slate-200">
              {navItems.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSelectTab?.(id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0369A1] ${
                      isActive
                        ? 'text-white bg-[#0F2942] font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Quick verify CTA */}
            {activeTab !== 'verify' && (
              <button
                onClick={() => onSelectTab?.('verify')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0369A1] border border-sky-200 text-xs font-semibold shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0369A1]"
              >
                <CheckCircle2 size={13} />
                <span>Verify Doc</span>
              </button>
            )}

            <LanguageSwitcher variant="header" />

            {/* Role switch toggle */}
            <button
              onClick={() => {
                setDemoUser(!isAdmin);
                onSelectTab?.(!isAdmin ? 'admin' : 'dashboard');
              }}
              title={isAdmin ? 'Switch to User View' : 'Switch to Admin View'}
              className={`text-xs font-medium px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0369A1] ${
                isAdmin
                  ? 'bg-[#0F2942] text-white border-[#0F2942]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <UserCheck size={13} />
              <span className="hidden sm:inline">{isAdmin ? 'Admin View' : 'User View'}</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => onSelectTab?.('dashboard')}
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0369A1]"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0369A1] ring-2 ring-white" />
              )}
            </button>

            {/* Sign out */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/60 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>

            {/* User chip */}
            <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-semibold border border-slate-200">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-[#0F172A] block max-w-28 truncate">
                  {user?.name || 'Policyholder'}
                </span>
                <span className="text-[10px] text-slate-500 capitalize block">
                  {user?.role || 'Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navigation bar - touch target friendly */}
        <nav aria-label="Mobile navigation" className="flex lg:hidden gap-1.5 overflow-x-auto py-2.5 border-t border-slate-100 no-scrollbar">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onSelectTab?.(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap min-h-[40px] cursor-pointer transition-all ${
                  isActive
                    ? 'text-white bg-[#0F2942] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
