import api from './axiosConfig';

// Categories
export const getCategories = async () => {
  const response = await api.get('/api/v1/shop/categories');
  return response.data;
};

// Products
export const getProducts = async (params = {}) => {
  const response = await api.get('/api/v1/shop/products', { params });
  return response.data;
};

export const getProductById = async (slug) => {
  const response = await api.get(`/api/v1/shop/products/${slug}`);
  return response.data;
};

export const searchProducts = async (query, filters = {}) => {
  const response = await api.get('/api/v1/shop/products/search', {
    params: { q: query, ...filters }
  });
  return response.data;
};

export const getFeaturedProducts = async () => {
  const response = await api.get('/api/v1/shop/products/featured');
  return response.data;
};

export const getNewProducts = async () => {
  const response = await api.get('/api/v1/shop/products/new');
  return response.data;
};

// Cart
export const getCart = async () => {
  const response = await api.get('/api/v1/shop/cart');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/api/v1/shop/cart/add', { product_id: productId, quantity });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await api.put('/api/v1/shop/cart/update', { product_id: productId, quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/api/v1/shop/cart/remove/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/api/v1/shop/cart/clear');
  return response.data;
};

export const getCartSummary = async () => {
  const response = await api.get('/api/v1/shop/cart/summary');
  return response.data;
};

// Wishlist
export const getWishlist = async () => {
  const response = await api.get('/api/v1/shop/wishlists');
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await api.post('/api/v1/shop/wishlists', null, {
    params: { product_id: productId }
  });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/api/v1/shop/wishlists/${productId}`);
  return response.data;
};

export const moveWishlistToCart = async (productId, quantity = 1) => {
  const response = await api.post('/api/v1/shop/wishlists/to-cart', {
    product_id: productId,
    quantity
  });
  return response.data;
};

// Orders
export const placeOrder = async (orderData) => {
  const response = await api.post('/api/v1/shop/orders', orderData);
  return response.data;
};

export const getOrders = async (statusFilter = null) => {
  const params = statusFilter ? { status_filter: statusFilter } : {};
  const response = await api.get('/api/v1/shop/orders', { params });
  return response.data;
};

export const getOrder = async (orderId) => {
  const response = await api.get(`/api/v1/shop/orders/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/api/v1/shop/orders/${orderId}/status`, { status });
  return response.data;
};

export const cancelOrder = async (orderId, reason) => {
  const response = await api.patch(`/api/v1/shop/orders/${orderId}/cancel`, { reason });
  return response.data;
};

export const trackOrder = async (orderId) => {
  const response = await api.get(`/api/v1/shop/orders/${orderId}/track`);
  return response.data;
};

// Reviews
export const createProductReview = async (productId, reviewData) => {
  const response = await api.post(`/api/v1/shop/products/${productId}/reviews`, reviewData);
  return response.data;
};

export const getProductReviews = async (productId, limit = 10, offset = 0) => {
  const response = await api.get(`/api/v1/shop/products/${productId}/reviews`, {
    params: { limit, offset }
  });
  return response.data;
};

export const updateProductReview = async (reviewId, reviewData) => {
  const response = await api.put(`/api/v1/shop/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const deleteProductReview = async (reviewId) => {
  const response = await api.delete(`/api/v1/shop/reviews/${reviewId}`);
  return response.data;
};

// Shipping
export const getShippingMethods = async () => {
  const response = await api.get('/api/v1/shop/shipping/methods');
  return response.data;
};

export const calculateShipping = async (address, items) => {
  const response = await api.post('/api/v1/shop/shipping/calculate', {
    address,
    items
  });
  return response.data;
};

// Payment
export const getPaymentMethods = async () => {
  const response = await api.get('/api/v1/shop/payment/methods');
  return response.data;
};

export const processPayment = async (paymentData) => {
  const response = await api.post('/api/v1/shop/payment/process', paymentData);
  return response.data;
};

// Discounts
export const applyDiscount = async (code) => {
  const response = await api.post('/api/v1/shop/discounts/apply', { code });
  return response.data;
};

export const removeDiscount = async () => {
  const response = await api.delete('/api/v1/shop/discounts/remove');
  return response.data;
};

// Inventory
export const checkInventory = async (productId) => {
  const response = await api.get(`/api/v1/shop/products/${productId}/inventory`);
  return response.data;
};

export const getProductVariants = async (productId) => {
  const response = await api.get(`/api/v1/shop/products/${productId}/variants`);
  return response.data;
};

// Customer Service
export const contactSupport = async (supportData) => {
  const response = await api.post('/api/v1/shop/support/contact', supportData);
  return response.data;
};

export const createReturnRequest = async (returnData) => {
  const response = await api.post('/api/v1/shop/returns', returnData);
  return response.data;
};

export const getReturnStatus = async (returnId) => {
  const response = await api.get(`/api/v1/shop/returns/${returnId}`);
  return response.data;
};
