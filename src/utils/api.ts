import axios, { AxiosResponse, AxiosError } from 'axios';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance
const api = axios.create({
  // In development, axios will use the current origin (http://localhost:3000)
  baseURL: '',  // or process.env.NEXT_PUBLIC_API_URL
  headers: {
    'Content-Type': 'application/json',
  },
});
export type ApiResponse<T = any> = {
    data?: T;
    error?: string;
    status: number;
  };
  
  export type RequestConfig = {
    headers?: Record<string, string>;
    params?: Record<string, string>;
  };
  
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  const data = isJson ? await response.json() : await response.text();
  
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || 'An error occurred'
    );
  }

  return {
    data,
    status: response.status
  };
}

export const makeRequest = async <T>(
  method: string,
  endpoint: string,
  data?: any,
  config = {}
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.request({
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
    const axiosError = error as AxiosError<{ message: string }>;
    return {
      error: axiosError.response?.data?.message || 'An error occurred',
      status: axiosError.response?.status || 500,
    };
  }
};

export const apiClient = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    makeRequest<T>('GET', endpoint, undefined, config),

  post: <T>(endpoint: string, data: any, config?: RequestConfig) =>
    makeRequest<T>('POST', endpoint, data, config),

  put: <T>(endpoint: string, data: any, config?: RequestConfig) =>
    makeRequest<T>('PUT', endpoint, data, config),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    makeRequest<T>('DELETE', endpoint, undefined, config),

  patch: <T>(endpoint: string, data: any, config?: RequestConfig) =>
    makeRequest<T>('PATCH', endpoint, data, config),
};