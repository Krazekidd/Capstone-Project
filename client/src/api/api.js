import axiosInstance from './axiosConfig';

const API_BASE_URL = 'http://localhost:8000';

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      
      const data = response.data;
      // Store token and user info
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_id', data.user_id);
      return data;
    } catch (error) {
      throw error.response?.data || { detail: 'Login failed' };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register/client', userData);
      const data = response.data;
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_id', data.user_id);
      return data;
    } catch (error) {
      throw error.response?.data || { detail: 'Registration failed' };
    }
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('remembered_email');
  },
  
  verifyToken: async () => {
    try {
      const response = await axiosInstance.get('/auth/verify');
      return response.data;
    } catch (error) {
      return false;
    }
  },


  googleLogin: async (credential) => {
    try {
      const response = await axiosInstance.post('/auth/google', { credential });
      const data = response.data;
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_id', data.user_id);
      return data;
    } catch (error) {
      throw error.response?.data || { detail: 'Google login failed' };
    }
  },

  googleLoginWithToken: async (accessToken) => {
    try {
      const response = await axiosInstance.post('/auth/google/token', { access_token: accessToken });
      const data = response.data;
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_id', data.user_id);
      return data;
    } catch (error) {
      throw error.response?.data || { detail: 'Google login failed' };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to send reset email' };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', { token, new_password: newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to reset password' };
    }
  },

  getToken: () => localStorage.getItem('access_token'),
  getUserRole: () => localStorage.getItem('user_role'),
  getUserId: () => localStorage.getItem('user_id'),
};

export const accountAPI = {
  getMyAccount: async () => {
    try {
      const response = await axiosInstance.get('/account/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch account' };
    }
  },
  
  updateMyAccount: async (data) => {
    try {
      const response = await axiosInstance.put('/account/me', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update account' };
    }
  },
  
  updateProgress: async (progressData) => {
    try {
      const response = await axiosInstance.post('/account/progress', progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update progress' };
    }
  },
};

export const progressAPI = {
  saveMeasurements: async (data) => {
    try {
      const response = await axiosInstance.post('/account/progress', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to save measurements' };
    }
  },
  
  getHistory: async () => {
    try {
      const response = await axiosInstance.get('/account/progress/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to get history' };
    }
  },
  
  getGoals: async () => {
    try {
      const response = await axiosInstance.get('/account/goals');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to get goals' };
    }
  },
  
  updateGoals: async (goals) => {
    try {
      const response = await axiosInstance.put('/account/goals', goals);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update goals' };
    }
  },
};