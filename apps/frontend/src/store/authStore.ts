import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MEMBER';
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => set({ token, refreshToken, user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      logout: async () => {
        const refreshToken = get().refreshToken;
        try {
          await authApi.logout(refreshToken);
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ token: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

