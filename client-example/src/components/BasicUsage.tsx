import { useState } from 'react';
import { defaultClient as client } from '../client';

/**
 * BasicUsage 组件
 * 展示如何使用默认客户端发送各种 HTTP 请求
 * 包括 GET、POST、PUT、DELETE 等常用请求方法
 */
export default function BasicUsage() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [requestInfo, setRequestInfo] = useState<string>('');

  /**
   * 发送 GET 请求示例
   * 获取用户列表数据
   */
  const handleGetRequest = async () => {
    setLoading(true);
    setRequestInfo('');
    
    try {
      console.log('[BasicUsage] 开始发送 GET 请求: /api/users');
      
      // 发送 GET 请求，支持查询参数
      const result = await client.get('/api/users', {
        params: {
          page: 1,
          limit: 10,
          status: 'active',
        },
      });
      
      console.log('[BasicUsage] GET 请求成功:', result);
      setRequestInfo('GET /api/users?page=1&limit=10&status=active');
      setResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error('[BasicUsage] GET 请求失败:', error.message);
      setResponse(`错误: ${error.message || '请求失败'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发送 POST 请求示例
   * 创建新用户
   */
  const handlePostRequest = async () => {
    setLoading(true);
    setRequestInfo('');
    
    try {
      console.log('[BasicUsage] 开始发送 POST 请求: /api/users');
      
      // 发送 POST 请求，包含请求体
      const result = await client.post('/api/users', {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        role: 'user',
      });
      
      console.log('[BasicUsage] POST 请求成功:', result);
      setRequestInfo('POST /api/users');
      setResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error('[BasicUsage] POST 请求失败:', error.message);
      setResponse(`错误: ${error.message || '请求失败'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发送 PUT 请求示例
   * 更新用户信息
   */
  const handlePutRequest = async () => {
    setLoading(true);
    setRequestInfo('');
    
    try {
      console.log('[BasicUsage] 开始发送 PUT 请求: /api/users/1');
      
      // 发送 PUT 请求，更新指定资源
      const result = await client.put('/api/users/1', {
        name: 'John Updated',
        email: 'john.updated@example.com',
      });
      
      console.log('[BasicUsage] PUT 请求成功:', result);
      setRequestInfo('PUT /api/users/1');
      setResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error('[BasicUsage] PUT 请求失败:', error.message);
      setResponse(`错误: ${error.message || '请求失败'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发送 DELETE 请求示例
   * 删除用户
   */
  const handleDeleteRequest = async () => {
    setLoading(true);
    setRequestInfo('');
    
    try {
      console.log('[BasicUsage] 开始发送 DELETE 请求: /api/users/1');
      
      // 发送 DELETE 请求，删除指定资源
      const result = await client.delete('/api/users/1');
      
      console.log('[BasicUsage] DELETE 请求成功:', result);
      setRequestInfo('DELETE /api/users/1');
      setResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error('[BasicUsage] DELETE 请求失败:', error.message);
      setResponse(`错误: ${error.message || '请求失败'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发送带有自定义请求头的请求示例
   */
  const handleCustomHeaderRequest = async () => {
    setLoading(true);
    setRequestInfo('');
    
    try {
      console.log('[BasicUsage] 开始发送带有自定义请求头的请求: /api/custom');
      
      // 发送带有自定义请求头的请求
      const result = await client.get('/api/custom', {
        headers: {
          'X-Custom-Header': 'custom-value',
          'Accept-Language': 'zh-CN',
        },
      });
      
      console.log('[BasicUsage] 自定义请求头请求成功:', result);
      setRequestInfo('GET /api/custom (带自定义请求头)');
      setResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error('[BasicUsage] 自定义请求头请求失败:', error.message);
      setResponse(`错误: ${error.message || '请求失败'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>基础用法示例</h3>
      <p>使用默认客户端发送各种 HTTP 请求（GET、POST、PUT、DELETE）</p>
      
      <div className="button-group">
        <button onClick={handleGetRequest} disabled={loading}>
          {loading ? '加载中...' : 'GET 请求'}
        </button>
        <button onClick={handlePostRequest} disabled={loading}>
          {loading ? '加载中...' : 'POST 请求'}
        </button>
        <button onClick={handlePutRequest} disabled={loading}>
          {loading ? '加载中...' : 'PUT 请求'}
        </button>
        <button onClick={handleDeleteRequest} disabled={loading}>
          {loading ? '加载中...' : 'DELETE 请求'}
        </button>
        <button onClick={handleCustomHeaderRequest} disabled={loading}>
          {loading ? '加载中...' : '自定义请求头'}
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
          <li>打开浏览器控制台可以查看详细的请求日志</li>
          <li>请求会自动携带网关所需的请求头（X-Request-Id、X-Timestamp、X-Nonce 等）</li>
          <li>如果配置了 signatureSecret，会自动生成 X-Signature 签名</li>
        </ul>
      </div>
    </div>
  );
}
