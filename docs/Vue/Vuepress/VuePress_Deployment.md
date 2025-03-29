---
title : Vuepress 部署
order : 2
article: false
---

# 部署到 Github

## 项目根目录下创建 `.gitignore`

```
# Node.js
node_modules/
npm-debug.log

# VuePress
# 默认临时文件目录
.vuepress/.temp
# 默认缓存目录
.vuepress/.cache
# 默认构建生成的静态文件目录
.vuepress/dist

# System
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/
```

## 同步到 Github

1. 项目需要设置为 `public` `General/Danger Zone/Change Visibility`
1. 项目需要设置为可读可写 `Actions/General/Workflow permissions/Read and write permissions`
2. 创建 `GithubAction` `Pages/Github Actions/Create your own`
   1. 会在 `.github\workflows\` 下创建文件，命名为 `docs.yml`
   2. 执行过一次之后，设置 `Deploy From a branch`，选择分支 `gh-pages`，目录选择根目录。
3. 最终部署页面为 `https://{username}.github.io/{xxx}`

> 最好是新建一个名为 `{username.github.io}` 的项目，即可以直接使用 `https://{Username}.github.io` 网址。

```yml
name: docs

on:
  # 每当 push 到 main 分支时触发部署
  push:
    branches: [main]
  # 手动触发部署
  workflow_dispatch:

jobs:
  docs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          # “最近更新时间” 等 git 日志相关信息，需要拉取全部提交记录
          fetch-depth: 0

      - name: 设置 pnpm
        uses: pnpm/action-setup@v4
        with:
            verison: 10

      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          # 选择要使用的 node 版本
          node-version: 22
          # 缓存 pnpm 依赖
          cache: pnpm

      - name: 安装依赖
        run: pnpm install --frozen-lockfile

      # 运行构建脚本
      - name: 构建 VuePress 站点
        run: pnpm docs:build

      # 查看 workflow 的文档来获取更多信息
      # @see https://github.com/crazy-max/ghaction-github-pages
      - name: 部署到 GitHub Pages
        uses: crazy-max/ghaction-github-pages@v4
        with:
          # 部署到 gh-pages 分支
          target_branch: gh-pages
          # 部署目录为 VuePress 的默认输出目录
          build_dir: docs/.vuepress/dist
        env:
          # @see https://docs.github.com/cn/actions/reference/authentication-in-a-workflow#about-the-github_token-secret
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 报错处理

如果发现提交后没有发布成功，则 `Action` 执行报错，在 `Github` 项目的 `Actions` 查看报错：

```
Error: No pnpm version is specified. Please specify it by one of the following ways: - in the GitHub Action config with the key "version" - in the package.json with the key "packageManager"
```

需要指定 `pnpm` 版本

```yml
      - name: 设置 pnpm
        uses: pnpm/action-setup@v4
        with:
            verison: 10
```

## 参考

* [github-pages](https://vuepress.vuejs.org/zh/guide/deployment.html#github-pages)
* [azure-webapps-node.yml](/Attachment/azure-webapps-node.yml)
* [从零开始：VuePress2 + GitHub Pages 搭建你的第一个免费博客网站](https://zhuanlan.zhihu.com/p/672087461)