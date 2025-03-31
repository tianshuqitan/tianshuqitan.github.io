---
title : Vuepress 主题 Hope
order : 5
article: false
---

Vuepress ThemeHope 安装于配置。

<!-- more -->

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

首页关闭背景和名称

```
---
hero: false
---
```

**文章列表**

如果你不希望该列表包含一些特定的文章，只需在文章的 `frontmatter` 中将 `article` 设置为 `false`，或者你也可以通过主题选项中的 `plugins.blog.filter` 自定义哪些页面是文章。

如果你希望在文章列表中置顶特定文章，只需在文章的 `frontmatter` 中将 `sticky` 设置为 `true`。

:::tip
对于置顶文章，你可以将 `sticky` 设置为 `number` 来设置它们的顺序。数值大的文章会排列在前面。
:::

**文章摘要**

如果你想要为文章添加摘要，你可以使用 `<!-- more -->` 注释来标记它。任何在此注释之前的内容会被视为摘要(推荐)。

同时，如果你想设置的摘要并不是你要在文章开头展示的内容，你也可以在 `Frontmatter` 中通过 `excerpt` 选项来设置 `HTML` 字符串。

主题按照上述规则默认自动生成摘要，如果你只想让主题展示你指定的摘要或在 `Frontmatter` 中设置的描述，请在主题选项中设置 `plugins.blog.excerptLength: 0`。

**分类与标签**

只需要在页面 `frontmatter` 中设置 `category` 数组，并设置一个或多个文章所属的分类。

只需要在页面的 `frontmatter` 中设置 `tag`，并设置一个或多个文章所属的标签。

```
---
tag:
  - HTML
  - Web
---
```

**星标**

你可以通过在 `frontmatter` 中设置 `star` 为 `true` 星标一个文章。

任何星标的文章都会显示在博客主页侧边栏的文章栏目中。可以将 `star` 设置为 `number` 来设置它们的顺序。数值大的文章会排列在前面。

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

### 导航栏

**字符串格式**

配置导航栏最简单的方式，是依次填入需要展示的页面文件的路径，这样导航栏的文字、图标和链接会自动通过对应文件生成。

```ts
import { defineUserConfig } from "vuepress";
import { hopeTheme } from "vuepress-theme-hope";

export default defineUserConfig({
    theme: hopeTheme({
        navbar: ["/guide/README.md", "/config/README.md", "/faq.md"],
    }),
});
```

:::tip
我们推荐你省略 `.md` 扩展名，以 `/` 结尾的路径会被推断为 `/README.md`。
:::

**对象格式**

* `text`: 项目文字
* `link`: 项目链接
* `icon`: 项目图标 (可选)
* `activeMatch`: 项目激活匹配 (可选)，支持正则字符串。

**参考**

* [ThemeHope - Navbar](https://theme-hope.vuejs.press/zh/guide/layout/navbar.html)

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

### 页面信息

页面信息默认全局启用，同时支持页面配置。

条目 | 对应内容 | 页面 `frontmatter` 值 | 主题设置的配置项
:---|:------|:------------------|:---------
"Author" | 作者 | **author** | author
"Date" | 写作日期 | date | N/A
"Original" | 是否原创 | isOriginal | N/A
"Category" | 分类 | **category** | N/A
"Tag" | 标签 | **tag** | N/A
"ReadingTime" | 预计阅读时间 | N/A(自动生成) | N/A
"Word" | 字数 | N/A(自动生成) | N/A
"PageView" | 访问量 | pageview (仅 Waline 可用) | plugins.comment.pageview

### 页面元数据

主题通过 `@vuepress/plugin-git` 插件在页面底部显示页面的最后更新时间与贡献者，并提供了“编辑此页”按钮的支持。

主题同时根据侧边栏配置提供上一页和下一页的导航按钮。

**编辑此页链接**

你可以通过在主题选项中设置如下项目，来自动为每个页面生成编辑此页链接:

* `docsRepo`: 文档仓库地址，默认同主题选项中的 `repo`
* `docsDir`: 文档在仓库中的目录，默认为根目录
* `docsBranch`: 文档存放的分支，默认为 "main"

**显示控制**

如果你想要全局禁用这些项目的显示，请在主题选项中，将以下对应项目设置为 `false`。你也可以在 `Frontmatter` 中设置这些项目来启用/禁用指定页面:

* `lastUpdated`: 是否显示页面最后更新时间
* `contributors`: 是否显示页面贡献者
* `editLink`: 是否展示编辑此页链接
* `changelog`: 是否显示变更日志

### [Frontmatter](https://theme-hope.vuejs.press/zh/config/frontmatter/info.html)

* `title`: 当前页面内容标题，默认为 Markdown 文件中的第一个 h1 标签内容。
* `date`: 写作时间，格式: `YYYY-MM-DD` 或 `YYYY-MM-DD hh:mm:ss`
* `description`: 页面的描述。会覆盖站点配置中的 `description` 配置项。
* `icon`: 当前页面图标的 FontClass 或文件路径 (建议填写)。
* `category`: `string | string[]`，分类。
* `tag`: `string | string[]`，标签。
* `article`: `boolean`，是否将该文章添加至文章列表中。
* `sticky`: `boolean | number`，是否在列表中置顶。当填入数字时，数字越大，排名越靠前。
* `star`: `boolean | number`，是否标为星标文章。当填入数字时，数字越大，排名越靠前。

### [Markdown](https://theme-hope.vuejs.press/zh/guide/markdown/intro.html)

提示容器

:::important
重要提示。
:::

:::info
信息提示。
:::

:::note
注释容器。
:::

:::tip
提示容器。
:::

:::warning
警告容器。
:::

:::caution 自定义标题
危险容器。
:::

:::details 自定义标题
详情容器。
:::