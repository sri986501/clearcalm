import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, HelpCircle, Sparkles, ExternalLink, MessageSquare } from 'lucide-react';
import { useDocStore } from '../../store/useDocStore';

export const QaDrawer: React.FC = () => {
  const {
    isQaOpen,
    toggleQaDrawer,
    currentDocument,
    qaHistory,
    askQuestion,
    isAskingQa,
    highlightFactSource
  } = useDocStore();

  const [questionText, setQuestionText] = useState('');

  if (!isQaOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || isAskingQa) return;
    const q = questionText;
    setQuestionText('');
    await askQuestion(q);
  };

  const sampleQuestions = [
    'What is the maximum reimbursement cap?',
    'What are the penalty terms or fees for early cancellation?',
    'Are there any automatic renewal traps in this policy?',
    'What is the deadline to file a claim?'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal-900/40 backdrop-blur-xs flex justify-end">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-paper-surface h-full shadow-paper-lg border-l border-paper-border flex flex-col"
        >
          {/* Header */}
          <div className="p-4 bg-paper-surface border-b border-paper-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-500/30">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-forest-700">Document Q&A Intelligence</h3>
                <p className="text-[11px] text-warmgray">Source-grounded answers with exact citations</p>
              </div>
            </div>
            <button
              onClick={toggleQaDrawer}
              className="p-1 text-warmgray hover:text-charcoal-900 rounded-md hover:bg-paper-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {qaHistory.length === 0 ? (
              <div className="py-8 text-center text-warmgray space-y-3">
                <MessageSquare className="w-8 h-8 text-paper-border mx-auto" />
                <p className="text-xs max-w-xs mx-auto">
                  Ask any question about clauses, limits, or penalties in {currentDocument?.filename || 'this document'}.
                </p>

                {/* Sample Prompt Chips */}
                <div className="pt-2 space-y-2 text-left">
                  <p className="text-[10px] uppercase font-mono text-warmgray">Suggested Questions:</p>
                  {sampleQuestions.map((sq, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuestionText(sq)}
                      className="w-full text-left p-2.5 bg-paper-bg hover:bg-amber-50 border border-paper-border hover:border-amber-500/40 rounded-lg text-xs text-charcoal-900 transition-all"
                    >
                      "{sq}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              qaHistory.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  {/* User Question */}
                  <div className="bg-forest-700 text-white p-3 rounded-xl rounded-tr-xs text-xs ml-8 shadow-xs">
                    <p className="font-medium">{item.question}</p>
                  </div>

                  {/* AI Answer */}
                  <div className="bg-paper-bg border border-paper-border p-3.5 rounded-xl rounded-tl-xs text-xs text-charcoal-900 mr-4 space-y-2 shadow-xs">
                    <p className="leading-relaxed">{item.answer}</p>

                    {/* Source Citation Chips */}
                    {item.sourceChunkIds && item.sourceChunkIds.length > 0 && (
                      <div className="pt-2 border-t border-paper-border/60 flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-warmgray">Citations:</span>
                        {item.sourceChunkIds.map((cid) => {
                          const chunk = currentDocument?.chunks?.find((c) => c.chunkId === cid);
                          return (
                            <button
                              key={cid}
                              onClick={() => {
                                if (chunk) {
                                  highlightFactSource(chunk.chunkId, chunk.page);
                                }
                              }}
                              className="citation-badge"
                            >
                              <span>#{cid}</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-1 inline" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isAskingQa && (
              <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-500/30 rounded-lg text-xs text-amber-800 font-mono">
                <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Searching source chunks and building grounded answer...</span>
              </div>
            )}
          </div>

          {/* Question Input Form */}
          <form onSubmit={handleSubmit} className="p-3 bg-paper-surface border-t border-paper-border">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask about penalties, limits, coverage..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-xs bg-paper-bg border border-paper-border rounded-lg text-charcoal-900 focus:outline-none focus:border-forest-700/60"
              />
              <button
                type="submit"
                disabled={!questionText.trim() || isAskingQa}
                className="absolute right-1.5 top-1.5 p-1.5 bg-forest-700 hover:bg-forest-900 text-white rounded-md disabled:opacity-30 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
