import { useState } from 'react';
import { getGatewayConfig, getRequestHeadersConfig, setRequestHeadersConfig } from '@structure/gateway-client';

export default function ConfigManager() {
  const [config, setConfig] = useState<string>('');
  const [headersConfig, setHeadersConfig] = useState<string>('');

  const loadConfigs = () => {
    setConfig(JSON.stringify(getGatewayConfig(), null, 2));
    setHeadersConfig(JSON.stringify(getRequestHeadersConfig(), null, 2));
  };

  const updateSignatureSecret = () => {
    setRequestHeadersConfig({
      signatureSecret: 'new-secret-key-123',
      defaultTenantId: '2',
    });
    loadConfigs();
  };

  return (
    <div className="card">
      <h3>配置管理示例</h3>
      <p>展示如何获取和修改 SDK 配置</p>
      
      <button onClick={loadConfigs}>加载当前配置</button>
      <button onClick={updateSignatureSecret}>更新签名密钥</button>

      {config && (
        <div className="config-section">
          <h4>网关配置 (getGatewayConfig):</h4>
          <pre>{config}</pre>
        </div>
      )}

      {headersConfig && (
        <div className="config-section">
          <h4>请求头配置 (getRequestHeadersConfig):</h4>
          <pre>{headersConfig}</pre>
        </div>
      )}
    </div>
  );
}
