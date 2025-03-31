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
        text: "Vue",
        prefix: "Vue/",
        children: [
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