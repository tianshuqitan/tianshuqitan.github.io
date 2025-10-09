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
        prefix: "Unity/",
        children: [
            "README.md",
            "RoadMap/README.md",
            "Manual/README.md",
            "Notes/README.MD",
            "Optimization/README.md"
        ]
    },
    {
        text: "Vue",
        prefix: "Vue/",
        children: [
            "README.md",
            "Vuepress/",
        ],
    },
    {
        text: "书签",
        link: "/Bookmarks/"
    },
    {
        text: "编程语言",
        link: "/Language/"
    }
]);