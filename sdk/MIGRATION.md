# 迁移指南

本指南展示如何将 `structure-portal-shell` 项目迁移到使用新的 `@structure/gateway-client` 二方库。

## 1. 安装新库

首先，在 `structure-portal-shell` 项目中安装新库：

```bash
cd structure-portal-shell
npm install ../structure-gateway-client
# 或
pnpm add ../structure-gateway-client
```

## 2. 创建新的 request.ts 文件

在 `structure-portal-shell/src/utils/` 中创建新的 `request.ts`（替换原有的）：

```typescript
import { createGatewayClient } from '@structure/gateway-client';
import { useUserStoreHook } from '@/store/modules/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { refreshTokenApi } from '@/api/auth';
import router from '@/router';

// Create gateway client with project-specific configurations
const client = createGatewayClient({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/web-api',
  timeout: 50000,
  
  // Custom refresh token logic from the original project
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await refreshTokenApi(refreshToken);
    const { accessToken, expires, refreshToken: newRefreshToken } = response.data;
    
    const userStore = useUserStoreHook();
    userStore.setToken(accessToken, expires, newRefreshToken);
    
    return accessToken;
  },
  
  // Token expired handler from original project
  onTokenExpired: async () => {
    try {
      await ElMessageBox.confirm('当前页面已失效，请重新登录', '提示', {
        confirmButtonText: '去登录',
        cancelButtonText: '访问首页',
        type: 'warning',
      });
      const userStore = useUserStoreHook();
      userStore.resetToken().then(() => {
        router.push('/login');
      });
    } catch {
      // User cancels, reset token and go to home
      const userStore = useUserStoreHook();
      userStore.resetToken();
      router.push('/');
    }
  },
  
  // Response handler from original project
  onResponse: (response) => {
    const { code, message, success } = response.data;
    if (success === true) {
      return response.data;
    }
    if (response.data instanceof ArrayBuffer) {
      return response;
    }
    ElMessage.error(message || response.data.message || 'Error');
    return Promise.reject(new Error(message || 'Error'));
  },
  
  // Error handler from original project
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

## 3. 更新 API 文件

检查并更新 `structure-portal-shell/src/api/` 中的文件，确保它们正确导入新的客户端：

```typescript
// 示例：auth/index.ts
import request from '@/utils/request';

export const loginApi = (data: any) => {
  return request.post('/auth/login', data);
};

export const refreshTokenApi = (refreshToken: string) => {
  return request.post('/auth/refresh', { refreshToken });
};
```

## 4. 保持原有的 header 配置功能

如果您需要保留原有的 `setRequestHeadersConfig` 功能，可以在 utils 中重新导出：

```typescript
// 在 structure-portal-shell/src/utils/index.ts 或新的文件中
import { setRequestHeadersConfig, getRequestHeadersConfig } from '@structure/gateway-client';

export { setRequestHeadersConfig, getRequestHeadersConfig };
```

## 5. 测试

确保所有功能正常工作：
- API 请求正常发送
- Token 刷新机制正常工作
- 签名验证正常
- 错误提示正常显示

## 主要变化对比

| 特性 | 原有实现 | 新库实现 |
|------|---------|---------|
| 依赖 | 与 Vue/Element Plus 强耦合 | 完全解耦，无 UI 依赖 |
| 配置 | 硬编码在项目中 | 灵活的配置系统 |
| 复用 | 无法直接复用 | 可作为 npm 包安装使用 |
| 网关参数 | 固定实现 | 完整保留，可配置 |
| 类型支持 | 有 | 完整的 TypeScript 类型 |

## 构建和发布新库

当您准备好发布新库时：

```bash
cd structure-gateway-client
npm run build
# 发布到 npm（需要配置）
npm login
npm publish --access public
```
