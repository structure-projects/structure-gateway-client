import BasicUsage from './components/BasicUsage';
import CustomClient from './components/CustomClient';
import UtilsDemo from './components/UtilsDemo';
import ConfigManager from './components/ConfigManager';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>@structure/gateway-client 示例项目</h1>
        <p>一个灵活的 HTTP 客户端库，专门用于与 Structure API 网关通信</p>
      </header>

      <main className="main">
        <section className="section">
          <h2>基础用法</h2>
          <BasicUsage />
        </section>

        <section className="section">
          <h2>自定义客户端</h2>
          <CustomClient />
        </section>

        <section className="section">
          <h2>工具函数</h2>
          <UtilsDemo />
        </section>

        <section className="section">
          <h2>配置管理</h2>
          <ConfigManager />
        </section>

        <section className="section">
          <h2>网关请求头说明</h2>
          <div className="card">
            <table className="headers-table">
              <thead>
                <tr>
                  <th>Header</th>
                  <th>说明</th>
                  <th>必需</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Authorization</td>
                  <td>Bearer token</td>
                  <td>可选</td>
                </tr>
                <tr>
                  <td>X-Tenant-Id</td>
                  <td>租户 ID</td>
                  <td>可选</td>
                </tr>
                <tr>
                  <td>X-Device-Id</td>
                  <td>设备 ID</td>
                  <td>默认启用</td>
                </tr>
                <tr>
                  <td>X-Request-Id</td>
                  <td>请求唯一标识</td>
                  <td>始终添加</td>
                </tr>
                <tr>
                  <td>X-Timestamp</td>
                  <td>时间戳</td>
                  <td>始终添加</td>
                </tr>
                <tr>
                  <td>X-Nonce</td>
                  <td>随机字符串</td>
                  <td>始终添加</td>
                </tr>
                <tr>
                  <td>X-Signature</td>
                  <td>HMAC-SHA256 签名</td>
                  <td>配置了 signatureSecret 时</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2024 Structure Team. Apache-2.0 License.</p>
      </footer>
    </div>
  );
}

export default App;
