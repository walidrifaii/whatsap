import { create } from 'zustand';
import { getMe } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, loading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, loading: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { data } = await getMe();
      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, loading: false });
    }
  }
}));

export default useAuthStore;
