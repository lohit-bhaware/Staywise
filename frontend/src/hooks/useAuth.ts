import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { LoginRequest, RegisterRequest } from '../types';

export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      login(data);
      queryClient.clear();
      navigate('/');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      login(data);
      queryClient.clear();
      navigate('/');
    },
  });

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate('/');
  };

  return {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'ADMIN',
    login: loginMutation,
    register: registerMutation,
    logout: handleLogout,
  };
}
