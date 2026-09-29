import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useDocStore } from './store/useDocStore';
import { useSettingsStore, applyThemeClass } from './store/useSettingsStore';
import { LandingPage } from './pages/LandingPage';
import { AppViewTab } from './components/common/Header';

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const VerifyPage = lazy(() => import('./pages/VerifyPage').then(m => ({ default: m.VerifyPage })));
const InsuranceDiscoveryPage = lazy(() => import('./pages/InsuranceDiscoveryPage').then(m => ({ default: m.InsuranceDiscoveryPage })));
const MyPoliciesPage = lazy(() => import('./pages/MyPoliciesPage').then(m => ({ default: m.MyPoliciesPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const DocumentView = lazy(() => import('./pages/DocumentView').then(m => ({ default: m.DocumentView })));
const SettingsModal = lazy(() => import('./components/common/SettingsModal').then(m => ({ default: m.SettingsModal })));

import { FloatingRobotWidget } from './components/robot/FloatingRobotWidget';

function PageFallback() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-muted)] font-medium">Loading…</p>
      </div>
    </div>
  );
}

export function App() {
  const { isAuthenticated, checkAuth, setDemoUser } = useAuthStore();
  const { currentDocument } = useDocStore();
  const { theme } = useSettingsStore();

  const [publicView, setPublicView] = useState<'landing' | 'login' | 'register'>('landing');
  const [activeTab, setActiveTab] = useState<AppViewTab>('dashboard');

  useEffect(() => {
    checkAuth();
    // Single-theme: always light. Clear any persisted dark preference.
    try {
      const stored = localStorage.getItem('clearclaim-app-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.theme === 'dark') {
          parsed.state.theme = 'light';
          localStorage.setItem('clearclaim-app-settings', JSON.stringify(parsed));
        }
      }
    } catch (_) {}
    document.documentElement.classList.remove('dark');
    applyThemeClass('light');
  }, [checkAuth]);



  const renderContent = () => {
    if (!isAuthenticated) {
      if (publicView === 'landing') {
        return (
          <LandingPage
            onNavigateLogin={() => setPublicView('login')}
            onNavigateRegister={() => setPublicView('register')}
            onQuickAccess={(targetTab = 'dashboard') => {
              setDemoUser();
              setActiveTab(targetTab as AppViewTab);
            }}
          />
        );
      }

      if (publicView === 'login') {
        return (
          <Suspense fallback={<PageFallback />}>
            <LoginPage
              onSwitchToRegister={() => setPublicView('register')}
              onSuccess={() => setActiveTab('dashboard')}
            />
          </Suspense>
        );
      }

      if (publicView === 'register') {
        return (
          <Suspense fallback={<PageFallback />}>
            <RegisterPage
              onSwitchToLogin={() => setPublicView('login')}
              onSuccess={() => setActiveTab('dashboard')}
            />
          </Suspense>
        );
      }
    }

    if (activeTab === 'workspace' && currentDocument) {
      return (
        <Suspense fallback={<PageFallback />}>
          <DocumentView
            onNavigateHome={() => setActiveTab('dashboard')}
            onSelectTab={setActiveTab}
          />
        </Suspense>
      );
    }

    if (activeTab === 'verify') {
      return (
        <Suspense fallback={<PageFallback />}>
          <VerifyPage
            onNavigateHome={() => setActiveTab('dashboard')}
            onSelectTab={setActiveTab}
          />
        </Suspense>
      );
    }

    if (activeTab === 'discovery' || activeTab === 'marketplace') {
      return (
        <Suspense fallback={<PageFallback />}>
          <InsuranceDiscoveryPage />
        </Suspense>
      );
    }

    if (activeTab === 'policies') {
      return (
        <Suspense fallback={<PageFallback />}>
          <MyPoliciesPage onSelectTab={setActiveTab} />
        </Suspense>
      );
    }

    if (activeTab === 'admin') {
      return (
        <Suspense fallback={<PageFallback />}>
          <AdminPage onSelectTab={setActiveTab} />
        </Suspense>
      );
    }

    if (activeTab === 'history') {
      return (
        <Suspense fallback={<PageFallback />}>
          <HistoryPage onSelectTab={setActiveTab} />
        </Suspense>
      );
    }

    if (activeTab === 'analytics') {
      return (
        <Suspense fallback={<PageFallback />}>
          <AnalyticsPage onSelectTab={setActiveTab} />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<PageFallback />}>
        <Dashboard
          onSelectTab={setActiveTab}
          onSelectDocument={() => setActiveTab('workspace')}
        />
      </Suspense>
    );
  };

  return (
    <>
      {renderContent()}
      <FloatingRobotWidget
        onNavigate={(tab) => {
          if (!isAuthenticated) setDemoUser();
          setActiveTab(tab as AppViewTab);
        }}
      />
      <Suspense fallback={null}>
        <SettingsModal />
      </Suspense>
    </>
  );
}

export default App;

