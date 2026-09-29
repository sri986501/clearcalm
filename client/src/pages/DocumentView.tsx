import React, { useState } from 'react';
import { FileText, Columns2 } from 'lucide-react';
import { Header, AppViewTab } from '../components/common/Header';
import { SummaryPane } from '../components/summary/SummaryPane';
import { PdfViewerPane } from '../components/pdf-viewer/PdfViewerPane';
import { QaDrawer } from '../components/qa/QaDrawer';
import { useDocStore } from '../store/useDocStore';

interface DocumentViewProps {
  onNavigateHome: () => void;
  onSelectTab?: (tab: AppViewTab) => void;
}

export const DocumentView: React.FC<DocumentViewProps> = ({ onNavigateHome, onSelectTab }) => {
  const { currentDocument } = useDocStore();
  const [mobilePane, setMobilePane] = useState<'summary' | 'document'>('summary');

  if (!currentDocument) {
    return <div className="min-h-screen bg-paper-bg flex flex-col items-center justify-center p-8 gap-4"><FileText size={32} className="text-warmgray" /><h1 className="font-serif text-2xl">No document selected</h1><p className="text-sm text-warmgray">Open a document to review its summary and source.</p><button onClick={onNavigateHome} className="btn-primary">Return to overview</button></div>;
  }

  return (
    <div className="h-[100dvh] bg-paper-bg flex flex-col overflow-hidden font-sans">
      <Header activeTab="workspace" onNavigateHome={onNavigateHome} onSelectTab={onSelectTab} />
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-paper-border shrink-0"><div className="flex items-center gap-2 text-sm font-medium"><Columns2 size={17} className="text-forest-700" /> Evidence workspace</div><div className="flex md:hidden gap-1" aria-label="Workspace panel"><button aria-pressed={mobilePane === 'summary'} onClick={() => setMobilePane('summary')} className={`px-3 py-2 text-xs rounded-md ${mobilePane === 'summary' ? 'bg-forest-100 text-forest-700' : 'text-warmgray'}`}>Summary</button><button aria-pressed={mobilePane === 'document'} onClick={() => setMobilePane('document')} className={`px-3 py-2 text-xs rounded-md ${mobilePane === 'document' ? 'bg-forest-100 text-forest-700' : 'text-warmgray'}`}>Document</button></div><p className="hidden md:block text-xs text-warmgray">Review the summary alongside the original document</p></div>
      <main className="flex-1 min-h-0 flex overflow-hidden relative">
        <section aria-label="Document summary" className={`${mobilePane === 'summary' ? 'block' : 'hidden'} md:block w-full md:w-[42%] lg:w-[40%] h-full shrink-0 border-r border-paper-border`}><SummaryPane /></section>
        <section aria-label="Source document" className={`${mobilePane === 'document' ? 'block' : 'hidden'} md:block w-full md:w-[58%] lg:w-[60%] h-full min-w-0 flex-1`}><PdfViewerPane /></section>
        <QaDrawer />
      </main>
    </div>
  );
};
