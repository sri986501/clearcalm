import React, { useEffect, useState } from 'react';
import { 
  Search, FileText, CheckCircle2, AlertTriangle, Printer, 
  ArrowUpDown, Eye, Trash2, Plus, ArrowRight, ShieldCheck, Filter 
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { VerificationReportModal } from '../components/common/VerificationReportModal';
import { DocumentViewerModal } from '../components/common/DocumentViewerModal';
import { useVerifyStore } from '../store/useVerifyStore';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { EmptyState } from '../components/ui/EmptyState';
import { SupportCard } from '../components/ui/SupportCard';

interface HistoryPageProps {
  onSelectTab?: (tab: any) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectTab }) => {
  const {
    verifications, fetchVerifications, deleteVerification, clearAllVerifications,
    selectVerification, openReportModal, isReportModalOpen, closeReportModal,
    selectedReportDoc, openDocumentModal, closeDocumentModal, selectedDocumentForView,
    isDocumentModalOpen, searchQuery, setSearchQuery, statusFilter, setStatusFilter
  } = useVerifyStore();

  const [sortBy, setSortBy] = useState<'date' | 'score' | 'time'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isClearing, setIsClearing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchVerifications().finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [fetchVerifications]);

  const filtered = verifications.filter((item) => {
    const term = searchQuery.trim().toLowerCase();
    const isOk = item.status === 'Verified / Likely Original' || item.status === 'CONSISTENT';
    const statusMatches = statusFilter === 'ALL' || (statusFilter === 'CONSISTENT' ? isOk : !isOk);
    return statusMatches && [
      item.filename, item.extractedFields?.policy_number?.value,
      item.extractedFields?.policyholder?.value, item.extractedFields?.insurer?.value
    ].some(value => value?.toLowerCase().includes(term));
  });

  const sorted = [...filtered].sort((a, b) => {
    const difference = sortBy === 'date'
      ? new Date(a.verifiedAt).getTime() - new Date(b.verifiedAt).getTime()
      : sortBy === 'score' ? a.anomalyScore - b.anomalyScore : a.processingTimeMs - b.processingTimeMs;
    return sortOrder === 'desc' ? -difference : difference;
  });

  const resetFilters = () => { setSearchQuery(''); setStatusFilter('ALL'); };
  const reviewCount = verifications.filter(item => item.status !== 'Verified / Likely Original' && item.status !== 'CONSISTENT').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative flex flex-col font-sans transition-colors selection:bg-[#0369A1] selection:text-white">
      <Header activeTab="history" onSelectTab={onSelectTab} />
      
      <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Header Bar */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <SectionHeader
            contextBadge="AUDIT ARCHIVE &amp; EVIDENCE VAULT"
            title="Policy Audit Archive"
            subtitle="Explore historical records of verified insurance contracts, optical evidence, and discrepancy logs."
            action={
              <button 
                onClick={() => onSelectTab?.('verify')} 
                className="btn-primary"
              >
                <Plus size={15} />
                <span>Verify New Policy</span>
              </button>
            }
          />

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Evaluated</span>
              <div className="text-2xl font-bold text-[#0F172A]">{verifications.length}</div>
              <p className="text-xs text-slate-500">Historical contracts on record</p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Consistent Records</span>
              <div className="text-2xl font-bold text-emerald-700">{verifications.length - reviewCount}</div>
              <p className="text-xs text-slate-500">Zero major discrepancies</p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Attention Requested</span>
              <div className="text-2xl font-bold text-amber-700">{reviewCount}</div>
              <p className="text-xs text-slate-500">Requires underwriter clarification</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              id="archive-search" 
              type="search" 
              placeholder="Search by filename, policy number, policyholder, or carrier…" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0369A1] focus:ring-2 focus:ring-sky-100" 
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {(['ALL', 'CONSISTENT', 'NEEDS_REVIEW'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === status 
                    ? 'bg-[#0F2942] text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All Records' : status === 'CONSISTENT' ? 'Consistent' : 'Discrepancies'}
              </button>
            ))}

            <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            <select 
              id="archive-sort" 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value as typeof sortBy)} 
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-100 cursor-pointer"
            >
              <option value="date">Sort: Date</option>
              <option value="score">Sort: Anomaly Index</option>
              <option value="time">Sort: Latency</option>
            </select>

            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} 
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
              title={`Sort: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown size={14} />
            </button>
          </div>
        </div>

        {/* Records Container */}
        <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
          {sorted.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={FileText}
                title={isLoading ? 'Loading records…' : verifications.length ? 'No matching records found' : 'No records stored'}
                description={
                  verifications.length 
                    ? 'Try adjusting your search terms or filter settings.' 
                    : 'Upload your first insurance policy to generate a cryptographically audited record.'
                }
                actionLabel={verifications.length ? 'Reset Filters' : 'Verify Policy Document'}
                onAction={verifications.length ? resetFilters : () => onSelectTab?.('verify')}
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Header on tablet/desktop */}
              <div className="hidden md:grid grid-cols-12 gap-3 p-4 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-4">Document &amp; File</div>
                <div className="col-span-3">Insurer &amp; Policy #</div>
                <div className="col-span-3">Status &amp; Verification</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {sorted.map(doc => {
                const isConsistent = doc.status === 'Verified / Likely Original' || doc.status === 'CONSISTENT';
                return (
                  <div key={doc.verificationId} className="p-4 sm:p-5 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-slate-50/60 transition-colors">
                    <div className="col-span-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0369A1] shrink-0" />
                        <span className="font-semibold text-sm text-[#0F172A] truncate max-w-xs block" title={doc.filename}>
                          {doc.filename}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 pl-6">
                        {new Date(doc.verifiedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {doc.fileSize ? ` • ${(doc.fileSize / 1024).toFixed(0)} KB` : ''}
                      </p>
                    </div>

                    <div className="col-span-3 space-y-0.5 text-xs">
                      <span className="font-medium text-slate-900 block truncate">
                        {doc.extractedFields?.insurer?.value || 'Accredited Insurer'}
                      </span>
                      <span className="font-mono text-slate-500 block truncate">
                        {doc.extractedFields?.policy_number?.value || 'Policy Not Extracted'}
                      </span>
                    </div>

                    <div className="col-span-3 space-y-1">
                      <StatusIndicator status={doc.status} size="sm" />
                      <span className="text-[11px] text-slate-400 block">
                        Confidence: {Math.round(doc.confidenceScore * 100)}%
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-1.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        onClick={() => openReportModal(doc)}
                        className="btn-secondary !text-xs !py-1.5 !px-3"
                        title="View Full Audit Report"
                      >
                        <Eye size={13} />
                        <span>Audit</span>
                      </button>

                      {doc.fileUrl && (
                        <button
                          onClick={() => openDocumentModal(doc)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Original Document"
                        >
                          <FileText size={14} />
                        </button>
                      )}

                      <button
                        onClick={() => deleteVerification(doc.verificationId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clear All Option & Support */}
        {verifications.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all archived verification records?')) {
                  clearAllVerifications();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-800 transition-colors cursor-pointer font-medium"
            >
              Clear Entire Archive
            </button>
          </div>
        )}

        <SupportCard onOpenChat={() => onSelectTab?.('discovery')} />
      </main>

      {/* Modals */}
      {isReportModalOpen && selectedReportDoc && (
        <VerificationReportModal
          isOpen={isReportModalOpen}
          onClose={closeReportModal}
          doc={selectedReportDoc}
        />
      )}

      {isDocumentModalOpen && selectedDocumentForView && (
        <DocumentViewerModal
          isOpen={isDocumentModalOpen}
          onClose={closeDocumentModal}
          record={selectedDocumentForView}
        />
      )}
    </div>
  );
};

export default HistoryPage;
