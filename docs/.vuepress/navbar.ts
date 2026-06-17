/*
 * 顶部导航栏
 */

import { navbar } from "vuepress-theme-hope"

export default navbar([
    {
        text: "主页",
        icon: "house",
        link: "/"
    },
    {
        text: "Unity",
        icon: "cube",
        prefix: "Unity/",
        children: [
            {
                text: "Unity 主页",
                icon: "house",
                link: "README.md",
            },
            {
                text: "技术路线",
                icon: "route",
                link: "RoadMap/README.md",
            },
            {
                text: "官方手册",
                icon: "book",
                link: "Manual/README.md",
            },
            {
                text: "学习笔记",
                icon: "note-sticky",
                link: "Notes/README.md",
            },
            {
                text: "性能优化",
                icon: "gauge-high",
                link: "Optimization/README.md",
            }
        ]
    },
    {
        text: "Nodejs",
        icon: "node",
        prefix: "Nodejs/",
        children:[
            {
                text: "Nodejs 主页",
                icon: "house",
                link: "README.md",
            },
            {
                text: "npm",
                icon: "box-open",
                link: "npm.md",
            },
            {
                text: "pnpm",
                icon: "box-open",
                link: "pnpm.md",
            }
        ],
    },
    {
        text: "Vue",
        icon: "vuejs",
        prefix: "Vue/",
        children: [
            {
                text: "Vue 主页",
                icon: "house",
                link: "README.md",
            },
            {
                text: "VuePress",
                icon: "scroll",
                link: "Vuepress/",
            },
        ],
    },
    {
        text: "书签",
        icon: "bookmark",
        link: "/Bookmarks/"
    },
    {
        text: "编程语言",
        icon: "code",
        link: "/Language/"
    }
]);