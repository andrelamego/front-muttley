import axios from 'axios';

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('usuario');
  localStorage.removeItem('muttley_logged_user');
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const url = config.url || '';
  const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (isAuthRoute) {
    delete config.headers.Authorization;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      clearAuthStorage();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    const data = error.response?.data;
    const validationErrors = Array.isArray(data?.errors) ? data.errors.join('\n') : undefined;
    const message =
      status === 403 ? 'Acesso negado. Você não tem permissão para executar esta ação.' :
      validationErrors ||
      data?.message ||
      data?.error ||
      error.message ||
      'Erro inesperado ao comunicar com a API.';

    return Promise.reject(new Error(message));
  },
);

export default apiClient;
