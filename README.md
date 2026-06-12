# @structure-projects/gateway-client

一个灵活的 HTTP 客户端库，专门用于与 Structure API 网关通信。包含完整的网关认证和签名机制。

## 特性

- ✅ 完整保留与网关通信的核心参数（X-Request-Id、X-Timestamp、X-Nonce、X-Signature 等）
- ✅ 灵活的配置系统，支持自定义各种行为
- ✅ 与业务代码完全解耦，不依赖特定 UI 框架
- ✅ 支持自定义 token 管理和刷新机制
- ✅ TypeScript 支持，完整的类型定义
- ✅ 可选的设备指纹识别（需要 @fingerprintjs/fingerprintjs）

## 安装

```bash
npm install @structure-projects/gateway-client
# 或
yarn add @structure-projects/gateway-client
# 或
pnpm add @structure-projects/gateway-client
```

### 可选依赖

如需设备指纹识别功能：

```bash
npm install @fingerprintjs/fingerprintjs
```

## 快速开始

### 基础用法

```typescript
import client from '@structure-projects/gateway-client';

// 发送 GET 请求
const response = await client.get('/api/users');

// 发送 POST 请求
const response = await client.post('/api/users', { name: 'John' });
```

### 全局配置

```typescript
import { configureGatewayClient } from '@structure-projects/gateway-client';

configureGatewayClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  signatureSecret: 'your-secret-key',
  defaultTenantId: '1',
});
```

### 创建自定义客户端实例

```typescript
import { createGatewayClient } from '@structure-projects/gateway-client';

const customClient = createGatewayClient({
  baseURL: 'https://custom-api.example.com',
  
  // 自定义获取 token 的方式
  getAccessToken: () => {
    return localStorage.getItem('custom_token');
  },
  
  // 自定义获取租户 ID 的方式
  getTenantId: () => {
    return 'custom-tenant-id';
  },
  
  // Token 过期时的回调
  onTokenExpired: async (error) => {
    console.log('Token expired');
    // 自定义处理逻辑
  },
  
  // Token 刷新逻辑
  refreshToken: async () => {
    const response = await fetch('/api/refresh-token');
    const data = await response.json();
    return data.accessToken;
  },
});
```

## 配置选项

完整的配置选项：

```typescript
interface GatewayClientConfig {
  // Base API URL
  baseURL?: string; // 默认: '/web-api'
  
  // 请求超时时间（毫秒）
  timeout?: number; // 默认: 50000
  
  // 默认请求头
  defaultHeaders?: Record<string, string>;
  
  // HMAC-SHA256 签名密钥
  signatureSecret?: string;
  
  // 默认租户 ID
  defaultTenantId?: string; // 默认: '1'
  
  // 是否启用设备 ID
  enableDeviceId?: boolean; // 默认: true
  
  // 自定义获取 accessToken 的函数
  getAccessToken?: () => string | null | Promise<string | null>;
  
  // 自定义获取租户 ID 的函数
  getTenantId?: () => string | null | Promise<string | null>;
  
  // 自定义获取设备 ID 的函数
  getDeviceId?: () => string | Promise<string>;
  
  // Token 过期时的回调
  onTokenExpired?: (error: AxiosError) => void | Promise<void>;
  
  // Token 刷新函数
  refreshToken?: () => Promise<string>;
  
  // 请求拦截器（在添加网关头之前执行）
  onBeforeRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  
  // 响应拦截器（在默认响应处理之前执行）
  onResponse?: (response: AxiosResponse) => any | Promise<any>;
  
  // 错误处理函数
  onError?: (error: AxiosError) => any | Promise<any>;
}
```

## 网关请求头

此库自动为每个请求添加以下网关通信的核心请求头：

| Header | 说明 | 必需 |
|--------|------|------|
| `Authorization` | Bearer token | 可选（有 token 时自动添加） |
| `X-Tenant-Id` | 租户 ID | 可选（有值时添加） |
| `X-Device-Id` | 设备 ID | 默认启用 |
| `X-Request-Id` | 请求唯一标识 | 始终添加 |
| `X-Timestamp` | 时间戳 | 始终添加 |
| `X-Nonce` | 随机字符串 | 始终添加 |
| `X-Signature` | HMAC-SHA256 签名 | 配置了 `signatureSecret` 时添加 |

### 签名机制

当配置了 `signatureSecret` 时，会自动生成签名：

```
签名 = HMAC-SHA256(方法 + URL + 时间戳 + Nonce, 密钥)
```

## 与 Element Plus 集成示例

```typescript
import { createGatewayClient } from '@structure-projects/gateway-client';
import { ElMessage, ElMessageBox } from 'element-plus';
import router from 'vue-router';

const client = createGatewayClient({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  
  onTokenExpired: async () => {
    try {
      await ElMessageBox.confirm('当前页面已失效，请重新登录', '提示', {
        confirmButtonText: '去登录',
        cancelButtonText: '访问首页',
        type: 'warning',
      });
      router.push('/login');
    } catch {
      router.push('/');
    }
  },
  
  onResponse: (response) => {
    const { code, message, success } = response.data;
    if (success === true) {
      return response.data;
    }
    if (response.data instanceof ArrayBuffer) {
      return response;
    }
    ElMessage.error(message || 'Error');
    return Promise.reject(new Error(message || 'Error'));
  },
  
  onError: (error) => {
    if (error.response && error.response.data) {
      const { code, message } = error.response.data;
      if (code !== 'INVALID_AUTHENTICATION' && code !== 'NOT_LOGGED_IN') {
        ElMessage.error(message || '系统出错');
      }
    }
    return Promise.reject(error.message);
  },
});

export default client;
```

## API 参考

### 核心函数

- `client` - 默认的 axios 实例
- `createGatewayClient(config)` - 创建自定义客户端实例
- `configureGatewayClient(config)` - 配置默认客户端
- `setRequestHeadersConfig(config)` - 设置请求头配置
- `getRequestHeadersConfig()` - 获取当前请求头配置
- `getGatewayConfig()` - 获取当前网关配置

### 工具函数

- `generateRequestId()` - 生成请求 ID
- `generateNonce()` - 生成随机字符串
- `hmacSha256(data, secret)` - 生成 HMAC-SHA256 签名
- `getDeviceId()` - 获取或生成设备 ID

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 类型检查
npm run type-check
```

## License

Apache-2.0
