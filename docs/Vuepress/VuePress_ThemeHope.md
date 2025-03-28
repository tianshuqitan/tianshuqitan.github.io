---
title : 主题 Hope
order : 5
---

# 主题 Hope

## 链接

* [官网](https://theme-hope.vuejs.press/zh/guide/)

## 安装

从头创建项目(在 `<dir>` 文件夹内新建项目)：

```bash
pnpm create vuepress-theme-hope <dir>
```

在已有项目中使用该主题：

1. 添加 `vuepress-theme-hope` 依赖。

```bash
pnpm add -D vuepress-theme-hope
```
::: tip
`pnpm add -D` 安装开发依赖。
:::

安装完毕后，可以在 `package.json` 的开发依赖中，找到：

```json
{
    "devDependencies": {
        "vuepress-theme-hope": "2.0.0-rc.76"
    }
}
```

2. 在 `config.js` 中引入主题，更改主题设置。

```js
import { defineUserConfig } from "vuepress";
import { hopeTheme } from "vuepress-theme-hope";

export default defineUserConfig({
    theme: hopeTheme({
        // 此处放置主题配置
    }),
});
```

## 配置

### 添加搜索框

安装 `@vuepress/plugin-slimsearch`

```bash
pnpm add -D @vuepress/plugin-slimsearch@next
```

在主题选项(`config.js`)中配置 `plugins.slimsearch`。你可以将 `plugins.slimsearch` 设置为 `true` 来直接启用它，

```js
import { hopeTheme } from "vuepress-theme-hope";

export default {
    theme: hopeTheme({
        plugins: {
            slimsearch: true,
        },
    }),
};
```

或者将其设置为一个对象来自定义插件。

```js
import { hopeTheme } from "vuepress-theme-hope";

export default {
    theme: hopeTheme({
        plugins: {
            slimsearch: {
                // ...
            },
        },
    }),
};
```

### 博客模式

启用博客模式（默认不启用），在主题选项设置中

```js
import { hopeTheme } from "vuepress-theme-hope";

export default {
    theme: hopeTheme({
        plugins: {
            blog: true,
        },
    }),
};
```

博客首页设置，在相关页面的 `frontmatter` 中，设置

```
home: true
layout: BlogHome
```

### 图标

主题支持直接使用 [fontawesome](https://fontawesome.com/search?ic=free) 中的图标。需要修改图标资产模式(默认 iconify)：

```js
import { hopeTheme } from "vuepress-theme-hope";

export default {
    theme: hopeTheme({
        plugins: {
            icon: {
                // 关键词: "iconify", "fontawesome", "fontawesome-with-brands"
                assets: "fontawesome",
            },
        },
    }),
};
```

在 Markdown 中

```
使用 home 图标
::home::
修改颜色 blue
::home /blue::
```

实际效果

::home::

::home /blue::

在配置中，设置图标：

* 页面: 在 `frontmatter` 中设置 `icon`
  > 此图标将用于路径导航、页面标题、导航栏生成项、侧边栏生成项、页面导航等。
* 导航栏: 在导航栏项中设置 `icon` 选项
* 侧边栏: 在侧边栏项中设置 `icon` 选项

### 侧边栏

多个侧边栏：不同的页面组显示不同的侧边栏。

目录结构

```
.
├─ README.md
├─ contact.md
├─ about.md
├─ foo/
│   ├─ README.md
│   ├─ one.md
│   └─ two.md
└─ bar/
    ├─ README.md
    ├─ three.md
    └─ four.md
```

```js
sidebar: {
  "/foo/": [
    ""
    "one",
    "two",
  ],

  "/bar/": [
    "" ,
    "three",
    "four",
  ],
  // fallback
  "/": [
    "",
    "contact",
    "about",
  ],
},
```

根据文件结构自动生成侧边栏：

```js
sidebar: {
    "/foo/": "structure",
    "/bar/": "structure",
    // fallback
    "/": [
        "",
        "contact",
        "about",
    ],
},
```

在页面的 `Frontmatter` 中通过 `index` 控制是否被包含，通过 `order` 控制顺序。

### 页脚

默认是隐藏的，需要开启。通过 `footer` 设置全局页脚。

:::tip
也可以在页面 `frontmatter` 中配置 `footer`，`copyright` 和 `license` 字段，指定特定页面的页脚内容。
:::

```js
import { hopeTheme } from "vuepress-theme-hope"

export default hopeTheme({
    footer: "Copyright © 2024 Mr.Chen",
    displayFooter: true
});
```