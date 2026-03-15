import axios from 'axios';
import { getServerSession } from 'next-auth';
import authOption from '@/lib/auth-option';
import { IResponseList, IResponse } from '@/types/response';

// Helper functions to create safe empty responses
const createEmptyListResponse = <T>(): IResponseList<T> => ({
  succeeded: false,
  data: {
    items: [],
    totalCount: 0
  },
  message: 'Service temporarily unavailable',
  errors: ['Service connection failed'],
  code: 'SERVICE_UNAVAILABLE'
});

const createEmptyResponse = <T>(): IResponse<T> => ({
  succeeded: false,
  data: undefined,
  message: 'Service temporarily unavailable',
  errors: ['Service connection failed'],
  code: 'SERVICE_UNAVAILABLE'
});

// Create a base axios instance for SERVER-SIDE requests (Proxy to Backend)
const axiosInstance = axios.create({
  baseURL:
    typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL || '/api/proxy'
      : process.env.API_URL || 'http://localhost:5000/BDFM/v1/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 300000 // 5 minutes timeout
});

// Add a request interceptor to dynamically attach the token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // 1. Handle Server Side
      if (typeof window === 'undefined') {
        const session = await getServerSession(authOption);
        const token = session?.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add Internal Proxy Key for backend authorization
        const proxyKey = process.env.INTERNAL_PROXY_KEY;
        if (proxyKey) {
          config.headers['X-Internal-Proxy-Key'] = proxyKey;
        }
      }
      // 2. Handle Client Side (Mirror axiosClient behavior)
      else {
        // Token is handled via axiosClient.defaults.headers.common['Authorization']
        // which shared the same default headers if we are not careful,
        // but here they are separate instances.
        // However, most services using axiosInstance in browser were expecting it to work.
      }

      return config;
    } catch (error) {
      console.error('Error in axiosInstance interceptor:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Log error details for debugging
    console.warn('API Request failed:', {
      message: error?.message || 'Unknown error',
      status: error?.response?.status || 'No status',
      url: error?.config?.url || 'Unknown URL',
      method: error?.config?.method?.toUpperCase() || 'Unknown method'
    });

    // For server-side requests, return safe fallback responses instead of throwing
    // EXCEPT for SignalR Hub paths or explicit proxy calls
    if (
      typeof window === 'undefined' &&
      !error?.config?.url?.includes('correspondenceHub')
    ) {
      // Determine if this looks like a list endpoint or single item endpoint
      const url = error?.config?.url || '';
      const isListEndpoint =
        url.includes('List') ||
        url.includes('GetAll') ||
        error?.config?.method?.toLowerCase() === 'get';

      if (isListEndpoint && !url.includes('ById/')) {
        // Return empty list response for list endpoints
        return Promise.resolve({
          data: createEmptyListResponse(),
          status: 200,
          statusText: 'OK (Fallback)',
          headers: {},
          config: error.config
        });
      } else {
        // Return empty single response for single item endpoints
        return Promise.resolve({
          data: createEmptyResponse(),
          status: 200,
          statusText: 'OK (Fallback)',
          headers: {},
          config: error.config
        });
      }
    }

    // For client-side requests, still throw the error so components can handle it
    return Promise.reject(error);
  }
);

// create axios instance for client side (Browser to Next.js Proxy)
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 300000 // 5 minutes timeout
});

// Function to set auth token - to be called from components
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosClient.defaults.headers.common['Authorization'];
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Error handling interceptor for client
axiosClient.interceptors.request.use(
  async (config) => {
    // LOCKDOWN: We no longer send the X-Internal-Proxy-Key from the browser.
    // Only the Next.js Proxy (Server) will add it.
    // The token will be set by setAuthToken function called from components
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for client-side error handling
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log error details for debugging
    console.warn('Client API Request failed:', {
      message: error?.message || 'Unknown error',
      status: error?.response?.status || 'No status',
      url: error?.config?.url || 'Unknown URL',
      method: error?.config?.method?.toUpperCase() || 'Unknown method'
    });

    // For client-side, we usually want to let components handle errors
    // But we can add specific handling for certain error types
    if (error?.response?.status === 401) {
      console.warn(
        'Authentication required - redirecting to login may be needed'
      );
    } else if (error?.response?.status >= 500) {
      console.warn('Server error detected - service may be unavailable');
    }

    return Promise.reject(error);
  }
);

export { axiosInstance, axiosClient };
