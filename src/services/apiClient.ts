import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const validationErrors = Array.isArray(data?.errors) ? data.errors.join('\n') : undefined;
    const message =
      validationErrors ||
      data?.message ||
      data?.error ||
      error.message ||
      'Erro inesperado ao comunicar com a API.';

    return Promise.reject(new Error(message));
  },
);

export default apiClient;
