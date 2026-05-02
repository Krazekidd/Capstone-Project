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
      
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_id', data.user_id);
      }
      
      return data;
    } catch (error) {
      console.error('Google login API error:', error);
      throw error.response?.data || { detail: 'Google login failed' };
    }
  },

  googleCallback: async (code) => {
      try {
          const response = await axiosInstance.get(`/auth/google/callback?code=${code}`);
          const data = response.data;
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user_role', data.role);
          localStorage.setItem('user_id', data.user_id);
          return data;
      } catch (error) {
          throw error.response?.data || { detail: 'Google callback failed' };
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
  saveProgress: async (measurements) => {
    try {
      // Send all measurements as a single object to body_measurements
      const response = await axiosInstance.post('/account/progress', measurements);
      return response.data;
    } catch (error) {
      console.error('Save progress error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to save progress' };
    }
  },
  
  getProgressHistory: async (limit = 12) => {
    try {
      // Get history from body_measurements table
      const response = await axiosInstance.get(`/account/progress/history?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Get history error:', error.response?.data);
      return [];
    }
  },
  
  getLatestProgress: async () => {
    try {
      const response = await axiosInstance.get('/account/progress/latest');
      return response.data;
    } catch (error) {
      console.error('Get latest error:', error.response?.data);
      return null;
    }
  },

  // Goals - These should work with client_goals table
  getGoals: async () => {
    try {
      const response = await axiosInstance.get('/account/goals');
      return response.data;
    } catch (error) {
      console.error('Get goals error:', error.response?.data);
      return null;
    }
  },
  
  updateGoals: async (goals) => {
    try {
      const response = await axiosInstance.put('/account/goals', goals);
      return response.data;
    } catch (error) {
      console.error('Update goals error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to update goals' };
    }
  },
  
  // Health Conditions
  getHealthConditions: async () => {
    try {
      const response = await axiosInstance.get('/account/health-conditions');
      return response.data || [];
    } catch (error) {
      console.error('Get health conditions error:', error.response?.data);
      return [];
    }
  },
  
  updateHealthConditions: async (conditions) => {
    try {
      const response = await axiosInstance.put('/account/health-conditions', { conditions });
      return response.data;
    } catch (error) {
      console.error('Update health conditions error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to update health conditions' };
    }
  },
  
  // Water Intake
  getWaterIntake: async () => {
    try {
      const response = await axiosInstance.get('/account/water-intake');
      return response.data || { cups_consumed: 0 };
    } catch (error) {
      console.error('Get water intake error:', error.response?.data);
      return { cups_consumed: 0 };
    }
  },
  
  logWaterIntake: async (cups) => {
    try {
      const response = await axiosInstance.post('/account/water-intake/log', { cups_consumed: cups });
      return response.data;
    } catch (error) {
      console.error('Log water intake error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to log water intake' };
    }
  },
  
  // Strength Records
  getStrengthRecords: async () => {
    try {
      const response = await axiosInstance.get('/account/strength-records');
      return response.data || [];
    } catch (error) {
      console.error('Get strength records error:', error.response?.data);
      return [];
    }
  },
  
  updateStrengthRecord: async (exerciseName, data) => {
    try {
      const response = await axiosInstance.put(`/account/strength-records/${exerciseName}`, data);
      return response.data;
    } catch (error) {
      console.error('Update strength record error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to update strength record' };
    }
  },
  
  // Trainer Ratings
  getTrainerRatings: async () => {
    try {
      const response = await axiosInstance.get('/account/trainer-ratings');
      return response.data || { ratings: [], average_rating: 0, total_ratings: 0 };
    } catch (error) {
      console.error('Get trainer ratings error:', error.response?.data);
      return { ratings: [], average_rating: 0, total_ratings: 0 };
    }
  },
  
  rateTrainer: async (trainerName, rating) => {
    try {
      const response = await axiosInstance.post('/account/trainer-ratings', { trainer_name: trainerName, rating });
      return response.data;
    } catch (error) {
      console.error('Rate trainer error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to rate trainer' };
    }
  },
  
  // Badges
  getBadges: async () => {
    try {
      const response = await axiosInstance.get('/account/badges');
      return response.data || [];
    } catch (error) {
      console.error('Get badges error:', error.response?.data);
      return [];
    }
  },
  
  // Training Schedule
  getTrainingSchedule: async () => {
    try {
      const response = await axiosInstance.get('/account/training-schedule');
      return response.data || [];
    } catch (error) {
      console.error('Get training schedule error:', error.response?.data);
      return [];
    }
  },
  
  updateTrainingSchedule: async (scheduleId, data) => {
    try {
      const response = await axiosInstance.put(`/account/training-schedule/${scheduleId}`, data);
      return response.data;
    } catch (error) {
      console.error('Update training schedule error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to update training schedule' };
    }
  },
};

export const excursionsAPI = {
  getMyAccount: async () => {
    try {
      const response = await axiosInstance.get('/account/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch account' };
    }
  },
  
  getExcursions: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/excursions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch excursions' };
    }
  },
  
  getExcursionById: async (excursionId) => {
    try {
      const response = await axiosInstance.get(`/excursions/${excursionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch excursion' };
    }
  },
  
  bookExcursion: async (bookingData) => {
    try {
      const response = await axiosInstance.post('/excursions/book', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to book excursion' };
    }
  },
  
  getMyBookings: async () => {
    try {
      const response = await axiosInstance.get('/excursions/bookings/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch bookings' };
    }
  },
  
  cancelBooking: async (bookingId) => {
    try {
      const response = await axiosInstance.delete(`/excursions/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to cancel booking' };
    }
  },
  
  getMLRecommendations: async () => {
    try {
      const response = await axiosInstance.get('/excursions/recommendations/ml');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch recommendations' };
    }
  },
};

export const consultationsAPI = {
  getConsultationTypes: async () => {
    try {
      const response = await axiosInstance.get('/consultations/types');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch consultation types' };
    }
  },
  
  getAvailability: async (date) => {
    try {
      const response = await axiosInstance.get(`/consultations/availability/${date}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch availability' };
    }
  },
  
  bookConsultation: async (bookingData) => {
    try {
      const response = await axiosInstance.post('/consultations/book', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to book consultation' };
    }
  },
  
  getMyConsultations: async () => {
    try {
      const response = await axiosInstance.get('/consultations/my-bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch consultations' };
    }
  },
  
  cancelConsultation: async (bookingId) => {
    try {
      const response = await axiosInstance.delete(`/consultations/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to cancel consultation' };
    }
  },
};

export const shopAPI = {
  // Categories
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/shop/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch categories' };
    }
  },
  
  // Products
  getProducts: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/shop/products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch products' };
    }
  },
  
  getProductById: async (productId) => {
    try {
      const response = await axiosInstance.get(`/shop/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch product' };
    }
  },
  
  // Cart
  getCart: async () => {
    try {
      const response = await axiosInstance.get('/shop/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch cart' };
    }
  },
  
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await axiosInstance.post('/shop/cart/add', { product_id: productId, quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to add to cart' };
    }
  },
  
  updateCartItem: async (productId, quantity) => {
    try {
      const response = await axiosInstance.put('/shop/cart/update', { product_id: productId, quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update cart' };
    }
  },
  
  removeFromCart: async (productId) => {
    try {
      const response = await axiosInstance.delete(`/shop/cart/remove/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to remove from cart' };
    }
  },
  
  clearCart: async () => {
    try {
      const response = await axiosInstance.delete('/shop/cart/clear');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to clear cart' };
    }
  },
  
  // Wishlist
  getWishlist: async () => {
    try {
      const response = await axiosInstance.get('/shop/wishlist');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch wishlist' };
    }
  },
  
  addToWishlist: async (productId) => {
    try {
      const response = await axiosInstance.post('/shop/wishlist/add', { product_id: productId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to add to wishlist' };
    }
  },
  
  removeFromWishlist: async (productId) => {
    try {
      const response = await axiosInstance.delete(`/shop/wishlist/remove/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to remove from wishlist' };
    }
  },
  
  // Orders
  placeOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/shop/order/place', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to place order' };
    }
  },
  
  getMyOrders: async () => {
    try {
      const response = await axiosInstance.get('/shop/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch orders' };
    }
  },
};

export const adminAPI = {
  getAllClients: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/all-clients');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch clients' };
    }
  },
  
  getAllTrainers: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/all-trainers');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch trainers' };
    }
  },
  
  createExcursion: async (excursionData) => {
    try {
      const response = await axiosInstance.post('/account/admin/excursions', excursionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to create excursion' };
    }
  },
  
  updateExcursion: async (excursionId, excursionData) => {
    try {
      const response = await axiosInstance.put(`/account/admin/excursions/${excursionId}`, excursionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update excursion' };
    }
  },
  
  deleteExcursion: async (excursionId) => {
    try {
      const response = await axiosInstance.delete(`/account/admin/excursions/${excursionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to delete excursion' };
    }
  },
  
  saveTrainerAssessment: async (assessmentData) => {
    try {
      const response = await axiosInstance.post('/account/admin/trainer-assessments', assessmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to save assessment' };
    }
  },
  
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/dashboard-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch stats' };
    }
  },

  getClientStatusCounts: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/client-status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch status counts' };
    }
  },
  
  getClientsWithStatus: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/clients-with-status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch clients' };
    }
  },
  
  getTrainerAssessments: async (trainerId) => {
    try {
      const response = await axiosInstance.get(`/account/admin/trainer-assessments/${trainerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch assessments' };
    }
  },
  
  getAdminOrders: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await axiosInstance.get('/account/admin/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Get admin orders error:', error);
      return []; // Return empty array on error
    }
  },
  
  updateOrderStatus: async (orderId, statusData) => {
    try {
      const response = await axiosInstance.put(`/account/admin/orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error.response?.data || { detail: 'Failed to update order' };
    }
  },

  sendBirthdayEmail: async (clientId, message) => {
    try {
      const response = await axiosInstance.post('/account/admin/send-birthday-email', {
        client_id: clientId,
        message: message
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to send birthday email' };
    }
  },
  
  getTodayBirthdays: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/today-birthdays');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch today\'s birthdays' };
    }
  },

};