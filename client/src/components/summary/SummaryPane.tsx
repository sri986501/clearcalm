import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  Clock, 
  List, 
  FileText, 
  ShieldAlert,
  Search
} from 'lucide-react';
import { useDocStore, FactItem } from '../../store/useDocStore';

export const SummaryPane: React.FC = () => {
  const {
    currentDocument,
    currentSummary,
    summaryMode,
    setSummaryMode,
    activeChunkId,
    highlightFactSource,
    selectedCategory,
    setSelectedCategory,
    onlyHighRisk,
    setOnlyHighRisk,
    searchQuery,
    setSearchQuery,
    isGeneratingSummary
  } = useDocStore();

  if (!currentSummary) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-warmgray">
        <Sparkles className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="font-serif text-sm">Generating AI Fact-Grounding Summary...</p>
      </div>
    );
  }

  // Filter facts based on user controls
  const filteredFacts = currentSummary.facts.filter((fact) => {
    if (selectedCategory !== 'all' && fact.category !== selectedCategory) {
      return false;
    }
    if (onlyHighRisk && fact.riskLevel !== 'high') {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        fact.statement.toLowerCase().includes(q) ||
        (fact.riskExplanation && fact.riskExplanation.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const categories = [
    { id: 'all', label: 'All Statements' },
    { id: 'coverage', label: 'Coverage' },
    { id: 'penalty', label: 'Penalty' },
    { id: 'liability', label: 'Liability' },
    { id: 'renewal', label: 'Renewal' },
    { id: 'eligibility', label: 'Eligibility' },
  ];

  const modes: { id: 'short' | 'detailed' | 'bullet' | 'timeline'; label: string; icon: any }[] = [
    { id: 'detailed', label: 'Detailed', icon: FileText },
    { id: 'short', label: 'Short', icon: Sparkles },
    { id: 'bullet', label: 'Bullets', icon: List },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  return (
    <div className="h-full flex flex-col bg-paper-bg border-r border-paper-border overflow-hidden">
      {/* Top Header & Mode Switcher */}
      <div className="p-4 bg-paper-surface border-b border-paper-border space-y-3 shrink-0 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="font-serif font-bold text-lg text-forest-700">AI Verified Summary</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sage-50 text-sage-700 border border-sage-500/30 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-sage-500" />
              <span>Grounded</span>
            </span>
          </div>

          <span className="text-xs text-warmgray font-mono">
            {filteredFacts.length} {filteredFacts.length === 1 ? 'Claim' : 'Claims'}
          </span>
        </div>

        {/* Summary Mode Toggle */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-paper-muted rounded-lg border border-paper-border text-xs">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = summaryMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSummaryMode(m.id)}
                disabled={isGeneratingSummary}
                className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-md font-medium transition-all ${
                  isActive
                    ? 'bg-paper-surface text-forest-700 shadow-sm border border-paper-border font-semibold'
                    : 'text-warmgray hover:text-charcoal-900'
                } ${isGeneratingSummary ? 'opacity-50 cursor-wait' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter controls */}
        <div className="space-y-2 pt-1">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-warmgray" />
            <input
              type="text"
              placeholder="Search facts or clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-paper-bg border border-paper-border rounded-md text-charcoal-900 focus:outline-none focus:border-forest-700/50"
            />
          </div>

          {/* Category Chips & High-Risk Toggle */}
          <div className="flex items-center justify-between text-xs overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center space-x-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-forest-700 text-white'
                      : 'bg-paper-muted text-warmgray hover:text-charcoal-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setOnlyHighRisk(!onlyHighRisk)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap border transition-colors shrink-0 ml-2 ${
                onlyHighRisk
                  ? 'bg-risk-50 text-risk-700 border-risk-500/50 font-semibold'
                  : 'bg-paper-surface text-warmgray border-paper-border hover:border-risk-500/30'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-risk-500" />
              <span>High Risk Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fact Cards Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isGeneratingSummary ? (
          <div className="py-12 text-center text-warmgray space-y-3">
            <Sparkles className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs font-mono">Synthesizing source-backed evidence...</p>
          </div>
        ) : filteredFacts.length === 0 ? (
          <div className="py-12 text-center text-warmgray space-y-2">
            <Filter className="w-6 h-6 mx-auto text-paper-border" />
            <p className="text-xs">No factual statements matched your current filter criteria.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredFacts.map((fact, index) => {
              const isSelected = activeChunkId === fact.sourceChunkId;
              const sourceChunk = currentDocument?.chunks?.find(
                (c) => c.chunkId === fact.sourceChunkId
              );

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  onClick={() => {
                    if (sourceChunk) {
                      highlightFactSource(fact.sourceChunkId, sourceChunk.page);
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative shadow-paper ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-500 shadow-paper-lg ring-2 ring-amber-500/20'
                      : fact.riskLevel === 'high'
                      ? 'bg-risk-50/40 border-risk-500/40 hover:border-risk-500'
                      : 'bg-paper-surface border-paper-border hover:border-forest-700/30'
                  }`}
                >
                  {/* Card Header: Category Badge & Citation Button */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded ${getCategoryBadgeStyle(
                        fact.category
                      )}`}
                    >
                      {fact.category}
                    </span>

                    {/* Citation Evidence Marker Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sourceChunk) {
                          highlightFactSource(fact.sourceChunkId, sourceChunk.page);
                        }
                      }}
                      className={`citation-badge group flex items-center space-x-1 ${
                        isSelected ? 'bg-amber-500 text-white border-amber-600' : ''
                      }`}
                      title={`Jump to Page ${sourceChunk?.page || 1}`}
                    >
                      <span>Citation #{fact.sourceChunkId}</span>
                      <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Fact Statement */}
                  <p className="text-xs sm:text-sm text-charcoal-900 font-normal leading-relaxed">
                    {fact.statement}
                  </p>

                  {/* Risk Alert Explanation Box if High Risk */}
                  {fact.riskLevel === 'high' && (
                    <div className="mt-3 p-2.5 bg-risk-50 border border-risk-500/30 rounded-lg flex items-start space-x-2 text-xs text-risk-700">
                      <ShieldAlert className="w-4 h-4 text-risk-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold block font-serif">High Risk Clause Detected:</span>
                        <p className="text-[11px] leading-snug">
                          {fact.riskExplanation || 'Expose contract penalties or auto-renewal obligations.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Verified Source Indicator Footer */}
                  <div className="mt-3 pt-2 border-t border-paper-border/60 flex items-center justify-between text-[11px] text-warmgray">
                    <span className="flex items-center space-x-1 text-sage-700">
                      <CheckCircle className="w-3 h-3 text-sage-500" />
                      <span>Source: Page {sourceChunk?.page || 1}</span>
                    </span>
                    <span className="font-mono text-[10px] text-warmgray">
                      Paragraph #{sourceChunk?.paragraphIndex || 1}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

function getCategoryBadgeStyle(category: string): string {
  switch (category) {
    case 'coverage':
      return 'bg-sage-50 text-sage-700 border border-sage-500/30';
    case 'penalty':
      return 'bg-risk-50 text-risk-700 border border-risk-500/30';
    case 'liability':
      return 'bg-amber-50 text-amber-700 border border-amber-500/30';
    case 'renewal':
      return 'bg-forest-50 text-forest-700 border border-forest-500/30';
    case 'eligibility':
      return 'bg-paper-muted text-charcoal-700 border border-paper-border';
    default:
      return 'bg-paper-muted text-warmgray border border-paper-border';
  }
}
