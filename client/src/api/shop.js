import api from './axiosConfig';

export const getProducts = async () => {
  const response = await api.get('/api/products');
  return response.data;
};

export const getProductById = async (productId) => {
  const response = await api.get(`/api/products/${productId}`);
  return response.data;
};

export const addToCart = async (productId, quantity) => {
  const response = await api.post('/api/cart/add', { productId, quantity });
  return response.data;
};

export const getCart = async () => {
  const response = await api.get('/api/cart');
  return response.data;
};

export const checkout = async (paymentData) => {
  const response = await api.post('/api/cart/checkout', paymentData);
  return response.data;
};
