import type { GatewayClientConfig, RequestHeadersConfig } from './types';

let globalConfig: GatewayClientConfig = {
  baseURL: '/web-api',
  timeout: 50000,
  defaultHeaders: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  defaultTenantId: '1',
  enableDeviceId: true,
};

let requestHeadersConfig: RequestHeadersConfig = {
  signatureSecret: undefined,
  defaultTenantId: '1',
};

/**
 * Configure the gateway client globally
 */
export function configureGatewayClient(config: Partial<GatewayClientConfig>): void {
  globalConfig = { ...globalConfig, ...config };
  
  if (config.signatureSecret !== undefined || config.defaultTenantId !== undefined) {
    requestHeadersConfig = {
      ...requestHeadersConfig,
      signatureSecret: config.signatureSecret,
      defaultTenantId: config.defaultTenantId,
    };
  }
}

/**
 * Get the current global configuration
 */
export function getGatewayConfig(): GatewayClientConfig {
  return { ...globalConfig };
}

/**
 * Set request headers configuration (signature secret, default tenant ID)
 */
export function setRequestHeadersConfig(config: Partial<RequestHeadersConfig>): void {
  requestHeadersConfig = { ...requestHeadersConfig, ...config };
}

/**
 * Get request headers configuration
 */
export function getRequestHeadersConfig(): RequestHeadersConfig {
  return { ...requestHeadersConfig };
}
