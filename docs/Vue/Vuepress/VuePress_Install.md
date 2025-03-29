---
title: Vuepress 安装
order : 1
article: false
---

# 安装

## 环境

* [Node.js v18.19.0+](https://nodejs.org/)
* [pnpm](https://pnpm.io/zh/)

::: tip

npm 设置缓存路径

```bash
npm config set prefix "E:\\Program\\Nodejs\\node_global\\"
npm config set cache "E:\\Program\\Nodejs\\node_cache\\"
npm config list
```

npm 安装 pnpm

```bash
npm install -g pnpm
```
:::

## 创建项目

### 通过命令行创建(推荐)

你可以通过 [create-vuepress](https://www.npmjs.com/package/create-vuepress) 直接创建项目模板。

::: code-tabs#shell

@tab pnpm

```bash
pnpm create vuepress vuepress-starter
```

:::

会自动创建目录，配置，工作流等。

### 手动创建

- 创建并进入一个新目录

```bash
mkdir vuepress-starter
cd vuepress-starter
```

- 初始化项目

```bash
git init
pnpm init
```

- 安装 VuePress

```bash
# 安装 vuepress 和 vue
pnpm add -D vuepress@next vue
# 安装打包工具和主题
pnpm add -D @vuepress/bundler-vite@next @vuepress/theme-default@next
```

- 创建 `docs` 目录和 `docs/.vuepress` 目录

```bash
mkdir docs
mkdir docs/.vuepress
```

- 创建 VuePress 配置文件 `docs/.vuepress/config.js`

```ts
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
    bundler: viteBundler(),
    theme: defaultTheme(),
})
```

- 创建你的第一篇文档

```bash
echo '# Hello VuePress' > docs/README.md
```

## 目录结构

创建完成后，你项目的目录结构应该是这样的：

```
├─ docs
│  ├─ .vuepress
│  │  └─ config.js
│  └─ README.md
└─ package.json
```

`docs` 目录是你放置 `Markdown` 文件的地方，它同时也会作为 `VuePress` 的源文件目录。

`docs/.vuepress` 目录，即源文件目录下的 `.vuepress` 目录，是放置所有和 `VuePress` 相关的文件的地方。当前这里只有一个配置文件。默认还会在该目录下生成临时文件、缓存文件和构建输出文件。建议你把它们添加到 `.gitignore` 文件中。

示例 `.gitignore` 文件

```
# VuePress 默认临时文件目录
.vuepress/.temp
# VuePress 默认缓存目录
.vuepress/.cache
# VuePress 默认构建生成的静态文件目录
.vuepress/dist
```

## 使用 VuePress

### 启动开发服务器

你可以在 `package.json` 中添加一些 [scripts](https://classic.yarnpkg.com/zh-Hans/docs/package-json#toc-scripts) ：

```json
{
    "scripts": {
        "docs:dev": "vuepress dev docs",
        "docs:build": "vuepress build docs"
    }
}
```

运行 `docs:dev` 脚本可以启动开发服务器:

```bash
pnpm docs:dev
```

`VuePress` 会在 [http://localhost:8080](http://localhost:8080) 启动一个热重载的开发服务器。当你修改你的 `Markdown` 文件时，浏览器中的内容也会自动更新。

### 构建你的网站

运行 `docs:build` 脚本可以构建你的网站：

```bash
pnpm docs:build
```

在 `docs/.vuepress/dist` 目录中可以找到构建生成的静态文件。你可以查看[部署](./VuePress_Deployment.md)来了解如何部署你的网站。