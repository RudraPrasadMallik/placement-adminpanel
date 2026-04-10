import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL ||
'https://placement-backend-1-9jfq.onrender.com';
//  'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const getDashboardData = () => api.get('/admin/dashboard');

// Students API
export const getAllStudents = () => api.get('/admin/students');
export const getRecentStudents = (limit = 10) => api.get(`/admin/students/recent?limit=${limit}`);
export const toggleStudentStatus = (studentId, active) => 
  api.put(`/admin/students/${studentId}/status`, null, { params: { active } });
export const deleteStudent = (studentId) => api.delete(`/admin/students/${studentId}`);
export const getRegistrationOptions = (type) => api.get(`/admin/registration-options/${type}`);
export const getStudentRegistrationOptions = () => api.get('/students/registration-options');
export const createRegistrationOption = (type, payload) =>
  api.post(`/admin/registration-options/${type}`, payload);
export const deleteRegistrationOption = (optionId) =>
  api.delete(`/admin/registration-options/${optionId}`);

// Companies API
export const getAllCompanies = () => api.get('/admin/companies');
export const getRecentCompanies = (limit = 10) => api.get(`/admin/companies/recent?limit=${limit}`);
export const toggleCompanyStatus = (companyId, active) => 
  api.put(`/admin/companies/${companyId}/status`, null, { params: { active } });
export const deleteCompany = (companyId) => api.delete(`/admin/companies/${companyId}`);
export const getAllJobs = () => api.get('/admin/jobs');
export const toggleJobStatus = (jobId, active) =>
  api.put(`/admin/jobs/${jobId}/status`, null, { params: { active } });

// Auth API (placeholder - implement based on your backend auth)
export const login = (credentials) => api.post('/auth/login', credentials);

export default api;
