import api from './axiosConfig';

// Categories
export const getCategories = async () => {
  const response = await api.get('/api/v1/shop/categories');
  return response.data;
};

// Products
export const getProducts = async (filters = {}) => {
  const response = await api.get('/api/v1/shop/products', { params: filters });
  return response.data;
};

export const getProduct = async (slug) => {
  const response = await api.get(`/api/v1/shop/products/${slug}`);
  return response.data;
};

export const getProductById = async (productId) => {
  const response = await api.get(`/api/v1/shop/products/id/${productId}`);
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

export const getNewArrivals = async () => {
  const response = await api.get('/api/v1/shop/products/new');
  return response.data;
};

// Cart
export const getCart = async () => {
  const response = await api.get('/api/v1/shop/cart');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/api/v1/shop/cart/add', {
    product_id: productId,
    quantity
  });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await api.put('/api/v1/shop/cart/update', {
    product_id: productId,
    quantity
  });
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
  const response = await api.post('/api/v1/shop/wishlists', { product_id: productId });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/api/v1/shop/wishlists/${productId}`);
  return response.data;
};

export const moveWishlistToCart = async (productId) => {
  const response = await api.post(`/api/v1/shop/wishlists/${productId}/move-to-cart`);
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

// Product Reviews
export const createProductReview = async (productId, reviewData) => {
  const response = await api.post(`/api/v1/shop/products/${productId}/reviews`, reviewData);
  return response.data;
};

export const getProductReviews = async (productId, filters = {}) => {
  const response = await api.get(`/api/v1/shop/products/${productId}/reviews`, { params: filters });
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

// Shipping & Payment
export const getShippingMethods = async () => {
  const response = await api.get('/api/v1/shop/shipping-methods');
  return response.data;
};

export const calculateShipping = async (cartData, address) => {
  const response = await api.post('/api/v1/shop/shipping/calculate', {
    cart: cartData,
    address
  });
  return response.data;
};

export const getPaymentMethods = async () => {
  const response = await api.get('/api/v1/shop/payment-methods');
  return response.data;
};

export const applyDiscountCode = async (code) => {
  const response = await api.post('/api/v1/shop/discounts/apply', { code });
  return response.data;
};

export const removeDiscountCode = async () => {
  const response = await api.delete('/api/v1/shop/discounts/remove');
  return response.data;
};

// Inventory
export const checkProductStock = async (productId) => {
  const response = await api.get(`/api/v1/shop/products/${productId}/stock`);
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

export const submitReturnRequest = async (returnData) => {
  const response = await api.post('/api/v1/shop/returns', returnData);
  return response.data;
};

export const getReturnStatus = async (returnId) => {
  const response = await api.get(`/api/v1/shop/returns/${returnId}`);
  return response.data;
};
