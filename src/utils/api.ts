import axios from 'axios';

const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/refresh',
];

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string | null) => void; reject: (error: Error) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      config.url?.includes(route)
    );

    if (!isPublicRoute) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Get new access token using refresh token
      const response = await api.post('/api/auth/refresh');
      const { accessToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      
      // Update authorization header
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      
      processQueue(null, accessToken);
      
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Type for API response
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

// Add proper types for data and config
interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

// Generic request handler
const makeRequest = async <T>(
  method: string,
  endpoint: string,
  data?: unknown,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.request({
      method,
      url: endpoint,
      data,
      ...config,
    });

    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        return {
          error: 'Authentication required',
          status: 401,
        };
      }
      
      return {
        error: error.response?.data?.message || 'An error occurred',
        status: error.response?.status || 500,
      };
    }

    return {
      error: 'An unexpected error occurred',
      status: 500,
    };
  }
};

// Export API methods
export const apiClient = {
  get: <T>(endpoint: string, config: RequestConfig = {}) => 
    makeRequest<T>('GET', endpoint, undefined, config),
  
  post: <T>(endpoint: string, data: unknown, config: RequestConfig = {}) => 
    makeRequest<T>('POST', endpoint, data, config),
  
  put: <T>(endpoint: string, data: unknown, config: RequestConfig = {}) => 
    makeRequest<T>('PUT', endpoint, data, config),
  
  delete: <T>(endpoint: string, config: RequestConfig = {}) => 
    makeRequest<T>('DELETE', endpoint, undefined, config),
  
  patch: <T>(endpoint: string, data: unknown, config: RequestConfig = {}) => 
    makeRequest<T>('PATCH', endpoint, data, config),
};

export default apiClient;