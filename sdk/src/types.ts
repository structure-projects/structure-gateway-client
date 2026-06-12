import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Gateway client configuration
 */
export interface GatewayClientConfig {
  /**
   * Base API URL
   * @default '/web-api'
   */
  baseURL?: string;

  /**
   * Request timeout in milliseconds
   * @default 50000
   */
  timeout?: number;

  /**
   * Default request headers
   */
  defaultHeaders?: Record<string, string>;

  /**
   * Signature secret for HMAC-SHA256 signing
   */
  signatureSecret?: string;

  /**
   * Default tenant ID
   * @default '1'
   */
  defaultTenantId?: string;

  /**
   * Enable device ID generation
   * @default true
   */
  enableDeviceId?: boolean;

  /**
   * Custom function to get access token
   */
  getAccessToken?: () => string | null | Promise<string | null>;

  /**
   * Custom function to get tenant ID
   */
  getTenantId?: () => string | null | Promise<string | null>;

  /**
   * Custom function to get device ID
   */
  getDeviceId?: () => string | Promise<string>;

  /**
   * Callback when token is expired or invalid
   */
  onTokenExpired?: (error: AxiosError) => void | Promise<void>;

  /**
   * Callback to refresh token
   */
  refreshToken?: () => Promise<string>;

  /**
   * Custom request interceptor (runs before gateway headers are added)
   */
  onBeforeRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

  /**
   * Custom response interceptor (runs before default response handling)
   */
  onResponse?: (response: AxiosResponse) => any | Promise<any>;

  /**
   * Custom error handler
   */
  onError?: (error: AxiosError) => any | Promise<any>;
}

/**
 * Gateway response structure
 */
export interface GatewayResponse<T = any> {
  code: string;
  message?: string;
  success: boolean;
  data?: T;
}

/**
 * Gateway error structure
 */
export interface GatewayError {
  code: string;
  message?: string;
  success: boolean;
}

/**
 * Request headers configuration
 */
export interface RequestHeadersConfig {
  signatureSecret?: string;
  defaultTenantId?: string;
}
