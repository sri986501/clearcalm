import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  Sparkles,
  Maximize2,
  CheckCircle2
} from 'lucide-react';
import { useDocStore } from '../../store/useDocStore';

export const PdfViewerPane: React.FC = () => {
  const { currentDocument, activeChunkId, activePage, highlightFactSource } = useDocStore();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Sync activePage from store
  useEffect(() => {
    if (activePage) {
      setCurrentPage(activePage);
    }
  }, [activePage]);

  // Scroll to active paragraph when activeChunkId changes
  useEffect(() => {
    if (activeChunkId) {
      const el = document.getElementById(`chunk-${activeChunkId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeChunkId, currentPage]);

  if (!currentDocument) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-paper-surface text-warmgray">
        <p className="text-xs">No PDF document selected.</p>
      </div>
    );
  }

  const pageCount = currentDocument.pageCount || 1;
  const activeChunk = currentDocument.chunks?.find((c) => c.chunkId === activeChunkId);

  // Filter chunks for current page
  const currentPageChunks = (currentDocument.chunks || []).filter(
    (c) => c.page === currentPage
  );

  return (
    <div className="h-full flex flex-col bg-paper-muted/60 relative overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-12 bg-paper-surface border-b border-paper-border px-4 flex items-center justify-between shrink-0 shadow-xs z-10">
        {/* Page Navigation */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 text-charcoal-700 hover:bg-paper-muted rounded-md disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-warmgray font-medium">
            Page <strong className="text-charcoal-900">{currentPage}</strong> of {pageCount}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
            disabled={currentPage >= pageCount}
            className="p-1.5 text-charcoal-700 hover:bg-paper-muted rounded-md disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Active Highlight Indicator Banner */}
        {activeChunk && (
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-400/40 text-xs animate-fade-in font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Citation Active: #{activeChunk.chunkId}</span>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
            className="p-1.5 text-charcoal-700 hover:bg-paper-muted rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] text-warmgray w-10 text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
            className="p-1.5 text-charcoal-700 hover:bg-paper-muted rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Document Render Pane */}
      <div
        ref={pageContainerRef}
        className="flex-1 overflow-auto p-6 md:p-10 flex flex-col items-center space-y-8"
      >
        {/* Render pages as physical document sheets with clean typography & citation overlay */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-3xl bg-paper-surface rounded-sm border border-paper-border shadow-paper-lg p-8 sm:p-12 min-h-[900px] transition-transform duration-200 relative"
        >
          {/* Paper Header Metadata watermark */}
          <div className="flex justify-between items-center pb-6 mb-6 border-b border-paper-border text-[11px] text-warmgray font-mono">
            <span className="flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-forest-700" />
              <span>{currentDocument.filename}</span>
            </span>
            <span>PAGE {currentPage} / {pageCount}</span>
          </div>

          {/* Page Content Chunks with Warm Amber Highlighting Overlay */}
          <div className="space-y-6 text-sm text-charcoal-900 leading-relaxed font-sans">
            {currentPageChunks.length === 0 ? (
              <div className="py-20 text-center text-warmgray font-mono text-xs">
                [ No paragraph text extracted for page {currentPage} ]
              </div>
            ) : (
              currentPageChunks.map((chunk) => {
                const isActive = activeChunkId === chunk.chunkId;

                return (
                  <div
                    key={chunk.chunkId}
                    id={`chunk-${chunk.chunkId}`}
                    onClick={() => highlightFactSource(chunk.chunkId, chunk.page)}
                    className={`p-4 rounded-md transition-all cursor-pointer relative border ${
                      isActive
                        ? 'citation-highlight-active bg-amber-100/70 border-amber-500 shadow-amberGlow'
                        : 'border-transparent hover:bg-amber-50/50 hover:border-amber-300/50'
                    }`}
                  >
                    {/* Chunk ID Badge on Hover/Active */}
                    <div className="absolute -left-3 top-2 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-mono font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded shadow-xs">
                        #{chunk.chunkId}
                      </span>
                    </div>

                    <p className="text-sm text-charcoal-900 leading-relaxed">
                      {chunk.text}
                    </p>

                    {isActive && (
                      <div className="mt-2 pt-1 border-t border-amber-400/40 flex items-center justify-between text-[11px] text-amber-800 font-mono">
                        <span className="flex items-center space-x-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-amber-600" />
                          <span>Exact Source Grounding Match ({chunk.chunkId})</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Paper Footer */}
          <div className="mt-16 pt-6 border-t border-paper-border/60 flex items-center justify-between text-[10px] text-warmgray font-mono">
            <span>ClearClaim Verified Audit Trail • Grounded Source Verification</span>
            <span>Document Ref: {currentDocument._id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
