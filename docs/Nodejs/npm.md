---
title: npm
article: false
---

# npm

npm 是 Node.js 的标准包管理器，用于安装、更新和管理项目依赖项的下载。

> [Yarn](https://yarnpkg.com/) 和 [pnpm](https://pnpm.io/) 是 npm 命令行工具的替代方案。
> 2026 年推荐使用 pnpm

## 官网

* [npm 官网文档](https://docs.npmjs.com/)

## 使用

如果一个项目包含 `package.json` 文件，通过运行

```bash
npm install
```

它会安装项目所需的所有内容到 `node_modules` 文件夹中，如果该文件夹尚不存在，则会创建它。

**更新 Packages**

```bash
npm update
```

**运行任务**

```json
{
  "scripts": {
    "start-dev": "node lib/server-development",
    "start": "node lib/server-production"
  }
}
```

```bash
npm run start
npm run start-dev
```

## 常用命令

```bash
npm -v  # 查看 npm 版本
npm -l  # 显示所有命令的信息

npm help    # 查看帮助

#=============================配置=============================

npm config set cache "e:/Program/Nodejs/node_cache/"    # 设置缓存路径
npm config set prefix "e:/Program/Nodejs/node_global/"  # 设置全局环境路径

npm config get registry                    # 获取当前镜像源
npm config set registry <url>          # 设置镜像源

npm config list       # 查看配置信息

#=============================初始化项目=============================

npm init              # 在当前项目交互式创建 package.json 文件(项目配置清单)
npm init -y           # 在当前项目快速生成默认的 package.json(跳过交互)

#=============================安装=============================

# 安装 package.json 中所有依赖
npm install             # 当前项目根据 package.json 安装依赖到 node_modules

# 生产环境依赖(会写入 dependencies)
npm install <package-name>              # 当前项目安装 package
npm install <package-name>@latest       # 当前项目强制更新 package 最新版本(可能突破版本限制)
npm install <package-name>@<version>    # 当前项目安装 package 指定版本

# 全局安装(工具类包，如脚手架)
npm install <package-name> -g           # 全局安装 package

#=============================卸载=============================

npm uninstall <package-name>            # 卸载当前项目的 package(同时从 package.json 移除)
npm uninstall <package-name> -g         # 卸载全局 package

#=============================更新=============================

npm update                  # 更新当前项目所有 package 到允许的最新版本
npm update <package-name>   # 更新当前项目指定 package 到 package.json 允许的最新版本
npm update -g               # 更新全局 package 到最新版本

#=============================查看=============================

# 查看依赖信息(ls = list)
npm ls                  # 查看当前项目的 package(树形结构)
npm ls --depth=0        # 查看当前项目的 package(不展开子依赖)
npm ls -g               # 查看全局安装的 package
npm list -g --depth=0   # 查看全局安装的 package(不展开子依赖)

#=============================其他=============================

npm outdated                    # 检查过时的包
npm search <package-name>       # 搜索包
npm info <package-name>         # 查看包详细信息

npm run <command> [-- <args>]   # 在当前项目运行 package.json 中定义的脚本
npm start [-- <args>]           # 在当前项目运行 package.json 中定义的 start 脚本
```

## 示例

`npm start`

```json
{
  "scripts": {
    "start": "node foo.js"
  }
}
```

`npm run test`

```json
{
    "scripts": {
        "test": "tap test/*.js"
        // "test": "node_modules/.bin/tap test/*.js"
    }
}
```

`npm ls -g`

```
F:\XXX\NodeJs\node_global
├── @google/gemini-cli@0.22.2
├── http-server@14.1.1
├── pnpm@10.7.0
└── yo@5.1.0
```

## 镜像源

* [npm 原始镜像](https://registry.npmjs.org/)
* [阿里云](https://npm.aliyun.com/)
* [腾讯云](https://mirrors.cloud.tencent.com/npm/)
* [华为云](https://mirrors.huaweicloud.com/repository/npm/)

```bash
npm config get registry # 查看当前镜像
npm config set registry https://npm.aliyun.com/ # 设置为阿里云镜像
npm config set registry https://registry.npmjs.org/ # 恢复官方镜像
```