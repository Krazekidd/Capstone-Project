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

export const rescheduleBooking = async (bookingId, newDate, newTime) => {
  const response = await api.patch(`/api/v1/bookings/${bookingId}/reschedule`, {
    new_date: newDate,
    new_time: newTime
  });
  return response.data;
};

export const confirmBooking = async (bookingId) => {
  const response = await api.patch(`/api/v1/bookings/${bookingId}/confirm`);
  return response.data;
};

export const getBookingHistory = async (limit = 10) => {
  const response = await api.get('/api/v1/bookings/history', { params: { limit } });
  return response.data;
};

export const getUpcomingBookings = async () => {
  const response = await api.get('/api/v1/bookings/upcoming');
  return response.data;
};

export const getPastBookings = async () => {
  const response = await api.get('/api/v1/bookings/past');
  return response.data;
};

export const addBookingNote = async (bookingId, note) => {
  const response = await api.post(`/api/v1/bookings/${bookingId}/notes`, { note });
  return response.data;
};

export const getBookingNotes = async (bookingId) => {
  const response = await api.get(`/api/v1/bookings/${bookingId}/notes`);
  return response.data;
};

export const rateConsultation = async (bookingId, rating, feedback) => {
  const response = await api.post(`/api/v1/bookings/${bookingId}/rate`, {
    rating,
    feedback
  });
  return response.data;
};

export const getConsultationStats = async () => {
  const response = await api.get('/api/v1/bookings/stats');
  return response.data;
};

export const checkBookingEligibility = async (consultationTypeId) => {
  const response = await api.get(`/api/v1/bookings/check-eligibility/${consultationTypeId}`);
  return response.data;
};

export const sendBookingReminder = async (bookingId) => {
  const response = await api.post(`/api/v1/bookings/${bookingId}/remind`);
  return response.data;
};
