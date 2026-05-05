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
      // Store tokens and user info
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      localStorage.setItem('user_role', data.user?.id ? 'client' : 'client'); // Fallback role
      localStorage.setItem('user_id', data.user?.id || data.user_id);
      return data;
    } catch (error) {
      throw error.response?.data || { detail: 'Login failed' };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      const data = response.data;
      // Store tokens and user info
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      localStorage.setItem('user_role', data.user?.id ? 'client' : 'client'); // Fallback role
      localStorage.setItem('user_id', data.user?.id || data.user_id);
      return data;
    } catch (error) {
      throw error.response?.data || { detail: 'Registration failed' };
    }
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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


  // Google auth not supported by backend yet
  // googleLogin: async (credential) => {
  //   try {
  //     const response = await axiosInstance.post('/auth/google', { credential });
  //     const data = response.data;
  //     
  //     if (data.access_token) {
  //       localStorage.setItem('access_token', data.access_token);
  //       if (data.refresh_token) {
  //         localStorage.setItem('refresh_token', data.refresh_token);
  //       }
  //       localStorage.setItem('user_role', data.user?.id ? 'client' : 'client');
  //       localStorage.setItem('user_id', data.user?.id || data.user_id);
  //     }
  //     
  //     return data;
  //   } catch (error) {
  //     console.error('Google login API error:', error);
  //     throw error.response?.data || { detail: 'Google login failed' };
  //   }
  // },

  // Google callback not supported by backend yet
  // googleCallback: async (code) => {
  //   try {
  //       const response = await axiosInstance.get(`/auth/google/callback?code=${code}`);
  //       const data = response.data;
  //       localStorage.setItem('access_token', data.access_token);
  //       localStorage.setItem('user_role', data.role);
  //       localStorage.setItem('user_id', data.user_id);
  //       return data;
  //   } catch (error) {
  //       throw error.response?.data || { detail: 'Google callback failed' };
  //   }
  // },
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

  refreshToken: async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (!refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post('/auth/refresh', { refresh_token });
      const data = response.data;
      
      // Store new tokens
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      localStorage.setItem('user_id', data.user?.id || data.user_id);
      
      return data;
    } catch (error) {
      // Refresh failed, clear tokens and redirect to login
      authAPI.logout();
      throw error.response?.data || { detail: 'Token refresh failed' };
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
  
  rateTrainer: async (trainerName, rating, comment = '', privacy = 'private') => {
    try {
      const response = await axiosInstance.post('/account/trainer-ratings', { 
        trainer_name: trainerName, 
        rating, 
        comment,
        privacy
      });
      return response.data;
    } catch (error) {
      console.error('Rate trainer error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to rate trainer' };
    }
  },
  
  updateTrainerRating: async (ratingId, rating, comment, privacy) => {
    try {
      const response = await axiosInstance.put(`/account/trainer-ratings/${ratingId}`, {
        rating,
        comment,
        privacy
      });
      return response.data;
    } catch (error) {
      console.error('Update trainer rating error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to update trainer rating' };
    }
  },

  deleteTrainerRating: async (ratingId) => {
    try {
      const response = await axiosInstance.delete(`/account/trainer-ratings/${ratingId}`);
      return response.data;
    } catch (error) {
      console.error('Delete trainer rating error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to delete trainer rating' };
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
  
  // Training Schedule/Attendance
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

  logAttendance: async (date, sessionType = 'am') => {
    try {
      const response = await axiosInstance.post('/account/attendance', {
        date,
        session_type: sessionType
      });
      return response.data;
    } catch (error) {
      console.error('Log attendance error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to log attendance' };
    }
  },

  getAttendanceHistory: async () => {
    try {
      const response = await axiosInstance.get('/account/attendance');
      return response.data || {};
    } catch (error) {
      console.error('Get attendance history error:', error.response?.data);
      return {};
    }
  },

  // Progress Photos
  uploadProgressPhoto: async (photoFile, date, category = 'front') => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('date', date);
      formData.append('category', category);
      
      const response = await axiosInstance.post('/account/progress-photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload progress photo error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to upload progress photo' };
    }
  },

  getProgressPhotos: async () => {
    try {
      const response = await axiosInstance.get('/account/progress-photos');
      return response.data || [];
    } catch (error) {
      console.error('Get progress photos error:', error.response?.data);
      return [];
    }
  },

  deleteProgressPhoto: async (photoId) => {
    try {
      const response = await axiosInstance.delete(`/account/progress-photos/${photoId}`);
      return response.data;
    } catch (error) {
      console.error('Delete progress photo error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to delete progress photo' };
    }
  },

  // Activity/Sessions tracking
  getSessionStats: async () => {
    try {
      const response = await axiosInstance.get('/account/session-stats');
      return response.data || { total_sessions: 0, current_streak: 0, attended_days: {} };
    } catch (error) {
      console.error('Get session stats error:', error.response?.data);
      return { total_sessions: 0, current_streak: 0, attended_days: {} };
    }
  },

  // Nutrition tracking
  getNutritionPlan: async () => {
    try {
      const response = await axiosInstance.get('/account/nutrition-plan');
      return response.data || null;
    } catch (error) {
      console.error('Get nutrition plan error:', error.response?.data);
      return null;
    }
  },

  updateNutritionGoals: async (goals) => {
    try {
      const response = await axiosInstance.put('/account/nutrition-goals', goals);
      return response.data;
    } catch (error) {
      console.error('Update nutrition goals error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to update nutrition goals' };
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
  // Enhanced excursion functions
  getExcursionsByLevel: async (level) => {
    try {
      const response = await axiosInstance.get('/excursions/by-level', {
        params: { level }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch excursions by level' };
    }
  },
  getExcursionsByDate: async (startDate, endDate) => {
    try {
      const response = await axiosInstance.get('/excursions/by-date', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch excursions by date' };
    }
  },
  getExcursionAvailability: async (excursionId) => {
    try {
      const response = await axiosInstance.get(`/excursions/${excursionId}/availability`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch availability' };
    }
  },
  checkExcursionEligibility: async (excursionId) => {
    try {
      const response = await axiosInstance.get(`/excursions/${excursionId}/check-eligibility`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to check eligibility' };
    }
  },
  getExcursionReviews: async (excursionId) => {
    try {
      const response = await axiosInstance.get(`/excursions/${excursionId}/reviews`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch reviews' };
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

export const shopAPI = {
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

  // Additional admin functions
  getMemberStats: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/member-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch member stats' };
    }
  },

  getRevenueStats: async (period = 'month') => {
    try {
      const response = await axiosInstance.get('/account/admin/revenue-stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch revenue stats' };
    }
  },

  getAttendanceStats: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/attendance-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch attendance stats' };
    }
  },

  getEquipmentStatus: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/equipment-status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch equipment status' };
    }
  },

  updateEquipmentStatus: async (equipmentId, statusData) => {
    try {
      const response = await axiosInstance.put(`/account/admin/equipment/${equipmentId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update equipment status' };
    }
  },

  getClassSchedule: async (date) => {
    try {
      const response = await axiosInstance.get('/account/admin/class-schedule', {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch class schedule' };
    }
  },

  updateClassSchedule: async (scheduleId, scheduleData) => {
    try {
      const response = await axiosInstance.put(`/account/admin/class-schedule/${scheduleId}`, scheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update class schedule' };
    }
  },

  getTrainerSchedule: async (trainerId, date) => {
    try {
      const response = await axiosInstance.get(`/account/admin/trainer-schedule/${trainerId}`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch trainer schedule' };
    }
  },

  createTrainerSchedule: async (scheduleData) => {
    try {
      const response = await axiosInstance.post('/account/admin/trainer-schedule', scheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to create trainer schedule' };
    }
  },

  getMemberProgress: async (memberId) => {
    try {
      const response = await axiosInstance.get(`/account/admin/member-progress/${memberId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch member progress' };
    }
  },

  updateMemberProgress: async (memberId, progressData) => {
    try {
      const response = await axiosInstance.put(`/account/admin/member-progress/${memberId}`, progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update member progress' };
    }
  },

  getMemberNotes: async (memberId) => {
    try {
      const response = await axiosInstance.get(`/account/admin/member-notes/${memberId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch member notes' };
    }
  },

  addMemberNote: async (memberId, noteData) => {
    try {
      const response = await axiosInstance.post(`/account/admin/member-notes/${memberId}`, noteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to add member note' };
    }
  },

  getSystemHealth: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/system-health');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch system health' };
    }
  },

  getAuditLogs: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/account/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch audit logs' };
    }
  },

  getReports: async (reportType, params = {}) => {
    try {
      const response = await axiosInstance.get(`/account/admin/reports/${reportType}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch reports' };
    }
  },

  generateReport: async (reportType, params) => {
    try {
      const response = await axiosInstance.post(`/account/admin/reports/${reportType}/generate`, params);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to generate report' };
    }
  },

  getNotifications: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch notifications' };
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await axiosInstance.patch(`/account/admin/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to mark notification as read' };
    }
  },

  sendNotification: async (notificationData) => {
    try {
      const response = await axiosInstance.post('/account/admin/notifications/send', notificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to send notification' };
    }
  },

  getSettings: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch settings' };
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const response = await axiosInstance.put('/account/admin/settings', settingsData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update settings' };
    }
  },

  getBackupStatus: async () => {
    try {
      const response = await axiosInstance.get('/account/admin/backup-status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch backup status' };
    }
  },

  createBackup: async (backupData) => {
    try {
      const response = await axiosInstance.post('/account/admin/backup', backupData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to create backup' };
    }
  },

  restoreBackup: async (backupId) => {
    try {
      const response = await axiosInstance.post(`/account/admin/restore/${backupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to restore backup' };
    }
  },
};

// Consultations API - Connected to backend /api/v1/bookings routes
export const consultationsAPI = {
  getConsultationTypes: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/bookings/consultation-types');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch consultation types' };
    }
  },

  getConsultationType: async (slug) => {
    try {
      const response = await axiosInstance.get(`/api/v1/bookings/consultation-types/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch consultation type' };
    }
  },

  getAvailability: async (consultationTypeId, date) => {
    try {
      const response = await axiosInstance.get('/api/v1/bookings/availability', {
        params: { consultation_type_id: consultationTypeId, date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch availability' };
    }
  },

  bookConsultation: async (bookingData) => {
    try {
      const response = await axiosInstance.post('/api/v1/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to book consultation' };
    }
  },

  getMyConsultations: async (statusFilter = null) => {
    try {
      const params = statusFilter ? { status_filter: statusFilter } : {};
      const response = await axiosInstance.get('/api/v1/bookings', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch consultations' };
    }
  },

  getBooking: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch booking' };
    }
  },

  cancelConsultation: async (bookingId, reason = null) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/bookings/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to cancel consultation' };
    }
  },

  // Enhanced consultation functions
  rescheduleBooking: async (bookingId, newDate, newTime) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/bookings/${bookingId}/reschedule`, {
        new_date: newDate,
        new_time: newTime
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to reschedule booking' };
    }
  },

  confirmBooking: async (bookingId) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/bookings/${bookingId}/confirm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to confirm booking' };
    }
  },

  getBookingHistory: async (limit = 10, offset = 0) => {
    try {
      const response = await axiosInstance.get('/api/v1/bookings/history', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch booking history' };
    }
  },

  getUpcomingBookings: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/bookings/upcoming');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch upcoming bookings' };
    }
  },

  getPastBookings: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/bookings/past');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch past bookings' };
    }
  },

  addBookingNote: async (bookingId, note) => {
    try {
      const response = await axiosInstance.post(`/api/v1/bookings/${bookingId}/notes`, { note });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to add booking note' };
    }
  },

  getBookingNotes: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/bookings/${bookingId}/notes`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch booking notes' };
    }
  },

  rateConsultation: async (bookingId, rating, review) => {
    try {
      const response = await axiosInstance.post(`/api/v1/bookings/${bookingId}/rate`, {
        rating,
        review
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to rate consultation' };
    }
  },

  getConsultationStats: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/bookings/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch consultation stats' };
    }
  },

  checkConsultationEligibility: async (consultationTypeId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/bookings/eligibility/${consultationTypeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to check eligibility' };
    }
  },

  sendConsultationReminder: async (bookingId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/bookings/${bookingId}/remind`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to send reminder' };
    }
  },
};