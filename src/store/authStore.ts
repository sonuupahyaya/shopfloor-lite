import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { User, UserRole } from '../types';
import { saveUser, getUser, clearUser } from '../database';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const TENANT_ID = 'tenant_demo';

function generateMockToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: Crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      tenant: TENANT_ID,
    })
  );
  const signature = btoa(Crypto.randomUUID());
  return `${header}.${payload}.${signature}`;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, role: UserRole) => {
    const user: User = {
      id: Crypto.randomUUID(),
      email,
      role,
      tenantId: TENANT_ID,
      token: generateMockToken(),
    };

    await saveUser(user);
    await AsyncStorage.setItem('auth_token', user.token);

    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await clearUser();
    await AsyncStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    try {
      const user = await getUser();
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
