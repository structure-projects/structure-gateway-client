import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  generateRequestId,
  generateNonce,
  hmacSha256,
  getDeviceId as getDefaultDeviceId,
} from './utils';
import {
  configureGatewayClient,
  getGatewayConfig,
  setRequestHeadersConfig,
  getRequestHeadersConfig,
} from './config';
import type {
  GatewayClientConfig,
  GatewayResponse,
} from './types';

// Internal state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

/**
 * Create a new gateway client instance
 */
export function createGatewayClient(customConfig: Partial<GatewayClientConfig> = {}) {
  const config = { ...getGatewayConfig(), ...customConfig };
  
  const service = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: config.defaultHeaders,
  });

  // Request interceptor
  service.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Call custom before request interceptor if provided
      if (customConfig.onBeforeRequest) {
        config = await customConfig.onBeforeRequest(config);
      }

      // 1. Add Authorization header
      if (customConfig.getAccessToken) {
        const accessToken = await customConfig.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = 'Bearer ' + accessToken;
        }
      } else {
        // Default: get from localStorage
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          config.headers.Authorization = 'Bearer ' + accessToken;
        }
      }

      // 2. Add X-Tenant-Id header
      if (customConfig.getTenantId) {
        const tenantId = await customConfig.getTenantId();
        if (tenantId) {
          config.headers['X-Tenant-Id'] = tenantId;
        }
      } else {
        // Default: get from localStorage or use default
        const selectedOrgId = localStorage.getItem('selectedOrgId');
        const defaultTenantId = getRequestHeadersConfig().defaultTenantId;
        if (selectedOrgId) {
          config.headers['X-Tenant-Id'] = selectedOrgId;
        } else if (defaultTenantId) {
          config.headers['X-Tenant-Id'] = defaultTenantId;
        }
      }

      // 3. Add X-Device-Id header
      if (customConfig.enableDeviceId !== false) {
        let deviceId: string;
        if (customConfig.getDeviceId) {
          deviceId = await customConfig.getDeviceId();
        } else {
          deviceId = await getDefaultDeviceId();
        }
        config.headers['X-Device-Id'] = deviceId;
      }

      // 4. Add X-Request-Id header (always required)
      config.headers['X-Request-Id'] = generateRequestId();

      // 5. Add X-Timestamp header (always required)
      const timestamp = Date.now();
      config.headers['X-Timestamp'] = timestamp.toString();

      // 6. Add X-Nonce header (always required)
      const nonce = generateNonce();
      config.headers['X-Nonce'] = nonce;

      // 7. Add X-Signature header (if secret is provided)
      const signatureSecret = customConfig.signatureSecret || getRequestHeadersConfig().signatureSecret;
      if (signatureSecret) {
        const method = config.method?.toUpperCase() || 'GET';
        const url = config.url || '';
        const signStr = `${method}${url}${timestamp}${nonce}`;
        const signature = await hmacSha256(signStr, signatureSecret);
        config.headers['X-Signature'] = signature;
      }

      return config;
    },
    (error: any) => {
      console.error(error);
      return Promise.reject(error);
    },
  );

  // Response interceptor
  service.interceptors.response.use(
    async (response: AxiosResponse) => {
      // Call custom response interceptor if provided
      if (customConfig.onResponse) {
        return await customConfig.onResponse(response);
      }

      const { message, success } = response.data as GatewayResponse;
      if (success === true) {
        return response.data;
      }
      if (response.data instanceof ArrayBuffer) {
        return response;
      }
      
      // Handle error without UI dependencies
      return Promise.reject(new Error(message || 'Error'));
    },
    async (error: any) => {
      // Call custom error handler if provided
      if (customConfig.onError) {
        return await customConfig.onError(error);
      }

      const originalRequest = error.config;
      
      // Handle token refresh
      if (
        error.response && 
        error.response.data &&
        (error.response.data.code === 'INVALID_AUTHENTICATION' || 
         error.response.data.code === 'NOT_LOGGED_IN') &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = 'Bearer ' + token;
              return service(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        if (customConfig.refreshToken) {
          try {
            const newToken = await customConfig.refreshToken();
            processQueue(null, newToken);
            originalRequest.headers.Authorization = 'Bearer ' + newToken;
            return service(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            if (customConfig.onTokenExpired) {
              await customConfig.onTokenExpired(error);
            }
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          processQueue(new Error('No refresh token function provided'), null);
          isRefreshing = false;
          if (customConfig.onTokenExpired) {
            await customConfig.onTokenExpired(error);
          }
          return Promise.reject(error);
        }
      }

      if (
        error.response &&
        error.response.data &&
        error.response.data.code !== 'INVALID_AUTHENTICATION' && 
        error.response.data.code !== 'NOT_LOGGED_IN'
      ) {
        // Just pass the error without UI
      }
      
      return Promise.reject(error.message || error);
    },
  );

  return service;
}

// Default client instance
const defaultClient = createGatewayClient();

export default defaultClient;
export {
  configureGatewayClient,
  setRequestHeadersConfig,
  getRequestHeadersConfig,
  getGatewayConfig,
};
