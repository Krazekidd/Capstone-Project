import api from './axiosConfig';

export const bookConsultation = async (consultationData) => {
  const response = await api.post('/api/consultations/book', consultationData);
  return response.data;
};

export const getUserConsultations = async () => {
  const response = await api.get('/api/consultations/user');
  return response.data;
};

export const cancelConsultation = async (consultationId) => {
  const response = await api.delete(`/api/consultations/${consultationId}`);
  return response.data;
};
