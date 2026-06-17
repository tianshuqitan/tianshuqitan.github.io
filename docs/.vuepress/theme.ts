import { hopeTheme } from "vuepress-theme-hope"
import navbar from "./navbar.js";
import { sidebarConfig } from "./sidebar.js"

export default hopeTheme({
    author: "Mr.Chen",
    // 顶部导航栏
    navbar: navbar,
    // 侧边栏
    sidebar: sidebarConfig,
    // 深色模式：开关切换
    darkmode: "switch",
    // 面包屑导航
    breadcrumb: true,
    breadcrumbIcon: true,
    // 启用插件
    plugins: {
        blog: {
            excerptLength: 120,
        },
        slimsearch: true,
        icon: {
            assets: "fontawesome",
        },
    },
    // 博客模式
    blog: {
        avatar: '/assets/avatar.jpg',
        name: 'Mr.Chen',
        description: '一个普普通通的程序开发。',
        roundAvatar: true,
    },
    hotReload: true,
    markdown: {
        codeTabs: true,
        tabs: true,
        align: true,
        attrs: true,
        sup: true,
        sub: true,
    },
    // 显示页脚
    displayFooter: true,
    // footer: "Copyright © 2026 Mr.Chen",
    // 页面元数据设置
    contributors: false,
    editLink: false,
    changelog: false,
    // 信息面板
    // pageInfo: ["Author", "Original", "Date", "Category", "Tag", "ReadingTime"],
    // repo: "https://github.com/tianshuqitan/tianshuqitan.github.io",
    // 目录自动展开深度
    catalog: true,
});