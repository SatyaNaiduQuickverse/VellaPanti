import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, handleApiResponse, handleApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@ecommerce/types';

export const useLogin = () => {
  const { setAuth, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
      setLoading(true);
      const response = await api.post('/auth/login', data);
      return handleApiResponse<AuthResponse>(response);
    },
    onSuccess: (data) => {
      setAuth(data);
      setLoading(false);
      toast.success('Login successful!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      setLoading(false);
      const message = handleApiError(error);
      toast.error(message);
    },
  });
};

export const useRegister = () => {
  const { setAuth, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<AuthResponse> => {
      setLoading(true);
      const response = await api.post('/auth/register', data);
      return handleApiResponse<AuthResponse>(response);
    },
    onSuccess: (data) => {
      setAuth(data);
      setLoading(false);
      toast.success('Registration successful!');
    },
    onError: (error) => {
      setLoading(false);
      const message = handleApiError(error);
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
    toast.success('Logged out successfully');
  };
};