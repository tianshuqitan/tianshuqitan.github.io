import { hopeTheme } from "vuepress-theme-hope"
import navbar from "./navbar.js";
import { sidebarConfig } from "./sidebar.js"

export default hopeTheme({
    author: "Mr.Chen",
    // 顶部导航栏
    navbar: navbar,
    // 侧边栏
    sidebar: sidebarConfig,
    // 深色模式：提供切换开关，默认跟随系统
    // darkmode: "switch",
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
    },
    hotReload: true,
    markdown: {
        codeTabs: true,
    },
    // 显示页脚
    displayFooter: true,
    // footer: "Copyright © 2026 Mr.Chen",
    // 页面元数据设置
    contributors: false,
    editLink: false,
    changelog: false,
    // 目录自动展开深度
    catalog: true,
});