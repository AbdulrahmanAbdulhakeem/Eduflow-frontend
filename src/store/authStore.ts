import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ROLES } from '../constants';

type User = {
  id: string;
  email: string;
  name?: string;
  role: keyof typeof ROLES;
  avatar?: string;
  level?: number;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) =>
        set((state) => {
          state.user = userData;
          state.isAuthenticated = true;
        }),

      logout: () =>
        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
        }),

      updateUser: (updates) =>
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updates);
          }
        }),
    })),

    {
      name: 'eduflow-auth', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);