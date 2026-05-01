import api from './axiosConfig';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  localStorage.removeItem('token');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/userinfo');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/change-password', { 
    current_password: currentPassword, 
    new_password: newPassword 
  });
  return response.data;
};

// Google auth not supported by backend yet
// export const googleLogin = async (credential) => {
//   const response = await api.post('/auth/google', { credential });
//   return response.data;
// };
