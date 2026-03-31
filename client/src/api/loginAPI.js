const API_BASE_URL = 'http://localhost:8000'; // Your FastAPI backend URL

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    // Store token and user info
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_id', data.user_id);
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
  },
  
  getToken: () => localStorage.getItem('access_token'),
  getUserRole: () => localStorage.getItem('user_role'),
  getUserId: () => localStorage.getItem('user_id'),
};

export const accountAPI = {
  getAccount: async (userId, role) => {
    const token = authAPI.getToken();
    const response = await fetch(
      `${API_BASE_URL}/account/${userId}?role=${role}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch account data');
    }
    
    return response.json();
  },
  
  updateAccount: async (userId, role, data) => {
    const token = authAPI.getToken();
    const response = await fetch(
      `${API_BASE_URL}/account/${userId}?role=${role}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update account');
    }
    
    return response.json();
  },
  
  updateProgress: async (userId, progressData) => {
    const token = authAPI.getToken();
    const response = await fetch(
      `${API_BASE_URL}/account/${userId}/progress`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update progress');
    }
    
    return response.json();
  },
};