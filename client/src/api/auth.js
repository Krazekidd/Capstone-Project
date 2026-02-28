import api from './axiosConfig';

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  localStorage.removeItem('token');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};
