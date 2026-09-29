import { create } from 'zustand';
import api from '../lib/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string, role?: 'user' | 'admin') => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setDemoUser: (asAdmin?: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('clearclaim_token'),
  isAuthenticated: Boolean(localStorage.getItem('clearclaim_token')),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('clearclaim_token', token);
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  },

  register: async (name, email, password, phone, role = 'user') => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', { name, email, password, phone, role });
      const { token, user } = res.data;
      localStorage.setItem('clearclaim_token', token);
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.error || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('clearclaim_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setDemoUser: (asAdmin = false) => {
    const demoUser: User = asAdmin
      ? { id: 'admin-user-id-999', name: 'Compliance Admin', email: 'admin@clearclaim.legal', role: 'admin' }
      : { id: 'demo-user-id-123', name: 'Aditya Sharma', email: 'aditya.sharma@example.com', role: 'user' };
    
    localStorage.setItem('clearclaim_token', 'demo-token-123');
    set({
      user: demoUser,
      token: 'demo-token-123',
      isAuthenticated: true
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('clearclaim_token');
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, isAuthenticated: true });
    } catch (e) {
      // Offline fallback
      set({
        user: { id: 'demo-user-id-123', name: 'Aditya Sharma', email: 'aditya.sharma@example.com', role: 'user' },
        isAuthenticated: true
      });
    }
  }
}));
