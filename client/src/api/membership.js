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

// Enhanced membership functions (need backend implementation)
export const updateMembership = async (membershipData) => {
  const response = await api.put('/api/v1/memberships/mine', membershipData);
  return response.data;
};

export const pauseMembership = async (reason) => {
  const response = await api.post('/api/v1/memberships/mine/pause', { reason });
  return response.data;
};

export const resumeMembership = async () => {
  const response = await api.post('/api/v1/memberships/mine/resume');
  return response.data;
};

export const getMembershipHistory = async () => {
  const response = await api.get('/api/v1/memberships/history');
  return response.data;
};

export const upgradeMembership = async (targetPlanId) => {
  const response = await api.post('/api/v1/memberships/mine/upgrade', { target_plan_id: targetPlanId });
  return response.data;
};

export const downgradeMembership = async (targetPlanId) => {
  const response = await api.post('/api/v1/memberships/mine/downgrade', { target_plan_id: targetPlanId });
  return response.data;
};

export const getMembershipBenefits = async (planId) => {
  const response = await api.get(`/api/v1/memberships/plans/${planId}/benefits`);
  return response.data;
};

export const checkMembershipEligibility = async (planId) => {
  const response = await api.get(`/api/v1/memberships/plans/${planId}/eligibility`);
  return response.data;
};

export const sendMembershipInquiry = async (inquiryData) => {
  const response = await api.post('/api/v1/memberships/inquiry', inquiryData);
  return response.data;
};
