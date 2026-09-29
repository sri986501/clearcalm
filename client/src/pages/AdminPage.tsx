import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, FileText, CheckCircle2, Lock, 
  ExternalLink, Clock, UserCheck, RefreshCw, Eye, ArrowRight, Shield 
} from 'lucide-react';
import { Header, AppViewTab } from '../components/common/Header';
import { VerificationReportModal } from '../components/common/VerificationReportModal';
import { useVerifyStore } from '../store/useVerifyStore';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import api from '../lib/axios';

interface AdminPageProps {
  onSelectTab?: (tab: AppViewTab) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onSelectTab }) => {
  const { openReportModal, closeReportModal, isReportModalOpen, selectedReportDoc } = useVerifyStore();

  const [activeAdminTab, setActiveAdminTab] = useState<'verifications' | 'policies' | 'audit'>('verifications');
  const [stats, setStats] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/admin/stats').then(r => r.data.stats).catch(() => null),
      api.get('/admin/verifications').then(r => r.data.verifications).catch(() => []),
      api.get('/admin/policies').then(r => r.data.policies).catch(() => []),
      api.get('/admin/audit-logs').then(r => r.data.logs).catch(() => [])
    ]).then(([s, v, p, a]) => {
      if (active) {
        setStats(s);
        setVerifications(v || []);
        setPolicies(p || []);
        setAuditLogs(a || []);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative flex flex-col font-sans transition-colors selection:bg-[#0369A1] selection:text-white">
      <Header activeTab="admin" onSelectTab={onSelectTab} />

      <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Header Bar */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <SectionHeader
            contextBadge="COMPLIANCE &amp; UNDERWRITING AUDIT"
            title="Platform Integrity &amp; Audit Oversight"
            subtitle="Review document anomalies, monitor issued policies, and inspect audit logs."
            action={
              <button
                onClick={() => onSelectTab?.('dashboard')}
                className="btn-secondary !text-xs"
              >
                Return to Policyholder View
              </button>
            }
          />
        </div>

        {/* Global KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Audits</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {stats?.totalVerifications || 0}
            </div>
            <p className="text-xs text-emerald-700 font-medium">
              {stats?.consistentCount || 0} Consistent
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Discrepancies</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-700">
              {stats?.suspiciousCount || 0}
            </div>
            <p className="text-xs text-amber-700 font-medium">
              Requires Review
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Issued Policies</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {stats?.totalPolicies || 0}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Bound Digitally
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Collected Premium</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Server-Verified Volume
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          <button
            onClick={() => setActiveAdminTab('verifications')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'verifications'
                ? 'bg-[#0F2942] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Verification Requests Queue ({verifications.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('policies')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'policies'
                ? 'bg-[#0F2942] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Issued Policy Ledger ({policies.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'audit'
                ? 'bg-[#0F2942] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Audit Log Ledger ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Verification Queue */}
        {activeAdminTab === 'verifications' && (
          <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
            {verifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No verification requests queued.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="hidden md:grid grid-cols-12 gap-3 p-4 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <div className="col-span-4">Document / File</div>
                  <div className="col-span-3">Carrier / Policy #</div>
                  <div className="col-span-3">Status &amp; Risk</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {verifications.map((v) => (
                  <div key={v.verificationId} className="p-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-slate-50/50 transition-colors text-xs">
                    <div className="col-span-4 space-y-0.5">
                      <span className="font-semibold text-slate-900 block truncate">{v.filename}</span>
                      <span className="text-[11px] text-slate-500">{new Date(v.verifiedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="col-span-3 space-y-0.5">
                      <span className="font-medium text-slate-800 block truncate">{v.extractedFields?.insurer?.value || 'Insurer'}</span>
                      <span className="font-mono text-slate-500 block truncate">{v.extractedFields?.policy_number?.value || '—'}</span>
                    </div>

                    <div className="col-span-3 space-y-1">
                      <StatusIndicator status={v.status} size="sm" />
                      <span className="text-[10px] text-slate-400 block font-mono">Anomaly: {Math.round(v.anomalyScore * 100)}%</span>
                    </div>

                    <div className="col-span-2 flex items-center justify-end w-full md:w-auto">
                      <button
                        onClick={() => openReportModal(v)}
                        className="btn-secondary !text-xs !py-1.5 !px-3"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Issued Policies */}
        {activeAdminTab === 'policies' && (
          <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
            {policies.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No issued policies found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="hidden md:grid grid-cols-12 gap-3 p-4 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <div className="col-span-4">Plan &amp; Holder</div>
                  <div className="col-span-3">Carrier / Policy ID</div>
                  <div className="col-span-3">Coverage &amp; Premium</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                {policies.map((p) => (
                  <div key={p.id} className="p-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-slate-50/50 transition-colors text-xs">
                    <div className="col-span-4 space-y-0.5">
                      <span className="font-semibold text-slate-900 block truncate">{p.planName}</span>
                      <span className="text-[11px] text-slate-500">{p.policyHolderName}</span>
                    </div>

                    <div className="col-span-3 space-y-0.5">
                      <span className="font-medium text-slate-800 block truncate">{p.providerName}</span>
                      <span className="font-mono text-slate-500 block truncate">{p.policyNumber}</span>
                    </div>

                    <div className="col-span-3 space-y-0.5">
                      <span className="font-semibold text-slate-900 block">{formatCurrency(p.coverageAmount)}</span>
                      <span className="text-[11px] text-slate-500 block">{formatCurrency(p.annualPremium)} / yr</span>
                    </div>

                    <div className="col-span-2 flex justify-end w-full md:w-auto">
                      <StatusIndicator status={p.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Audit Logs */}
        {activeAdminTab === 'audit' && (
          <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No audit log entries recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto">
                {auditLogs.map((log, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between gap-3 text-xs font-mono hover:bg-slate-50/50">
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800">{log.action || 'AUDIT_EVENT'}</span>
                      <p className="text-[11px] text-slate-500 truncate">{log.details || log.message || 'System verification audit recorded'}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Verification Report Modal */}
      {isReportModalOpen && selectedReportDoc && (
        <VerificationReportModal
          isOpen={isReportModalOpen}
          onClose={closeReportModal}
          doc={selectedReportDoc}
        />
      )}
    </div>
  );
};

export default AdminPage;
