import api from './axiosConfig';

export const getConsultationTypes = async () => {
  const response = await api.get('/api/v1/bookings/consultation-types');
  return response.data;
};

export const getConsultationType = async (slug) => {
  const response = await api.get(`/api/v1/bookings/consultation-types/${slug}`);
  return response.data;
};

export const getAvailability = async (consultationTypeId, date) => {
  const response = await api.get('/api/v1/bookings/availability', {
    params: { consultation_type_id: consultationTypeId, date }
  });
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post('/api/v1/bookings', bookingData);
  return response.data;
};

export const getUserBookings = async (statusFilter = null) => {
  const params = statusFilter ? { status_filter: statusFilter } : {};
  const response = await api.get('/api/v1/bookings', { params });
  return response.data;
};

export const getBooking = async (bookingId) => {
  const response = await api.get(`/api/v1/bookings/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId, reason = null) => {
  const response = await api.patch(`/api/v1/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};

// Enhanced consultation functions (need backend implementation)
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

export const getBookingHistory = async (limit = 10, offset = 0) => {
  const response = await api.get('/api/v1/bookings/history', {
    params: { limit, offset }
  });
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

export const rateConsultation = async (bookingId, rating, review) => {
  const response = await api.post(`/api/v1/bookings/${bookingId}/rate`, {
    rating,
    review
  });
  return response.data;
};

export const getConsultationStats = async () => {
  const response = await api.get('/api/v1/bookings/stats');
  return response.data;
};

export const checkConsultationEligibility = async (consultationTypeId) => {
  const response = await api.get(`/api/v1/bookings/eligibility/${consultationTypeId}`);
  return response.data;
};

export const sendConsultationReminder = async (bookingId) => {
  const response = await api.post(`/api/v1/bookings/${bookingId}/remind`);
  return response.data;
};
