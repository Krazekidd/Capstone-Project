import api from './axiosConfig';

export const updateProfile = async (profileData) => {
  const response = await api.patch('/api/v1/users/me', profileData);
  return response.data;
};

export const uploadProfileImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('avatar_url', imageFile);
  
  const response = await api.post('/api/v1/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await api.patch('/api/v1/users/me/password', passwordData);
  return response.data;
};
