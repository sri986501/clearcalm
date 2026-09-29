import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Sliders, 
  RotateCcw, 
  Download, 
  Check, 
  Layers,
  Palette,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useSettingsStore, ThemeMode, ColorPalette, AnomalySensitivity } from '../../store/useSettingsStore';
import { useVerifyStore } from '../../store/useVerifyStore';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    closeSettingsModal,
    theme,
    setTheme,
    colorPalette,
    setColorPalette,
    enableMouseTracker,
    setEnableMouseTracker,
    enableScrollAnimations,
    setEnableScrollAnimations,
    enableCaformerVision,
    setEnableCaformerVision,
    ocrConfidenceThreshold,
    setOcrConfidenceThreshold,
    anomalySensitivity,
    setAnomalySensitivity,
    autoScrollToResults,
    setAutoScrollToResults,
    resetSettings
  } = useSettingsStore();

  const { clearAllVerifications } = useVerifyStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'verification' | 'data'>('appearance');
  const [copiedExport, setCopiedExport] = useState(false);

  if (!isSettingsModalOpen) return null;

  const palettes: { id: ColorPalette; name: string; desc: string; sampleHex: string[] }[] = [
    {
      id: 'corporate-blue',
      name: 'Corporate Trust Blue',
      desc: 'Standard enterprise palette with clean cobalt and slate tones.',
      sampleHex: ['#2563EB', '#1E40AF', '#EFF6FF']
    },
    {
      id: 'slate-gray',
      name: 'Minimal Slate Gray',
      desc: 'Monochrome precision palette for focused actuarial review.',
      sampleHex: ['#334155', '#0F172A', '#F1F5F9']
    },
    {
      id: 'forest-green',
      name: 'Forest Underwriting',
      desc: 'Classic British racing green with high readability.',
      sampleHex: ['#15803D', '#14532D', '#F0FDF4']
    },
    {
      id: 'charcoal-amber',
      name: 'Charcoal & Amber',
      desc: 'Warm editorial paper tone with amber caution indicators.',
      sampleHex: ['#D97706', '#92400E', '#FFFBEB']
    },
    {
      id: 'ocean-teal',
      name: 'Ocean Teal',
      desc: 'Modern balanced teal for regulatory compliance audits.',
      sampleHex: ['#0F766E', '#134E4A', '#F0FDFA']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white dark:bg-[#131924] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-[#242E42] shadow-xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Top Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Preferences &amp; Customization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize color theme, palette, and OCR verification thresholds
              </p>
            </div>
          </div>

          <button
            onClick={closeSettingsModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'appearance'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme &amp; Color Palette</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'verification'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Verification Thresholds</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'data'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Data Management</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: THEME & COLOR PALETTE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              
              {/* Theme Mode Switch */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wide">
                  Theme Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Light Mode</p>
                        <p className="text-xs text-slate-500">Clean white &amp; off-white paper</p>
                      </div>
                    </div>
                    {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Moon className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Dark Mode</p>
                        <p className="text-xs text-slate-500">Low-glare dark slate background</p>
                      </div>
                    </div>
                    {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                  </button>
                </div>
              </div>

              {/* Color Palette Customizer */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wide">
                  Color Palette Accent
                </label>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {palettes.map((p) => {
                    const isSelected = colorPalette === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setColorPalette(p.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            {p.sampleHex.map((hex, idx) => (
                              <div
                                key={idx}
                                style={{ backgroundColor: hex }}
                                className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700"
                              />
                            ))}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.desc}</p>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: VERIFICATION THRESHOLDS */}
          {activeTab === 'verification' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  OCR Confidence Acceptance Threshold: {ocrConfidenceThreshold}%
                </label>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={ocrConfidenceThreshold}
                  onChange={(e) => setOcrConfidenceThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-slate-500">
                  Extracted terms below this threshold will be flagged for manual human inspection.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Arbitration Sensitivity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['lenient', 'standard', 'strict'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setAnomalySensitivity(mode)}
                      className={`p-2.5 rounded-lg border text-xs capitalize text-center transition-colors ${
                        anomalySensitivity === mode
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA & RESET */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Reset to Defaults</p>
                <p className="text-xs text-slate-500">Revert theme, palette, and sensitivity to factory settings.</p>
                <button
                  onClick={resetSettings}
                  className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 mt-2"
                >
                  <RotateCcw size={13} />
                  <span>Reset All Settings</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 space-y-2">
                <p className="text-xs font-semibold text-red-700 dark:text-red-400">Purge Verification Records</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">Delete all saved policy audit records from local storage.</p>
                <button
                  onClick={async () => {
                    if (window.confirm('Delete all verification vault records permanently?')) {
                      await clearAllVerifications();
                      alert('History cleared.');
                    }
                  }}
                  className="btn-danger !py-1.5 !px-3 text-xs flex items-center gap-1.5 mt-2"
                >
                  <span>Purge Audit History</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={closeSettingsModal}
            className="btn-primary !py-2 !px-5 text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
