import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Interceptor to attach Auth Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

export const branchService = {
  getBranches: () => api.get('/branches'),
  getBranch: (id: string) => api.get(`/branches/${id}`),
  createBranch: (data: any) => api.post('/branches', data),
  updateBranch: (id: string, data: any) => api.put(`/branches/${id}`, data),
};

export const roomService = {
  getRooms: (branchId?: string) => api.get('/rooms', { params: { branch_id: branchId } }),
  getRoom: (id: string) => api.get(`/rooms/${id}`),
  updateRoom: (id: string, data: any) => api.put(`/rooms/${id}`, data),
};

export const tenantService = {
  getTenants: () => api.get('/tenants'),
  getTenant: (id: string) => api.get(`/tenants/${id}`),
  createTenant: (data: any) => api.post('/tenants', data),
};

export const paymentService = {
  getPendingPayments: () => api.get('/payments/pending'),
  confirmPayment: (id: string) => api.post(`/payments/${id}/confirm`),
  rejectPayment: (id: string, data: any) => api.post(`/payments/${id}/reject`, data),
  getSlipUrl: (id: string) => `/api/v1/payments/slips/${id}`,
};

export default api;
