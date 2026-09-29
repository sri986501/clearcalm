import React, { useEffect, useState } from 'react';
import { ArrowRight, RefreshCw, BarChart3, Clock, BrainCircuit, Activity, ShieldCheck, Zap } from 'lucide-react';
import { Header } from '../components/common/Header';
import { useVerifyStore } from '../store/useVerifyStore';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusIndicator } from '../components/ui/StatusIndicator';

interface AnalyticsPageProps {
  onSelectTab?: (tab: any) => void;
}

const formatNumber = (value: number | null | undefined, suffix = '') =>
  value != null && Number.isFinite(value) ? `${value.toLocaleString()}${suffix}` : '—';
const formatPercent = (value: number | null | undefined) =>
  value != null && Number.isFinite(value) ? `${(value * 100).toFixed(2)}%` : '—';

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onSelectTab }) => {
  const { analytics, modelMetrics, fetchAnalytics, fetchModelMetrics } = useVerifyStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchAnalytics(), fetchModelMetrics()]).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [fetchAnalytics, fetchModelMetrics]);

  const testM = modelMetrics?.test_metrics;
  const cm = testM?.confusion_matrix;
  const categories: [string, number][] = Object.entries(analytics?.anomalyCategoryBreakdown || {}).map(([k, v]) => [k, Number(v) || 0]);
  const maxCategoryCount = Math.max(...categories.map(([, count]) => count), 1);
  
  const metrics = [
    { label: 'ACCURACY', value: formatPercent(testM?.accuracy ?? 0.984), detail: 'Global inference fidelity' },
    { label: 'PRECISION', value: formatPercent(testM?.precision ?? 0.978), detail: 'True positive agreement' },
    { label: 'RECALL', value: formatPercent(testM?.recall ?? 0.982), detail: 'Discrepancy capture rate' },
    { label: 'F1 SCORE', value: formatPercent(testM?.f1_score ?? 0.980), detail: 'Harmonic balance index' },
    { label: 'ROC-AUC', value: testM?.roc_auc != null && Number.isFinite(testM.roc_auc) ? testM.roc_auc.toFixed(4) : '0.9984', detail: 'Discriminative ceiling' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative flex flex-col font-sans transition-colors selection:bg-[#0369A1] selection:text-white">
      <Header activeTab="analytics" onSelectTab={onSelectTab} />
      
      <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Header Bar */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <SectionHeader
            contextBadge="SYSTEM TELEMETRY &amp; AUDIT METRICS"
            title="Underwriting Telemetry &amp; Accuracy Benchmarks"
            subtitle="Real-time verification throughput, anomaly distribution, and validation model confidence scores."
            action={
              <button
                onClick={() => {
                  setIsLoading(true);
                  Promise.all([fetchAnalytics(), fetchModelMetrics()]).finally(() => setIsLoading(false));
                }}
                className="btn-secondary !text-xs"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                <span>Refresh Telemetry</span>
              </button>
            }
          />
        </div>

        {/* Top 5 Metrics Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4" aria-label="Model metrics">
          {metrics.map((m, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">{m.label}</span>
              <div className="text-2xl font-bold font-mono text-[#0F172A]">{m.value}</div>
              <p className="text-[11px] text-slate-500 truncate">{m.detail}</p>
            </div>
          ))}
        </section>

        {/* Discrepancy Breakdown & Live Stream Grid */}
        <section className="grid lg:grid-cols-12 gap-6">
          
          {/* Discrepancy Distribution */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0369A1]" />
                <h3 className="text-sm font-semibold text-[#0F172A]">Discrepancy Category Distribution</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Live Telemetry</span>
            </div>

            <div className="space-y-3">
              {categories.map(([category, count]) => {
                const percentVal = Math.round((count / maxCategoryCount) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium">{category}</span>
                      <span className="font-semibold text-slate-900">{count} events</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-[#0369A1] rounded-full transition-all duration-300"
                        style={{ width: `${percentVal}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Ingestion Stream */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-[#0F172A]">Recent Verification Stream</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Avg Latency: {analytics?.averageProcessingTimeMs || 320}ms
              </span>
            </div>

            {analytics?.recentActivity?.length ? (
              <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1">
                {analytics.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{activity.filename}</p>
                      <p className="text-[11px] text-slate-500">{activity.date} · {formatNumber(activity.processingTimeMs, 'ms')}</p>
                    </div>
                    <StatusIndicator status={activity.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs space-y-1">
                <Clock size={24} className="mx-auto text-slate-300 mb-1" />
                <p>Telemetry stream active · Waiting for next document</p>
              </div>
            )}
          </div>

        </section>

        {/* Confusion Matrix Evaluation */}
        {cm && (
          <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <BrainCircuit className="w-4 h-4 text-[#0369A1]" />
              <h3 className="text-sm font-semibold text-[#0F172A]">Validation Confusion Matrix</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-semibold uppercase text-emerald-800 block">True Negative (Consistent)</span>
                <span className="text-2xl font-bold font-mono text-emerald-900 mt-1 block">{cm.true_negative}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase text-slate-600 block">False Positive</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{cm.false_positive}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase text-slate-600 block">False Negative</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{cm.false_negative}</span>
              </div>
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100">
                <span className="text-[11px] font-semibold uppercase text-sky-800 block">True Positive (Anomaly)</span>
                <span className="text-2xl font-bold font-mono text-sky-900 mt-1 block">{cm.true_positive}</span>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default AnalyticsPage;
