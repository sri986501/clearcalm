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
    { id: 'dashboard',  label: t('nav.overview', 'Overview'),        icon: LayoutDashboard },
    { id: 'verify',     label: t('nav.verify', 'Verify Document'),   icon: CheckCircle2 },
    { id: 'discovery',  label: t('nav.discovery', 'Explore Insurance'), icon: Shield },
    { id: 'policies',   label: t('nav.policies', 'My Policies'),     icon: Bookmark },
    { id: 'history',    label: t('nav.history', 'Audit Archive'),    icon: History },
    ...(isAdmin ? [{ id: 'admin' as AppViewTab, label: t('nav.admin', 'Admin Portal'), icon: UserCheck }] : []),
    ...(currentDocument ? [{ id: 'workspace' as AppViewTab, label: 'Workspace', icon: Layers }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F5F5F5]/90 backdrop-blur-md border-b border-black/10 transition-colors">
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigateHome ? onNavigateHome() : onSelectTab?.('dashboard')}
              aria-label="ClearClaim home"
              className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
            >
              <LogoIcon className="w-7 h-7 text-black group-hover:scale-105 transition-transform" />
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-medium tracking-tight text-black">
                  {t('nav.brand', 'ClearClaim')}
                </span>
                <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-black/5 text-black border border-black/10">
                  AI INSURTECH
                </span>
              </div>
            </button>

            {/* Desktop nav tabs */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 pl-4 border-l border-black/10">
              {navItems.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSelectTab?.(id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'text-white bg-black shadow-sm'
                        : 'text-black/70 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-white' : 'text-black/50'} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right toolbar */}
          <div className="flex items-center gap-2.5">

            {/* Quick verify button */}
            {activeTab !== 'verify' && (
              <button
                onClick={() => onSelectTab?.('verify')}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black hover:bg-gray-800 text-white text-xs font-medium shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 size={13} />
                <span>Verify</span>
              </button>
            )}

            <LanguageSwitcher variant="header" />

            {/* Admin / User mode toggle */}
            <button
              onClick={() => {
                setDemoUser(!isAdmin);
                onSelectTab?.(!isAdmin ? 'admin' : 'dashboard');
              }}
              title={isAdmin ? 'Switch to User View' : 'Switch to Admin View'}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAdmin
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black/70 border-black/10 hover:border-black/30'
              }`}
            >
              <UserCheck size={13} />
              <span className="hidden sm:inline">{isAdmin ? 'Admin Mode' : 'User Mode'}</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => onSelectTab?.('dashboard')}
              aria-label="Notifications"
              className="relative p-2 rounded-full text-black/60 hover:text-black hover:bg-black/5 border border-transparent hover:border-black/10 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-black animate-pulse" />
              )}
            </button>

            {/* Sign out */}
            <button
              onClick={logout}
              className="p-2 rounded-full text-black/40 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>

            {/* User chip */}
            <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-black/10">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <span className="text-xs font-medium text-black block max-w-28 truncate">
                  {user?.name || 'Insured User'}
                </span>
                <span className="text-[10px] text-black/50 capitalize block">
                  {user?.role || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <nav aria-label="Mobile navigation" className="flex lg:hidden gap-1 overflow-x-auto py-2 border-t border-black/10 no-scrollbar">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onSelectTab?.(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'text-white bg-black'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                <Icon size={13} />
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
