import { useState } from 'react';
import { generateRequestId, generateNonce, hmacSha256, getDeviceId } from '@structure/gateway-client';

/**
 * UtilsDemo 组件
 * 展示 SDK 提供的工具函数的使用方法
 * 包括：generateRequestId, generateNonce, hmacSha256, getDeviceId
 */
export default function UtilsDemo() {
  const [requestId, setRequestId] = useState<string>('');
  const [nonce, setNonce] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  /**
   * 生成 RequestId 和 Nonce
   * 这两个函数用于生成请求的唯一标识和随机字符串
   */
  const generateAll = () => {
    console.log('[UtilsDemo] 开始生成 RequestId 和 Nonce');
    
    const newRequestId = generateRequestId();
    const newNonce = generateNonce();
    
    console.log('[UtilsDemo] 生成的 RequestId:', newRequestId);
    console.log('[UtilsDemo] 生成的 Nonce:', newNonce);
    
    setRequestId(newRequestId);
    setNonce(newNonce);
  };

  /**
   * 生成 HMAC-SHA256 签名
   * 签名算法：HMAC-SHA256(方法 + URL + 时间戳 + Nonce, 密钥)
   */
  const generateSignature = async () => {
    console.log('[UtilsDemo] 开始生成 HMAC-SHA256 签名');
    
    const method = 'GET';
    const url = '/api/test';
    const timestamp = Date.now().toString();
    const nonceValue = generateNonce();
    const secret = 'test-secret-key';
    
    // 签名字符串格式：方法 + URL + 时间戳 + Nonce
    const data = `${method}${url}${timestamp}${nonceValue}`;
    
    console.log('[UtilsDemo] 签名原始数据:', data);
    console.log('[UtilsDemo] 签名密钥:', secret);
    
    const sig = await hmacSha256(data, secret);
    
    console.log('[UtilsDemo] 生成的签名:', sig);
    
    setSignature(`数据: ${data}\n\n签名: ${sig}`);
  };

  /**
   * 获取设备 ID
   * 如果浏览器支持，会使用 fingerprintjs 生成设备指纹
   * 否则生成一个随机 UUID 并存储在 localStorage 中
   */
  const getDevice = async () => {
    setLoading(true);
    
    try {
      console.log('[UtilsDemo] 开始获取设备 ID');
      
      const id = await getDeviceId();
      
      console.log('[UtilsDemo] 获取到的设备 ID:', id);
      
      setDeviceId(id);
    } catch (error: any) {
      console.error('[UtilsDemo] 获取设备 ID 失败:', error.message);
      setDeviceId(`错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 清除设备 ID（测试用）
   */
  const clearDeviceId = () => {
    console.log('[UtilsDemo] 清除 localStorage 中的设备 ID');
    localStorage.removeItem('device_id');
    setDeviceId('');
    alert('设备 ID 已清除！下次获取会重新生成。');
  };

  return (
    <div className="card">
      <h3>工具函数示例</h3>
      <p>展示 SDK 提供的工具函数及其使用场景</p>
      
      <div className="utils-grid">
        <div className="util-item">
          <h4>generateRequestId</h4>
          <p>生成唯一请求 ID（UUID 格式）</p>
          <p className="hint">用于追踪单个请求</p>
          <button onClick={generateAll}>生成</button>
          {requestId && <code>{requestId}</code>}
        </div>

        <div className="util-item">
          <h4>generateNonce</h4>
          <p>生成随机字符串（8位）</p>
          <p className="hint">用于防止请求重放攻击</p>
          <button onClick={generateAll}>生成</button>
          {nonce && <code>{nonce}</code>}
        </div>

        <div className="util-item">
          <h4>hmacSha256</h4>
          <p>生成 HMAC-SHA256 签名</p>
          <p className="hint">签名 = HMAC-SHA256(方法+URL+时间戳+Nonce, 密钥)</p>
          <button onClick={generateSignature}>生成签名</button>
          {signature && <code>{signature}</code>}
        </div>

        <div className="util-item">
          <h4>getDeviceId</h4>
          <p>获取或生成设备 ID</p>
          <p className="hint">基于浏览器指纹或随机生成</p>
          <button onClick={getDevice} disabled={loading}>
            {loading ? '获取中...' : '获取设备 ID'}
          </button>
          {deviceId && (
            <>
              <code>{deviceId}</code>
              <button onClick={clearDeviceId} className="small-btn">清除</button>
            </>
          )}
        </div>
      </div>

      <div className="tips">
        <h4>工具函数说明:</h4>
        <ul>
          <li><strong>generateRequestId()</strong>: 生成 UUID 格式的唯一请求标识，用于请求追踪和日志关联</li>
          <li><strong>generateNonce()</strong>: 生成8位随机字符串，用于防止请求重放攻击</li>
          <li><strong>hmacSha256(data, secret)</strong>: 使用 HMAC-SHA256 算法生成签名，确保请求完整性</li>
          <li><strong>getDeviceId()</strong>: 获取或生成设备唯一标识，支持 fingerprintjs（可选依赖）</li>
        </ul>
      </div>
    </div>
  );
}
