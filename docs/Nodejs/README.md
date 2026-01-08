---
title: Nodejs
---

# Nodejs

Node.js® 是一个免费、开源、跨平台的 JavaScript 运行时环境，它让开发人员能够创建服务器、 Web 应用、命令行工具和脚本。

* [Nodejs 官网](https://nodejs.org/en/)
  * [Nodejs 官网中文](https://nodejs.org/zh-cn)
* [Nodejs 下载](https://nodejs.org/zh-cn/download) 选择 pnpm 版本的，下载 `独立文件(.zip)`
  
![NodejsDownload](./Assets/NodejsDownload.png)

```bash
node -v     # 查看 Node.js 版本
npm -v      # 查看 npm 版本
```

## 设置环境变量

将 Nodejs 根目录和 Nodejs 的全局路径(如果有手动修改的话)加到环境变量中。

## 基础用法

**创建 http 服务器**

```js
// server.js
const { createServer } = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

**运行程序**

```bash
node server.js
```

## 常见问题

### npm 执行报错

```
Error: Cannot find module 'E:\Program\Nodejs\node_modules\npm\bin\npm-cli.js'
```

查看 `Nodejs\node_modules\npm` 文件夹是否还存在(不知道为啥被清理掉了)，不在的话从 [Nodejs 官网](https://nodejs.org/en/) 下载压缩包，将 npm 拷贝过来或者下载 nodejs 的安装文件，`node-v14.0.0-x64.msi`，双击，点击 `repair`，即可。