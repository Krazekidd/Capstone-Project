import api from './axiosConfig';

export const getMembershipPlans = async () => {
  const response = await api.get('/api/v1/memberships/plans');
  return response.data;
};

export const getMembershipPlan = async (planId) => {
  const response = await api.get(`/api/v1/memberships/plans/${planId}`);
  return response.data;
};

export const subscribeToPlan = async (planId, billingCycle = 'monthly') => {
  const response = await api.post('/api/v1/memberships/subscribe', null, {
    params: { plan_id: planId, billing_cycle: billingCycle }
  });
  return response.data;
};

export const getUserMembership = async () => {
  const response = await api.get('/api/v1/memberships/mine');
  return response.data;
};

export const cancelMembership = async () => {
  const response = await api.delete('/api/v1/memberships/mine');
  return response.data;
};
