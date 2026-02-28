import api from './axiosConfig';

export const getMemberships = async () => {
  const response = await api.get('/api/memberships');
  return response.data;
};

export const purchaseMembership = async (membershipId, paymentData) => {
  const response = await api.post('/api/memberships/purchase', {
    membershipId,
    ...paymentData,
  });
  return response.data;
};

export const getUserMembership = async () => {
  const response = await api.get('/api/memberships/user');
  return response.data;
};
