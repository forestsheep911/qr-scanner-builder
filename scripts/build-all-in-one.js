const fs = require('fs-extra');
const path = require('path');

// 确保输出目录存在
const outputDir = path.resolve(__dirname, '../dist');
fs.ensureDirSync(outputDir);

// 读取QR Scanner库文件
const qrScannerPath = path.resolve(__dirname, '../node_modules/qr-scanner/qr-scanner.min.js');
let qrScannerContent = fs.readFileSync(qrScannerPath, 'utf-8');

// 读取worker文件
const workerPath = path.resolve(__dirname, '../node_modules/qr-scanner/qr-scanner-worker.min.js');
const workerContent = fs.readFileSync(workerPath, 'utf-8');

// 查找并移除export语句
const lastSemicolonIndex = qrScannerContent.lastIndexOf(';');
if (lastSemicolonIndex !== -1) {
  const afterLastSemicolon = qrScannerContent.substring(lastSemicolonIndex + 1);
  if (afterLastSemicolon.includes('export')) {
    qrScannerContent = qrScannerContent.substring(0, lastSemicolonIndex + 1);
    console.log('成功移除export语句');
  }
} else {
  console.warn('警告：无法找到分号来定位export语句');
}

// 创建最终的合并文件
const finalContent = `
(function(global) {
  'use strict';
  
  // QR Scanner库代码
  ${qrScannerContent}
  
  // 内联worker代码
  const workerContent = ${JSON.stringify(workerContent)};
  
  // 覆盖createQrEngine方法
  const originalCreateQrEngine = e.createQrEngine;
  e.createQrEngine = async function() {
    // 如果浏览器支持BarcodeDetector API，使用它
    if (!e._disableBarcodeDetector && 
        'BarcodeDetector' in global && 
        BarcodeDetector.getSupportedFormats && 
        (await BarcodeDetector.getSupportedFormats()).includes('qr_code')) {
      return new BarcodeDetector({ formats: ['qr_code'] });
    }
    
    // 否则使用worker
    const blob = new Blob([workerContent], { type: 'text/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    // 清理URL对象
    URL.revokeObjectURL(workerUrl);
    return worker;
  };
  
  // 将QrScanner暴露为全局变量
  global.QrScanner = e;
  
})(typeof window !== 'undefined' ? window : this);
`;

// 写入文件
const outputPath = path.resolve(outputDir, 'qr-scanner-all-in-one.js');
fs.writeFileSync(outputPath, finalContent);
console.log(`成功创建合并文件: ${outputPath}`);