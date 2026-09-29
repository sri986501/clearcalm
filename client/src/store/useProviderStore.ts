import { create } from 'zustand';

export type ProviderSourceState =
  | 'OFFICIAL_VERIFIED'
  | 'OFFICIAL_POLICY_PAGE'
  | 'SOURCE_CONFIRMED'
  | 'PENDING_VERIFICATION'
  | 'UNVERIFIED'
  | 'UNAVAILABLE'
  | 'BLOCKED'
  | 'UNKNOWN';

export type ProviderSourceType =
  | 'OFFICIAL_PROVIDER'
  | 'OFFICIAL_REGULATORY_SOURCE'
  | 'VERIFIED_DATABASE'
  | 'ADMIN_VERIFIED'
  | 'USER_SUBMITTED'
  | 'THIRD_PARTY'
  | 'UNKNOWN';

export interface InsuranceProvider {
  id: string;
  providerName: string;
  shortName: string;
  tagline: string;
  description: string;
  providerType: 'LIFE' | 'GENERAL' | 'HEALTH' | 'COMPOSITE';
  officialDomain: string;
  providerUrl: string;
  officialPolicyPageUrl?: string;
  sourceType: ProviderSourceType;
  sourceState: ProviderSourceState;
  sourceUrl: string;
  verifiedAt: string;
  lastCheckedAt: string;
  verificationMethod: string;
  regulatoryRegistrationNumber?: string;
  country: string;
  languageSupport: string[];
  categoriesOffered: ('health' | 'vehicle' | 'life' | 'travel' | 'property' | 'business')[];
  rating: string;
  claimSettlementRatio: string;
  customerCareContact: string;
  isPopular?: boolean;
  isSaved?: boolean;
}

export interface CategoryGuide {
  id: 'health' | 'vehicle' | 'life' | 'travel' | 'property' | 'business';
  name: string;
  shortExplanation: string;
  whatIsIt: string;
  whoShouldConsider: string[];
  commonCoverageAreas: string[];
  commonExclusions: string[];
  importantFactors: string[];
  documentsRequired: string[];
  questionsToAskBeforePurchasing: string[];
  pricingNote: string;
}

interface ProviderStoreState {
  providers: InsuranceProvider[];
  savedProviders: InsuranceProvider[];
  categories: CategoryGuide[];
  selectedCategory: string;
  searchQuery: string;
  sourceStateFilter: string;
  isLoading: boolean;
  error: string | null;
  
  // External Redirection Modal state
  redirectModal: {
    isOpen: boolean;
    provider: InsuranceProvider | null;
    destinationUrl: string;
    isPolicyPage?: boolean;
  };

  fetchProviders: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSavedProviders: (token?: string) => Promise<void>;
  toggleSaveProvider: (providerId: string, token?: string) => Promise<boolean>;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setSourceStateFilter: (filter: string) => void;
  openRedirectModal: (provider: InsuranceProvider, targetUrl?: string, isPolicyPage?: boolean) => void;
  closeRedirectModal: () => void;
}

const API_BASE = '/api';

export const useProviderStore = create<ProviderStoreState>((set, get) => ({
  providers: [],
  savedProviders: [],
  categories: [],
  selectedCategory: 'all',
  searchQuery: '',
  sourceStateFilter: 'all',
  isLoading: false,
  error: null,
  redirectModal: {
    isOpen: false,
    provider: null,
    destinationUrl: '',
    isPolicyPage: false
  },

  fetchProviders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/providers`);
      const data = await res.json();
      if (data.success) {
        set({ providers: data.data, isLoading: false });
      } else {
        set({ error: data.error || 'Failed to load providers', isLoading: false });
      }
    } catch (err: any) {
      console.warn('Provider fetch fallback:', err);
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      if (data.success) {
        set({ categories: data.data });
      }
    } catch (err) {
      console.warn('Categories fetch error:', err);
    }
  },

  fetchSavedProviders: async (token?: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/providers/saved`, { headers });
      const data = await res.json();
      if (data.success) {
        set({ savedProviders: data.data });
      }
    } catch (err) {
      console.warn('Saved providers error:', err);
    }
  },

  toggleSaveProvider: async (providerId: string, token?: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`${API_BASE}/providers/${providerId}/save`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      
      if (data.success) {
        // Update local state
        const providers = get().providers.map(p => 
          p.id === providerId ? { ...p, isSaved: data.isSaved } : p
        );
        set({ providers });
        get().fetchSavedProviders(token);
        return data.isSaved;
      }
      return false;
    } catch (err) {
      console.warn('Toggle save error:', err);
      return false;
    }
  },

  setSelectedCategory: (cat: string) => set({ selectedCategory: cat }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSourceStateFilter: (filter: string) => set({ sourceStateFilter: filter }),

  openRedirectModal: (provider: InsuranceProvider, targetUrl?: string, isPolicyPage?: boolean) => {
    set({
      redirectModal: {
        isOpen: true,
        provider,
        destinationUrl: targetUrl || (isPolicyPage && provider.officialPolicyPageUrl ? provider.officialPolicyPageUrl : provider.providerUrl),
        isPolicyPage: !!isPolicyPage
      }
    });
  },

  closeRedirectModal: () => {
    set({
      redirectModal: {
        isOpen: false,
        provider: null,
        destinationUrl: '',
        isPolicyPage: false
      }
    });
  }
}));
