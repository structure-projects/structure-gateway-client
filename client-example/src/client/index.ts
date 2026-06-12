import { createGatewayClient, configureGatewayClient, client } from '@structure/gateway-client';

/**
 * 全局配置默认客户端
 * 使用 configureGatewayClient 可以设置全局默认配置
 * 这些配置会被所有使用默认 client 的请求继承
 */
configureGatewayClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  signatureSecret: 'your-secret-key',
  defaultTenantId: '1',
});

/**
 * 创建自定义客户端实例
 * 当需要不同配置的客户端时，可以使用 createGatewayClient 创建独立实例
 */
export const customClient = createGatewayClient({
  baseURL: 'https://custom-api.example.com',
  
  /**
   * 自定义获取 accessToken 的函数
   * 这里从 localStorage 中获取自定义的 token
   */
  getAccessToken: () => {
    const token = localStorage.getItem('custom_token');
    console.log('[GatewayClient] 获取 accessToken:', token ? '***' : null);
    return token;
  },
  
  /**
   * 自定义获取租户 ID 的函数
   * 返回固定的租户 ID
   */
  getTenantId: () => {
    const tenantId = 'custom-tenant-id';
    console.log('[GatewayClient] 获取 tenantId:', tenantId);
    return tenantId;
  },
  
  /**
   * Token 过期时的回调函数
   * 可以在这里处理重新登录等逻辑
   */
  onTokenExpired: async (error) => {
    console.error('[GatewayClient] Token 过期:', error.response?.data || error.message);
  },
  
  /**
   * Token 刷新函数
   * 当 token 过期时自动调用此函数获取新 token
   */
  refreshToken: async () => {
    console.log('[GatewayClient] 开始刷新 token...');
    try {
      const response = await fetch('/api/refresh-token');
      const data = await response.json();
      console.log('[GatewayClient] Token 刷新成功:', data.accessToken ? '***' : null);
      return data.accessToken;
    } catch (error) {
      console.error('[GatewayClient] Token 刷新失败:', error);
      throw error;
    }
  },
});

/**
 * 默认客户端实例导出
 * 可以直接使用 client.get/post 等方法发送请求
 */
export { client as defaultClient };

/**
 * 导出配置函数供外部使用
 */
export { configureGatewayClient };
