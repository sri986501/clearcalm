import React, { useEffect, useState } from 'react';
import { Search, FileText, CheckCircle2, AlertTriangle, Printer, ArrowUpDown, Eye, Trash2, BookOpen, Plus, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import { Header } from '../components/common/Header';
import { VerificationReportModal } from '../components/common/VerificationReportModal';
import { DocumentViewerModal } from '../components/common/DocumentViewerModal';
import { useVerifyStore } from '../store/useVerifyStore';

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
    <div className="min-h-screen bg-[#F5F5F5] text-black relative flex flex-col font-sans">
      {/* Professional Watermark Background */}
      <div 
        className="fixed inset-0 pointer-events-none bg-[url('/images/portal_bg.jpg')] bg-cover bg-center opacity-[0.06] z-0" 
        aria-hidden="true" 
      />

      <Header activeTab="history" onSelectTab={onSelectTab} />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Header Bar */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-black/10 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-black/60 font-semibold tracking-wider">
                CRYPTOGRAPHIC ARCHIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
              Policy Audit Vault
            </h1>
            <p className="text-sm text-black/60 max-w-2xl">
              Complete historical record of all policy contracts, extracted citations, discrepancy logs, and audit reports.
            </p>
          </div>

          <button 
            onClick={() => onSelectTab?.('verify')} 
            className="bg-black text-white hover:bg-gray-800 transition-colors py-2.5 px-5 rounded-full text-xs font-medium tracking-wide flex items-center gap-2 self-start lg:self-center shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>Verify New Policy</span>
          </button>
        </header>

        {/* Overview Stats Strip */}
        <section aria-label="Archive overview" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'TOTAL ARCHIVED CONTRACTS', value: verifications.length, color: 'text-black' },
            { label: 'CONSISTENT VERDICTS', value: verifications.length - reviewCount, color: 'text-emerald-600' },
            { label: 'DISCREPANCY FLAGGED', value: reviewCount, color: 'text-amber-600' }
          ].map(stat => (
            <div key={stat.label} className="p-5 sm:p-6 rounded-2xl bg-white border border-black/10 shadow-sm">
              <p className="text-[11px] font-mono text-black/50 font-medium tracking-wide">{stat.label}</p>
              <p className={`font-mono text-3xl font-bold mt-2 ${stat.color}`}>
                {isLoading && !verifications.length ? '—' : stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Search, Filter & Record Table */}
        <section aria-label="Verification records" className="space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-black/10 shadow-sm">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-3 text-black/40" />
              <input 
                id="archive-search" 
                type="search" 
                placeholder="Search by filename, policy number, holder, or underwriter..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 text-xs font-mono rounded-xl bg-black/[0.02] border border-black/10 text-black placeholder:text-black/40 focus:outline-none focus:ring-1 focus:ring-black" 
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {(['ALL', 'CONSISTENT', 'NEEDS_REVIEW'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === status 
                      ? 'bg-black text-white' 
                      : 'bg-black/5 text-black/70 hover:bg-black/10'
                  }`}
                >
                  {status === 'ALL' ? 'ALL' : status === 'CONSISTENT' ? 'CONSISTENT' : 'FLAGGED'}
                </button>
              ))}

              <div className="h-5 w-[1px] bg-black/10 mx-1 hidden sm:block" />

              <select 
                id="archive-sort" 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value as typeof sortBy)} 
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-black/10 text-black/80 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="date">Date</option>
                <option value="score">Anomaly Index</option>
                <option value="time">Latency</option>
              </select>

              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} 
                className="p-2 rounded-full border border-black/10 bg-white hover:bg-black/5 text-black/70 cursor-pointer"
                title={`Sort: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown size={13} />
              </button>
            </div>

          </div>

          {/* Table Container */}
          <div className="rounded-2xl bg-white border border-black/10 overflow-hidden shadow-sm">
            {sorted.length === 0 ? (
              <div className="p-14 text-center space-y-3">
                <FileText size={36} className="mx-auto text-black/30" />
                <h3 className="text-base font-semibold text-black">
                  {isLoading ? 'Retrieving archive...' : verifications.length ? 'No matching policy records' : 'No records stored'}
                </h3>
                <p className="text-xs text-black/60 max-w-sm mx-auto">
                  {verifications.length ? 'Clear the search filter to display all historical records.' : 'Verify a policy document to generate an encrypted audit trail.'}
                </p>
                {verifications.length ? (
                  <button onClick={resetFilters} className="bg-black/5 hover:bg-black/10 text-black px-4 py-2 rounded-full text-xs font-medium tracking-wide">
                    Reset Filter
                  </button>
                ) : (
                  <button onClick={() => onSelectTab?.('verify')} className="bg-black text-white hover:bg-gray-800 px-5 py-2.5 rounded-full text-xs font-medium tracking-wide">
                    Launch Verification
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.02] font-mono text-[11px] text-black/50 border-b border-black/10">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">DOCUMENT &amp; REF</th>
                      <th className="px-4 py-3.5 font-semibold hidden md:table-cell">POLICYHOLDER / INSURER</th>
                      <th className="px-4 py-3.5 font-semibold">STATUS</th>
                      <th className="px-4 py-3.5 font-semibold hidden lg:table-cell">ANOMALY INDEX</th>
                      <th className="px-4 py-3.5 font-semibold hidden xl:table-cell">CHECKS</th>
                      <th className="px-4 py-3.5 font-semibold">DATE &amp; LATENCY</th>
                      <th className="px-5 py-3.5 font-semibold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {sorted.map(item => {
                      const isConsistent = item.status === 'CONSISTENT';
                      const fields = item.extractedFields;
                      return (
                        <tr key={item.verificationId || item._id} className="hover:bg-black/[0.015] transition-colors">
                          
                          {/* File / Doc */}
                          <td className="px-5 py-4">
                            <button 
                              onClick={() => openDocumentModal(item)} 
                              className="text-left font-semibold text-black hover:text-emerald-700 truncate max-w-[200px] block cursor-pointer"
                            >
                              {item.filename}
                            </button>
                            <p className="text-[11px] font-mono text-black/40 mt-0.5">
                              {fields?.policy_number?.value || `Ref: ${(item.verificationId || item._id || '').slice(0, 14)}`}
                            </p>
                          </td>

                          {/* Policyholder */}
                          <td className="px-4 py-4 hidden md:table-cell">
                            <p className="font-medium text-black">{fields?.policyholder?.value || 'Unspecified Entity'}</p>
                            <p className="text-[11px] font-mono text-black/50 mt-0.5">{fields?.insurer?.value || 'Insurer not specified'}</p>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            {isConsistent ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={12} />
                                <span>Consistent</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertTriangle size={12} />
                                <span>Flagged</span>
                              </span>
                            )}
                          </td>

                          {/* Anomaly Index */}
                          <td className="px-4 py-4 hidden lg:table-cell font-mono">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              item.anomalyScore > 0.4 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-black/5 text-black/70'
                            }`}>
                              {item.anomalyScore.toFixed(2)}
                            </span>
                            <span className="block text-[10px] text-black/40 mt-0.5">{item.detectedIssues?.length || 0} conflicts</span>
                          </td>

                          {/* Checks */}
                          <td className="px-4 py-4 hidden xl:table-cell font-mono text-black/70">
                            <span className="text-emerald-700 font-bold">{item.passedChecksCount}</span> / {item.totalChecksCount}
                          </td>

                          {/* Date & Latency */}
                          <td className="px-4 py-4 font-mono text-black/60 text-[11px]">
                            <p className="text-black font-medium">{new Date(item.verifiedAt).toLocaleDateString()}</p>
                            <p className="text-black/40 mt-0.5">{item.processingTimeMs}ms</p>
                          </td>

                          {/* Action Hub */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => openDocumentModal(item)} 
                                title="Inspect Modal" 
                                className="p-2 rounded-lg text-black/50 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
                              >
                                <BookOpen size={15} />
                              </button>
                              <button 
                                onClick={() => { selectVerification(item); onSelectTab?.('verify'); }} 
                                title="Inspect in Console" 
                                className="p-2 rounded-lg text-black/50 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
                              >
                                <Eye size={15} />
                              </button>
                              <button 
                                onClick={() => openReportModal(item)} 
                                title="Audit Certificate" 
                                className="p-2 rounded-lg text-black/50 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
                              >
                                <Printer size={15} />
                              </button>
                              <button 
                                onClick={async () => { if (window.confirm(`Delete record?`)) await deleteVerification(item.verificationId || item._id || ''); }} 
                                title="Delete Record" 
                                className="p-2 rounded-lg text-black/50 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom Clear History Action */}
          {verifications.length > 0 && (
            <div className="flex items-center justify-between text-xs font-mono text-black/50 pt-2">
              <span>Encrypted SHA-256 Vault Records</span>
              <button 
                disabled={isClearing} 
                onClick={async () => {
                  if (window.confirm('Delete all verification vault records permanently?')) {
                    setIsClearing(true);
                    try { await clearAllVerifications(); } finally { setIsClearing(false); }
                  }
                }} 
                className="text-rose-600 hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{isClearing ? 'Clearing…' : 'Purge All Records'}</span>
              </button>
            </div>
          )}

        </section>

      </main>

      <DocumentViewerModal 
        record={selectedDocumentForView} 
        isOpen={isDocumentModalOpen} 
        onClose={closeDocumentModal} 
        onInspectInWorkspace={record => { selectVerification(record); onSelectTab?.('verify'); }} 
        onPrintReport={record => openReportModal(record)} 
      />
      <VerificationReportModal 
        record={selectedReportDoc} 
        isOpen={isReportModalOpen} 
        onClose={closeReportModal} 
      />
    </div>
  );
};
