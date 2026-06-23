import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import api from '../api/axios';

type User = {
  id: string;
  name?: string;
  email: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  level?: number;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
};

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (data: any) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  getMyProfile: () => Promise<void>;

  setCurrentUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  immer((set) => ({
    users: [],
    currentUser: null,
    isLoading: false,
    error: null,

    fetchAllUsers: async () => {
      set((state) => { state.isLoading = true; });
      try {
        const res = await api.get('/api/v1/user/admin/users');
        console.log(res.data)
        set((state) => { 
          state.users = res.data.data || res.data; 
        });
      } catch (error: any) {
        set((state) => { state.error = error.response?.data?.error || "Failed to fetch users"; });
      } finally {
        set((state) => { state.isLoading = false; });
      }
    },

    fetchUserById: async (id: string) => {
      try {
        const res = await api.get(`/api/v1/user/admin/users/${id}`);
        set((state) => { state.currentUser = res.data.data || res.data; });
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    },

    createUser: async (data) => {
      const res = await api.post('/api/v1/user/admin/users/create', data);
      set((state) => {
        state.users.unshift(res.data.user || res.data);
      });
    },

    updateUser: async (id: string, data: Partial<User>) => {
      const res = await api.patch(`/api/v1/user/admin/users/${id}`, data);
      set((state) => {
        const index = state.users.findIndex(u => u.id === id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...res.data.user };
        }
      });
    },

    deleteUser: async (id: string) => {
      await api.delete(`/api/v1/user/admin/users/${id}`);
      set((state) => {
        state.users = state.users.filter(u => u.id !== id);
      });
    },

    updateProfile: async (data) => {
      const res = await api.patch('/api/v1/user/profile', data);
      set((state) => {
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, ...res.data.user };
        }
      });
    },

    getMyProfile: async () => {
      const res = await api.get('/api/v1/user/me');
      set((state) => { state.currentUser = res.data.user; });
    },

    setCurrentUser: (user) => set((state) => { state.currentUser = user; }),
    setLoading: (loading) => set((state) => { state.isLoading = loading; }),
  }))
);