import api from './axiosConfig';

export const getConsultationTypes = async () => {
  const response = await api.get('/api/v1/bookings/consultation-types');
  return response.data;
};

export const getConsultationType = async (slug) => {
  const response = await api.get(`/api/v1/bookings/consultation-types/${slug}`);
  return response.data;
};

export const getAvailability = async (consultationTypeId, date, timezone = 'America/New_York') => {
  const response = await api.get('/api/v1/bookings/availability', {
    params: { consultation_type_id: consultationTypeId, date, timezone }
  });
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post('/api/v1/bookings', bookingData);
  return response.data;
};

export const getUserBookings = async (filters = {}) => {
  const response = await api.get('/api/v1/bookings', { params: filters });
  return response.data;
};

export const getBooking = async (bookingId) => {
  const response = await api.get(`/api/v1/bookings/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId, reason) => {
  const response = await api.patch(`/api/v1/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};
