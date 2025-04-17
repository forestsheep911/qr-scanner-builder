const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');

// 确保输出目录存在
const outputDir = path.resolve(__dirname, '../dist');
fs.ensureDirSync(outputDir);

// webpack配置
const config = {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/global-qr-scanner.js'),
  output: {
    path: outputDir,
    filename: 'qr-scanner.js',
    library: {
      name: 'QrScanner',
      type: 'umd',
      export: 'default',
      umdNamedDefine: true
    },
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false
  }
};

console.log('Building QR Scanner library...');
webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err || stats.toString({ colors: true }));
    return;
  }
  
  console.log(stats.toString({ colors: true }));
  console.log('QR Scanner library built successfully!');
  
  // 复制worker文件
  const workerSrc = path.resolve(__dirname, '../node_modules/qr-scanner/qr-scanner-worker.min.js');
  const workerDest = path.resolve(outputDir, 'qr-scanner-worker.min.js');
  
  fs.copyFile(workerSrc, workerDest, (copyErr) => {
    if (copyErr) {
      console.error('Error copying worker file:', copyErr);
      return;
    }
    console.log('Worker file copied successfully!');
  });
});