import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import theme from "./theme.js"

export default defineUserConfig({
    lang: 'zh-CN',
    title: 'Mr.Chen',
    description: '沧海一粟',
    theme: theme,
    bundler: viteBundler()
})
