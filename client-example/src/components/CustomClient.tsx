import { useState } from 'react';
import { customClient } from '../client';

/**
 * CustomClient 组件
 * 展示如何使用自定义配置的客户端实例发送请求
 * 自定义客户端可以有独立的配置，不受全局配置影响
 */
export default function CustomClient() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [requestInfo, setRequestInfo] = useState<string>('');

  /**
   * 使用自定义客户端发送请求
   * 自定义客户端有独立的配置，包括：
   * - 自定义 baseURL
   * - 自定义 token 获取逻辑
   * - 自定义租户 ID
   * - 自定义 token 刷新逻辑
   */
  const handleCustomRequest = async () => {
    setLoading(true);
    setRequestInfo('');
    
    try {
      console.log('[CustomClient] 开始使用自定义客户端发送请求');
      
      // 使用自定义客户端发送请求
      const result = await customClient.get('/api/custom-endpoint', {
        params: {
          customParam: 'value',
        },
      });
      
      console.log('[CustomClient] 请求成功:', result);
      setRequestInfo('GET /api/custom-endpoint (自定义客户端)');
      setResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error('[CustomClient] 请求失败:', error.message);
      setResponse(`错误: ${error.message || '请求失败'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 测试自定义客户端的 POST 请求
   */
  const handleCustomPostRequest = async () => {
    setLoading(true);
    setRequestInfo('');
    
    try {
      console.log('[CustomClient] 开始使用自定义客户端发送 POST 请求');
      
      const result = await customClient.post('/api/custom-endpoint', {
        data: 'test data',
        timestamp: Date.now(),
      });
      
      console.log('[CustomClient] POST 请求成功:', result);
      setRequestInfo('POST /api/custom-endpoint (自定义客户端)');
      setResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error('[CustomClient] POST 请求失败:', error.message);
      setResponse(`错误: ${error.message || '请求失败'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 测试设置临时 token
   * 演示如何配合自定义客户端使用 token
   */
  const handleSetToken = () => {
    console.log('[CustomClient] 设置测试 token 到 localStorage');
    localStorage.setItem('custom_token', 'test-token-12345');
    alert('测试 token 已设置！可以尝试发送请求了。');
  };

  /**
   * 清除 token
   */
  const handleClearToken = () => {
    console.log('[CustomClient] 清除 localStorage 中的 token');
    localStorage.removeItem('custom_token');
    alert('Token 已清除！');
  };

  return (
    <div className="card">
      <h3>自定义客户端示例</h3>
      <p>使用自定义配置的客户端发送请求，包含自定义的 token 管理、租户 ID 和刷新逻辑</p>
      
      <div className="config-info">
        <h4>自定义配置详情:</h4>
        <ul>
          <li>
            <strong>baseURL:</strong> https://custom-api.example.com
            <span className="description">独立的 API 地址，与默认客户端不同</span>
          </li>
          <li>
            <strong>getAccessToken:</strong> 从 localStorage 获取
            <span className="description">自定义 token 获取逻辑，key 为 'custom_token'</span>
          </li>
          <li>
            <strong>getTenantId:</strong> 返回 'custom-tenant-id'
            <span className="description">固定的租户 ID</span>
          </li>
          <li>
            <strong>refreshToken:</strong> 自定义刷新逻辑
            <span className="description">当 token 过期时自动调用</span>
          </li>
          <li>
            <strong>onTokenExpired:</strong> 自定义过期回调
            <span className="description">token 过期后的处理逻辑</span>
          </li>
        </ul>
      </div>

      <div className="button-group">
        <button onClick={handleSetToken} disabled={loading}>
          设置测试 Token
        </button>
        <button onClick={handleClearToken} disabled={loading}>
          清除 Token
        </button>
        <button onClick={handleCustomRequest} disabled={loading}>
          {loading ? '加载中...' : 'GET 请求'}
        </button>
        <button onClick={handleCustomPostRequest} disabled={loading}>
          {loading ? '加载中...' : 'POST 请求'}
        </button>
      </div>

      {requestInfo && (
        <div className="request-info">
          <span className="label">当前请求:</span>
          <code>{requestInfo}</code>
        </div>
      )}

      {response && (
        <div className="response">
          <h4>响应结果:</h4>
          <pre>{response}</pre>
        </div>
      )}

      <div className="tips">
        <h4>使用提示:</h4>
        <ul>
          <li>点击"设置测试 Token"可以设置一个模拟的 token</li>
          <li>自定义客户端会自动读取 localStorage 中的 'custom_token'</li>
          <li>打开浏览器控制台可以查看详细的日志信息</li>
          <li>自定义客户端的配置完全独立于默认客户端</li>
        </ul>
      </div>
    </div>
  );
}
