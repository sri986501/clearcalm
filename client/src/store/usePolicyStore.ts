import { create } from 'zustand';
import api from '../lib/axios';

export interface PolicyItem {
  id: string;
  _id?: string;
  userId: string;
  policyNumber: string;
  productId: string;
  providerName: string;
  planName: string;
  category: 'health' | 'vehicle' | 'life' | 'travel' | 'property';
  policyHolderName: string;
  policyHolderEmail: string;
  policyHolderPhone: string;
  nomineeName?: string;
  nomineeRelation?: string;
  coverageAmount: number;
  annualPremium: number;
  startDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
  paymentId: string;
  transactionId: string;
  createdAt: string;
}

export interface PaymentTransactionItem {
  id: string;
  userId: string;
  policyId?: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  gateway: string;
  paymentMethod: string;
  planName: string;
  createdAt: string;
}

interface PolicyState {
  policies: PolicyItem[];
  transactions: PaymentTransactionItem[];
  isLoading: boolean;
  isPurchasing: boolean;
  purchaseError: string | null;
  activePurchasePolicy: PolicyItem | null;
  fetchPolicies: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  createPaymentOrder: (params: {
    productId: string;
    coverageAmount: number;
    tenureYears: number;
    customerDetails: any;
  }) => Promise<any>;
  verifyPaymentAndIssuePolicy: (paymentData: {
    orderId: string;
    paymentId: string;
    amount: number;
    currency?: string;
    productId: string;
    coverageAmount: number;
    tenureYears: number;
    customerDetails: any;
    paymentMethod?: string;
  }) => Promise<PolicyItem>;
  clearActivePurchase: () => void;
}

export const usePolicyStore = create<PolicyState>((set, get) => ({
  policies: [],
  transactions: [],
  isLoading: false,
  isPurchasing: false,
  purchaseError: null,
  activePurchasePolicy: null,

  fetchPolicies: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/policies');
      set({ policies: res.data.policies || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async () => {
    try {
      const res = await api.get('/payments/history');
      set({ transactions: res.data.transactions || [] });
    } catch (err: any) {
      // ignore
    }
  },

  createPaymentOrder: async (params) => {
    set({ isPurchasing: true, purchaseError: null });
    try {
      const res = await api.post('/payments/create', params);
      return res.data.order;
    } catch (err: any) {
      set({ isPurchasing: false, purchaseError: err.response?.data?.error || 'Order creation failed' });
      throw err;
    }
  },

  verifyPaymentAndIssuePolicy: async (paymentData) => {
    set({ isPurchasing: true, purchaseError: null });
    try {
      const res = await api.post('/payments/verify', paymentData);
      const newPolicy = res.data.policy;
      
      // Update local policies state immediately
      set((state) => ({
        policies: [newPolicy, ...state.policies],
        activePurchasePolicy: newPolicy,
        isPurchasing: false
      }));

      // Refresh transactions and policies list
      get().fetchTransactions();
      return newPolicy;
    } catch (err: any) {
      set({ isPurchasing: false, purchaseError: err.response?.data?.error || 'Payment verification failed' });
      throw err;
    }
  },

  clearActivePurchase: () => {
    set({ activePurchasePolicy: null, purchaseError: null });
  }
}));
