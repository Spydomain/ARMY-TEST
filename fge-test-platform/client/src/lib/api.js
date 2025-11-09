import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const lang = localStorage.getItem('lang') || 'en';
  // Attach language as query param by default
  if (!config.params) config.params = {};
  if (config.params.language == null) config.params.language = lang;

  // Attach auth token if available
  const token = localStorage.getItem('auth');
  if (token && token !== 'guest') {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
