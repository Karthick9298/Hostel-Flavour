import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://hostel-flavour.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Firebase auth token
api.interceptors.request.use(
  (config) => {
    const firebaseToken = localStorage.getItem('firebaseToken');
    if (firebaseToken) {
      config.headers.Authorization = `Bearer ${firebaseToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - remove token and redirect to login
      localStorage.removeItem('firebaseToken');
      window.location.href = '/login';
    }
    
    // Return error response or message
    return Promise.reject(
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred'
    );
  }
);

// API methods
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  syncUser: () => api.post('/auth/sync-user'),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const feedbackAPI = {
  submit: (data) => api.post('/feedback/submit', data),
  getMyFeedback: () => api.get('/feedback/my-feedback'),
  getSubmissionStats: (date) => api.get(`/feedback/submission-stats${date ? `?date=${date}` : ''}`),
  getAll: (params) => api.get('/feedback/all', { params }),
};

export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getComments: (params) => api.get('/analytics/comments', { params }),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAll: (params) => api.get('/users/all', { params }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  toggleAdmin: (userId, isAdmin) => api.put(`/users/${userId}/admin`, { isAdmin }),
  toggleStatus: (userId, isActive) => api.put(`/users/${userId}/status`, { isActive }),
  getStats: () => api.get('/users/stats/overview'),
};

export const menuAPI = {
  getCurrentWeek: () => api.get('/menu/current'),
  getToday: () => api.get('/menu/today'),
  getByDate: (date) => api.get(`/menu/date/${date}`),
  createWeekly: (data) => api.post('/menu/weekly', data),
  getAllWeekly: (params) => api.get('/menu/weekly', { params }),
  updateWeekly: (id, data) => api.put(`/menu/weekly/${id}`, data),
  deleteWeekly: (id) => api.delete(`/menu/weekly/${id}`),
};

export default api;
