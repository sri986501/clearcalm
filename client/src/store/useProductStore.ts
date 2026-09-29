import { create } from 'zustand';
import api from '../lib/axios';

export interface InsuranceProduct {
  id: string;
  _id?: string;
  providerName: string;
  isDemoProvider: boolean;
  category: 'health' | 'vehicle' | 'life' | 'travel' | 'property';
  planName: string;
  tagline: string;
  description: string;
  sumInsured: number;
  annualPremiumBase: number;
  deductible: number;
  claimSettlementRatio: string;
  rating: string;
  features: string[];
  exclusions: string[];
  popular?: boolean;
}

interface ProductState {
  products: InsuranceProduct[];
  selectedCategory: string;
  searchQuery: string;
  selectedProduct: InsuranceProduct | null;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (category?: string, search?: string) => Promise<void>;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (prod: InsuranceProduct | null) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedCategory: 'all',
  searchQuery: '',
  selectedProduct: null,
  isLoading: false,
  error: null,

  fetchProducts: async (category, search) => {
    set({ isLoading: true, error: null });
    try {
      const cat = category !== undefined ? category : get().selectedCategory;
      const q = search !== undefined ? search : get().searchQuery;
      
      const params: any = {};
      if (cat && cat !== 'all') params.category = cat;
      if (q) params.search = q;

      const res = await api.get('/insurance-products', { params });
      set({ products: res.data.products || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load products', isLoading: false });
    }
  },

  setSelectedCategory: (cat: string) => {
    set({ selectedCategory: cat });
    get().fetchProducts(cat);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchProducts(undefined, query);
  },

  setSelectedProduct: (prod: InsuranceProduct | null) => {
    set({ selectedProduct: prod });
  }
}));
