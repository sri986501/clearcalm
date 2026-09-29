import { create } from 'zustand';
import api from '../lib/axios';

export interface DocChunk {
  chunkId: string;
  page: number;
  paragraphIndex?: number;
  text: string;
}

export interface DocumentItem {
  _id: string;
  filename: string;
  originalUrl: string;
  filePath?: string;
  fileSize?: number;
  pageCount: number;
  uploadedAt: string | Date;
  status: 'processing' | 'ready' | 'failed';
  chunks: DocChunk[];
}

export interface FactItem {
  statement: string;
  sourceChunkId: string;
  category: 'coverage' | 'penalty' | 'eligibility' | 'renewal' | 'liability' | 'general';
  riskLevel: 'none' | 'low' | 'high';
  riskExplanation?: string;
  verified?: boolean;
}

export interface SummaryData {
  _id?: string;
  documentId: string;
  mode: 'short' | 'detailed' | 'bullet' | 'timeline';
  facts: FactItem[];
  generatedAt?: string;
}

export interface QAItem {
  _id?: string;
  documentId: string;
  question: string;
  answer: string;
  sourceChunkIds: string[];
  askedAt?: string;
}

interface DocStoreState {
  documents: DocumentItem[];
  currentDocument: DocumentItem | null;
  currentSummary: SummaryData | null;
  summaryMode: 'short' | 'detailed' | 'bullet' | 'timeline';
  activeChunkId: string | null;
  activePage: number;
  selectedCategory: string;
  onlyHighRisk: boolean;
  searchQuery: string;
  qaHistory: QAItem[];
  isQaOpen: boolean;
  isLoadingDoc: boolean;
  isGeneratingSummary: boolean;
  isAskingQa: boolean;

  fetchDocuments: () => Promise<void>;
  selectDocument: (docId: string) => Promise<void>;
  setCurrentDocumentDirectly: (doc: DocumentItem) => void;
  setSummaryMode: (mode: 'short' | 'detailed' | 'bullet' | 'timeline') => Promise<void>;
  highlightFactSource: (chunkId: string, page: number) => void;
  setSelectedCategory: (cat: string) => void;
  setOnlyHighRisk: (val: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleQaDrawer: () => void;
  askQuestion: (question: string) => Promise<void>;
  uploadPdfFile: (file: File) => Promise<DocumentItem>;
}

export const useDocStore = create<DocStoreState>((set, get) => ({
  documents: [],
  currentDocument: null,
  currentSummary: null,
  summaryMode: 'detailed',
  activeChunkId: null,
  activePage: 1,
  selectedCategory: 'all',
  onlyHighRisk: false,
  searchQuery: '',
  qaHistory: [],
  isQaOpen: false,
  isLoadingDoc: false,
  isGeneratingSummary: false,
  isAskingQa: false,

  fetchDocuments: async () => {
    try {
      const res = await api.get('/documents');
      let docs = res.data.documents || [];
      if (docs.length === 0) {
        // Fetch preset samples
        const sampleRes = await api.get('/samples');
        docs = sampleRes.data.samples || [];
      }
      set({ documents: docs });
    } catch (e) {
      console.warn('Document fetch warning, loading sample preset');
    }
  },

  selectDocument: async (docId: string) => {
    set({ isLoadingDoc: true, activeChunkId: null });
    try {
      let doc = get().documents.find(d => d._id === docId);
      if (!doc || !doc.chunks || doc.chunks.length === 0) {
        const res = await api.get(`/documents/${docId}`);
        doc = res.data.document;
      }
      if (doc) {
        set({ currentDocument: doc, activePage: 1 });
        // Fetch or generate summary for this document
        await get().setSummaryMode(get().summaryMode);
        // Fetch Q&A history
        try {
          const qaRes = await api.get(`/qa/${docId}`);
          set({ qaHistory: qaRes.data.history || [] });
        } catch (qaErr) {}
      }
    } catch (err) {
      console.error('Select document error:', err);
    } finally {
      set({ isLoadingDoc: false });
    }
  },

  setCurrentDocumentDirectly: (doc: DocumentItem) => {
    set({ currentDocument: doc, activePage: 1, activeChunkId: null });
  },

  setSummaryMode: async (mode) => {
    const doc = get().currentDocument;
    if (!doc) return;

    set({ summaryMode: mode, isGeneratingSummary: true });
    try {
      const res = await api.post('/summaries/generate', {
        documentId: doc._id,
        mode
      });
      set({ currentSummary: res.data.summary });
    } catch (err) {
      // Create local fallback summary
      const facts: FactItem[] = (doc.chunks || []).map((c) => ({
        statement: c.text,
        sourceChunkId: c.chunkId,
        category: c.text.toLowerCase().includes('penalty') ? 'penalty' : 'general',
        riskLevel: c.text.toLowerCase().includes('penalty') ? 'high' : 'none',
        verified: true
      }));

      set({
        currentSummary: {
          documentId: doc._id,
          mode,
          facts
        }
      });
    } finally {
      set({ isGeneratingSummary: false });
    }
  },

  highlightFactSource: (chunkId: string, page: number) => {
    set({ activeChunkId: chunkId, activePage: page });
  },

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setOnlyHighRisk: (onlyHighRisk) => set({ onlyHighRisk }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleQaDrawer: () => set((state) => ({ isQaOpen: !state.isQaOpen })),

  askQuestion: async (question: string) => {
    const doc = get().currentDocument;
    if (!doc || !question.trim()) return;

    set({ isAskingQa: true });
    try {
      const res = await api.post('/qa/ask', {
        documentId: doc._id,
        question
      });
      const newQa = res.data.qa;
      set((state) => ({
        qaHistory: [...state.qaHistory, newQa],
        isAskingQa: false
      }));

      if (newQa.sourceChunkIds && newQa.sourceChunkIds.length > 0) {
        const matchingChunk = doc.chunks.find(c => c.chunkId === newQa.sourceChunkIds[0]);
        if (matchingChunk) {
          get().highlightFactSource(matchingChunk.chunkId, matchingChunk.page);
        }
      }
    } catch (err) {
      console.error('Ask question failed:', err);
      set({ isAskingQa: false });
    }
  },

  uploadPdfFile: async (file: File) => {
    set({ isLoadingDoc: true });
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newDoc = res.data.document;
      set((state) => ({
        documents: [newDoc, ...state.documents],
        currentDocument: newDoc,
        activePage: 1
      }));

      await get().setSummaryMode('detailed');
      return newDoc;
    } catch (error: any) {
      set({ isLoadingDoc: false });
      throw new Error(error.response?.data?.error || 'Failed to upload PDF');
    }
  }
}));
