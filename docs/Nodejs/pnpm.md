---
title: pnpm
article: false
---

# pnpm

使用 npm 时，依赖每次被不同的项目使用，都会重复安装一次。而在使用 pnpm 时，依赖会被存储在内容可寻址的存储中。因此，你在磁盘上节省了大量空间，这与项目和依赖项的数量成正比，并且安装速度要快得多！

## 官网

* [pnpm - 官网](https://pnpm.io/)
* [pnpm - 官网中文](https://pnpm.io/zh/)

## 安装

```bash
npm install -g pnpm@latest-10
```

## 常用命令

```bash
pnpm help               # 显示关于 pnpm 的帮助信息
pnpm help -a            # 打印所有可用命令
pnpm init               # 创建一个 package.json 文件

# install = i
pnpm install            # 安装项目的所有依赖项

# update = up
pnpm update             # 更新项目所有依赖项，遵守 package.json 中指定的范围
pnpm update --latest	# 将项目所有依赖项更新到最新版本
pnpm update -g          # 更新全局安装的 package

pnpm add <pkg>          # 安装 package 及其依赖的任何 package
pnpm add <pkg>@3.0.0	# 安装 package 的指定版本
pnpm add -g <pkg>	    # 安装全局 package

# remove = rm
pnpm remove             # 从 node_modules 和 package.json 中删除 package
pnpm remove -g          # 移除全局 package

# ls = list
pnpm ls                 # 以树结构的形式输出已安装的所有 package 的版本以及及其依赖项
pnpm ls -g              # 列出全局安装目录中的 package 而不是当前项目中的 package

pnpm outdated           # 检查过期的包
pnpm outdated -g        # 列出过时的全局包

pnpm run <cmd>          # 运行在 package.json 文件中定义的脚本。

pnpm create react-app my-app # 创建项目

pnpm config             # 管理配置文件
pnpm config list        # 显示所有配置设置
# 设置为淘宝镜像源(pnpm 需要单独设置，即使 npm 已经设置过了)
pnpm config set registry https://registry.npmmirror.com/
pnpm config get registry # 查看镜像源
pnpm config set registry https://registry.npmjs.org/ # 恢复为官方源

pnpm <cmd>
```

## 示例

假如你有个 watch 脚本配置在了 package.json 中，像这样：

```json
"scripts": {
    "watch": "webpack --watch"
}
```

执行 watch

```bash
pnpm run watch
```
