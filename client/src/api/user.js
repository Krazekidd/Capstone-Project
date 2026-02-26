import api from './axiosConfig';

export const updateProfile = async (profileData) => {
  const response = await api.put('/api/user/profile', profileData);
  return response.data;
};

export const uploadProfileImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await api.post('/api/user/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateBodyMetrics = async (metricsData) => {
  const response = await api.put('/api/user/metrics', metricsData);
  return response.data;
};

export const getBodyMetrics = async () => {
  const response = await api.get('/api/user/metrics');
  return response.data;
};
