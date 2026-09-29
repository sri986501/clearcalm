import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ta from './ta.json';
import hi from './hi.json';
import te from './te.json';
import ml from './ml.json';
import kn from './kn.json';
import bn from './bn.json';
import mr from './mr.json';
import gu from './gu.json';
import pa from './pa.json';
import ur from './ur.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
] as const;

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// Detect initial language: localStorage -> browser language matching -> fallback 'en'
const detectInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  
  const saved = localStorage.getItem('clearclaim-lang');
  if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
    return saved;
  }

  const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
  const matched = SUPPORTED_LANGUAGES.find(l => l.code === browserLang);
  return matched ? matched.code : 'en';
};

const initialLang = detectInitialLanguage();

// Apply document level direction and language attributes
export const applyLanguageAttributes = (langCode: string) => {
  if (typeof document === 'undefined') return;
  const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
  document.documentElement.lang = langConfig.code;
  document.documentElement.dir = langConfig.dir;
  if (langConfig.dir === 'rtl') {
    document.documentElement.classList.add('rtl-layout');
  } else {
    document.documentElement.classList.remove('rtl-layout');
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
    hi: { translation: hi },
    te: { translation: te },
    ml: { translation: ml },
    kn: { translation: kn },
    bn: { translation: bn },
    mr: { translation: mr },
    gu: { translation: gu },
    pa: { translation: pa },
    ur: { translation: ur },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Set attributes on boot
applyLanguageAttributes(initialLang);

// Listen to language changes
i18n.on('languageChanged', (lng) => {
  applyLanguageAttributes(lng);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('clearclaim-lang', lng);
  }
});

export default i18n;
