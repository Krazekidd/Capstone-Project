import api from './axiosConfig';

// Products
export const getProducts = async (filters = {}) => {
  const response = await api.get('/api/v1/shop/products', { params: filters });
  return response.data;
};

export const getProduct = async (slug) => {
  const response = await api.get(`/api/v1/shop/products/${slug}`);
  return response.data;
};

// Product Reviews
export const createProductReview = async (productId, reviewData) => {
  const response = await api.post(`/api/v1/shop/products/${productId}/reviews`, reviewData);
  return response.data;
};

export const getProductReviews = async (productId, filters = {}) => {
  const response = await api.get(`/api/v1/shop/products/${productId}/reviews`, { params: filters });
  return response.data;
};

// Wishlist
export const getWishlist = async () => {
  const response = await api.get('/api/v1/shop/wishlists');
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await api.post('/api/v1/shop/wishlists', { product_id: productId });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/api/v1/shop/wishlists/${productId}`);
  return response.data;
};

// Orders
export const createOrder = async (orderData) => {
  const response = await api.post('/api/v1/shop/orders', orderData);
  return response.data;
};

export const getOrders = async (filters = {}) => {
  const response = await api.get('/api/v1/shop/orders', { params: filters });
  return response.data;
};

export const getOrder = async (orderId) => {
  const response = await api.get(`/api/v1/shop/orders/${orderId}`);
  return response.data;
};
