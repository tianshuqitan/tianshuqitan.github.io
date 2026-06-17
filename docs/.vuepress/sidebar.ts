/*
 * 侧边栏 
 */

import { sidebar } from "vuepress-theme-hope";

export const sidebarConfig = sidebar({
    "/Vue/": "structure",
    "/Bookmarks/": "structure",
    "/Language/": "structure",
    "/Unity/": [
        "README.md",
        "RoadMap/",
        "Manual/",
        "Notes/",
        "Optimization/",
    ],
    "/Nodejs/":[
        "README.md",
        "npm.md",
        "pnpm.md"
    ],
    // 博客插件生成的页面使用自动生成目录
    "/category/": "structure",
    "/tag/": "structure",
    "/article/": "structure",
    "/star/": "structure",
    "/timeline/": "structure",
});