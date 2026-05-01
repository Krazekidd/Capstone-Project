import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
                const refresh_token = localStorage.getItem('refresh_token');
                if (refresh_token) {
                    const response = await axiosInstance.post('/auth/refresh', { refresh_token });
                    const data = response.data;
                    
                    // Store new tokens
                    localStorage.setItem('access_token', data.access_token);
                    if (data.refresh_token) {
                        localStorage.setItem('refresh_token', data.refresh_token);
                    }
                    localStorage.setItem('user_id', data.user?.id || data.user_id);
                    
                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_role');
                localStorage.removeItem('user_id');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;