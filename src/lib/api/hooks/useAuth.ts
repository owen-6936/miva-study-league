import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';

export const useAuth = () => {
  const { login: setAuth } = useAuthStore();

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
    return res;
  };

  const register = async (data: { email: string; fullName: string; matricNumber: string; password: string }) => {
    const res = await apiClient.post('/auth/register', data);
    return res;
  };

  const forgotPassword = async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res;
  };

  const resetPassword = async (token: string, password: string) => {
    const res = await apiClient.post('/auth/reset-password', { token, password });
    return res;
  };

  const logout = async () => {
    const { logout: clearAuth } = useAuthStore.getState();
    clearAuth();
    // try { await apiClient.post('/auth/logout'); } catch {}
  };

  return { login, register, forgotPassword, resetPassword, logout };
};
