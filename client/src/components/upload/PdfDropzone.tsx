import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { useDocStore, DocumentItem } from '../../store/useDocStore';

interface PdfDropzoneProps {
  onSuccess: (doc: DocumentItem) => void;
}

export const PdfDropzone: React.FC<PdfDropzoneProps> = ({ onSuccess }) => {
  const { uploadPdfFile, documents, selectDocument } = useDocStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('Preparing document...');

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMsg('Please upload a valid PDF document.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);
    setUploadProgress('Extracting text & paragraph chunk offsets...');

    try {
      setTimeout(() => {
        setUploadProgress('Running Claude AI fact-to-source mapping & anti-hallucination validation...');
      }, 1200);

      const doc = await uploadPdfFile(file);
      onSuccess(doc);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isUploading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-paper-surface shadow-paper ${
          isDragActive
            ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
            : 'border-paper-border hover:border-forest-700/40 hover:shadow-paper-lg'
        } ${isUploading ? 'opacity-90 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="py-6 flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-pulse border border-amber-300">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-forest-700">Analyzing Document Intelligence...</h3>
              <p className="text-xs text-warmgray font-mono">{uploadProgress}</p>
            </div>
            <div className="w-48 h-1.5 bg-paper-muted rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-sm">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                Drop your PDF contract or policy here
              </h3>
              <p className="text-xs text-warmgray max-w-sm">
                Supports legal contracts, commercial policies, claim forms & vendor agreements.
              </p>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-xs">
              <span className="px-3 py-1 bg-forest-700 text-white font-medium rounded-md hover:bg-forest-900 transition-colors">
                Browse File
              </span>
              <span className="text-warmgray">or drag & drop</span>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 bg-risk-50 border border-risk-500/30 rounded-lg flex items-center space-x-2 text-xs text-risk-700">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preset Documents Quick-Start */}
      <div className="mt-6 pt-6 border-t border-paper-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-serif font-semibold text-charcoal-900 uppercase tracking-wider">
            Or test instantly with sample legal documents
          </h4>
          <span className="text-[11px] text-warmgray font-mono">Click to open</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documents.slice(0, 2).map((doc) => (
            <button
              key={doc._id}
              onClick={async () => {
                await selectDocument(doc._id);
                onSuccess(doc);
              }}
              className="p-3 bg-paper-surface hover:bg-forest-50/50 border border-paper-border hover:border-forest-700/30 rounded-lg text-left transition-all flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 rounded bg-amber-50 text-amber-700 shrink-0 border border-amber-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-charcoal-900 group-hover:text-forest-700 truncate">
                    {doc.filename}
                  </p>
                  <p className="text-[10px] text-warmgray">{doc.pageCount} pages • Sample Document</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-warmgray group-hover:text-forest-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
