import { hopeTheme } from "vuepress-theme-hope"
import navbar from "./navbar.js";
import sidebar from "./sidebar.js"

export default hopeTheme({
    logo: 'https://vuejs.press/images/hero.png',
    navbar: navbar,
    sidebar: sidebar,
    plugins: {
        blog: true,
        slimsearch: true,
        icon: {
            assets: "fontawesome",
        },
    },
    blog: {
        avatar: '/assets/avatar.jpg',
        name: 'Mr.Chen',
        description: '一个普普通通的程序开发。'
    },
    hotReload: true,
    markdown: {
        codeTabs: true,
    },
    footer: "Copyright © 2024 Mr.Chen",
    displayFooter: true
});