import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create separate axios instance for refresh requests (no auth header)
const refreshAxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',
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

let isRefreshing = false;
let refreshSubscribers = [];

function addRefreshSubscriber(callback) {
    refreshSubscribers.push(callback);
}

function notifyRefreshSubscribers(token) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            if (isRefreshing) {
                // If already refreshing, queue the request
                return new Promise((resolve, reject) => {
                    addRefreshSubscriber((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }
            
            isRefreshing = true;
            
            try {
                // Try to refresh the token
                const refresh_token = localStorage.getItem('refresh_token');
                if (refresh_token) {
                    const response = await refreshAxiosInstance.post('/auth/refresh', { refresh_token });
                    const data = response.data;
                    
                    // Store new tokens
                    localStorage.setItem('access_token', data.access_token);
                    if (data.refresh_token) {
                        localStorage.setItem('refresh_token', data.refresh_token);
                    }
                    localStorage.setItem('user_id', data.user?.id || data.user_id);
                    // Store user role if available
                    if (data.user?.role) {
                        localStorage.setItem('user_role', data.user.role);
                    }
                    
                    // Notify all queued requests
                    notifyRefreshSubscribers(data.access_token);
                    
                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                    return axiosInstance(originalRequest); // Use axiosInstance for retry
                }
            } catch (refreshError) {
                // Notify all queued requests of failure
                notifyRefreshSubscribers(null);
                
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_role');
                localStorage.removeItem('user_id');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

// Create instances
export const api = axiosInstance;
export const refreshAxios = refreshAxiosInstance;

export default axiosInstance;