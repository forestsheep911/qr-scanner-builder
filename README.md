# QR Scanner Builder

## 背景

这个项目旨在解决在传统 JavaScript 环境（如 Kintone 自定义开发）中使用现代 QR 扫描库的兼容性问题。

现代 QR Scanner 库通常使用 ES 模块格式（`import/export` 语法），这在不使用构建工具（如 webpack、Rollup 等）的传统环境中会导致兼容性问题。特别是在 Kintone 等平台上，当需要上传 JavaScript 文件而不是使用构建工具时，这个问题尤为突出。

本项目提供了一个简单的解决方案，将 QR Scanner 库转换为全局变量形式，使其可以在传统 JavaScript 环境中无缝使用，而无需修改客户的现有代码。

## 构建方式

本项目提供两种构建方式，根据您的需求选择合适的方式：

### 1. 标准构建（两个文件）

生成两个文件：主库文件和 worker 文件。

```bash
# 安装依赖
npm install
# 或
yarn

# 构建
npm run build
# 或
yarn build
```

构建完成后，在 `dist` 目录中会生成：

- `qr-scanner.js` - 主库文件
- `qr-scanner-worker.min.js` - Worker 文件

**优点**：
- Worker 文件分离，可能有更好的性能
- 符合原始库的设计

**缺点**：
- 需要管理两个文件
- 需要确保 worker 文件路径正确

### 2. 一体化构建（单个文件）

将所有内容（包括 worker）合并到一个文件中。

```bash
# 安装依赖
npm install
# 或
yarn

# 构建
npm run build:all-in-one
# 或
yarn build:all-in-one
```

构建完成后，在 `dist` 目录中会生成：

- `qr-scanner-all-in-one.js` - 包含内联 worker 的单一文件

**优点**：
- 只需管理一个文件，部署更简单
- 不需要担心 worker 文件路径问题
- 适合 Kintone 等平台的自定义开发

**缺点**：
- 文件稍大
- 初始化时可能有轻微性能影响

## 使用方法

### 在 Kintone 中使用

1. 构建库文件（选择上述任一构建方式）
2. 在 Kintone 应用设置中上传生成的文件：
   - 对于标准构建：上传 `qr-scanner.js` 和 `qr-scanner-worker.min.js`
   - 对于一体化构建：只需上传 `qr-scanner-all-in-one.js`
3. 确保这些文件在您的自定义 JavaScript 代码之前加载
4. 在您的自定义代码中，可以直接使用全局的 `QrScanner` 变量

### 示例代码

```javascript
(function() {
  'use strict';
  
  // 初始化扫描器
  function initializeScanner() {
    const videoElement = document.getElementById('video');
    const resultElement = document.getElementById('result');
    
_pinspector
    const qrScanner = new QrScanner(
      videoElement,
      result => {
        console.log('扫描结果:', result);
        resultElement.textContent = result.data;
      },
      {
        highlightScanRegion: true,
        calculateScanRegion: video => {
          const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
          const scanRegionSize = smallestDimension * 0.6;
          return {
            x: (video.videoWidth - scanRegionSize) / 2,
            y: (video.videoHeight - scanRegionSize) / 2,
            width: scanRegionSize,
            height: scanRegionSize,
          };
        }
      }
    );
    
    // 开始扫描
    document.getElementById('start').addEventListener('click', () => {
      qrScanner.start();
    });
    
    // 停止扫描
    document.getElementById('stop').addEventListener('click', () => {
      qrScanner.stop();
    });
  }
  
  // 在页面加载时初始化
  document.addEventListener('DOMContentLoaded', initializeScanner);
})();
```

### HTML 示例

```html
<div>
  <video id="video" style="width: 400px; height: 400px;"></video>
  <div>
    <button id="start">开始扫描</button>
    <button id="stop">停止扫描</button>
  </div>
  <div id="result"></div>
</div>
```

## 故障排除

### 常见问题

1. **"QrScanner is not defined" 错误**
   - 确保 QR Scanner 库文件在您的自定义代码之前加载
   - 检查浏览器控制台是否有其他 JavaScript 错误阻止了库的加载

2. **摄像头无法访问**
   - 确保您的网站使用 HTTPS（大多数浏览器在非 HTTPS 环境下不允许访问摄像头）
   - 确保用户已授予摄像头访问权限

3. **Worker 加载失败**
   - 如果使用标准构建，确保 worker 文件路径正确
   - 考虑使用一体化构建来避免 worker 路径问题

4. **在移动设备上无法工作**
   - 确保移动浏览器支持所需的 API
   - 在 iOS 设备上，只有 Safari 支持某些必要的摄像头 API

### 调试技巧

- 在浏览器控制台中检查是否有 JavaScript 错误
- 确认 `QrScanner` 全局变量是否可用：`console.log(typeof QrScanner)`
- 尝试使用一体化构建版本，它避免了许多路径和加载问题

## 技术细节

本项目使用以下技术：

- `qr-scanner` - 基础 QR 码扫描库
- `webpack` - 用于标准构建
- 自定义脚本 - 用于一体化构建

## 许可证

MIT

## 贡献

欢迎提交问题和拉取请求！
