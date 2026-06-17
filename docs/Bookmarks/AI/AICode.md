---
title: "AI Code"
article: false
---

# AI Code

<div class="vp-card-container">

<VPCard title="VibeVibe" desc="Vibe Coding 教程。Next.js, React, 全栈开发，适合初学者和进阶学习者。" logo="https://www.vibevibe.cn/logo.png" link="https://www.vibevibe.cn/zh/" background="rgba(255, 255, 255, 0.15)" />

<VPCard title="OpenCode" desc="开源 AI 编程代理，支持 Claude, GPT, Gemini 等模型" logo="https://opencode.ai/favicon-96x96-v3.png" link="https://opencode.ai/zh" background="rgba(59, 130, 246, 0.15)" />

<VPCard title="Cursor" desc="专为让您实现超高生产力而打造，最佳 AI 编程智能体" logo="https://cursor.com/marketing-static/og/opengraph-default.png" link="https://cursor.com/cn" background="rgba(247, 247, 244, 0.15)" />

<VPCard title="Trae" desc="国内首款 AI 原生集成开发环境，深度集成 Doubao-1.5-pro 与 DeepSeek 模型" logo="https://lf-cdn.trae.com.cn/obj/trae-com-cn/trae_website_prod_cn/favicon.png" link="https://www.trae.cn/" background="rgba(59, 130, 246, 0.15)" />

<VPCard title="Devin" desc="原 Windsurf，管理本地和云端 Agent 舰队，规划、委托、审查一站式完成" logo="https://devin.ai/icon.png" link="https://devin.ai/" background="rgba(99, 102, 241, 0.15)" />

</div>

## AI 插件

<div class="vp-card-container">

<VPCard title="Claude Code" desc="推荐 - Anthropic 官方 CLI 编程代理" logo="https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/ce67964e7-CAX1bqSh.png" link="https://claude.com/product/claude-code" background="rgba(217, 119, 87, 0.15)" />

<VPCard title="Codex" desc="OpenAI's coding agent" logo="https://www.google.com/s2/favicons?domain=openai.com&sz=64" link="https://developers.openai.com/codex/ide" background="rgba(16, 163, 127, 0.15)" />

<VPCard title="RooCode" desc="推荐 - Cline 分支，功能增强" logo="https://www.google.com/s2/favicons?domain=roocode.com&sz=64" link="https://roocode.com/" background="rgba(59, 130, 246, 0.15)" />

<VPCard title="Cline" desc="VSCode AI 编程插件" logo="https://cline.bot/assets/branding/favicons/favicon-256x256.png" link="https://cline.bot/" background="rgba(139, 92, 246, 0.15)" />

<VPCard title="Copilot" desc="VSCode 自带，有一定免费额度" logo="https://github.githubassets.com/favicons/favicon.svg" link="https://github.com/features/copilot" background="rgba(36, 41, 47, 0.15)" />

<VPCard title="通义灵码" desc="阿里云 AI 编程助手" logo="https://www.google.com/s2/favicons?domain=lingma.aliyun.com&sz=64" link="https://lingma.aliyun.com/lingma" background="rgba(255, 106, 0, 0.15)" />

</div>

## CLI 命令行工具

<div class="vp-card-container">

<VPCard title="Claude Code" desc="npm install -g @anthropic-ai/claude-code" logo="https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/ce67964e7-CAX1bqSh.png" link="https://claude.com/product/claude-code" background="rgba(217, 119, 87, 0.15)" />

<VPCard title="Codex" desc="npm i -g @openai/codex" logo="https://www.google.com/s2/favicons?domain=openai.com&sz=64" link="https://developers.openai.com/codex/cli" background="rgba(16, 163, 127, 0.15)" />

<VPCard title="Gemini CLI" desc="npm install -g @google/gemini-cli" logo="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_16dp.png" link="https://geminicli.com/" background="rgba(66, 133, 244, 0.15)" />

<VPCard title="Cline CLI" desc="npm install -g cline" logo="https://cline.bot/assets/branding/favicons/favicon-256x256.png" link="https://cline.bot/" background="rgba(139, 92, 246, 0.15)" />

<VPCard title="QwenCode" desc="修改自 Gemini CLI，针对 Qwen3-Coder 增强" logo="https://www.google.com/s2/favicons?domain=qwen.ai&sz=64" link="https://qwen.ai/qwencode" background="rgba(99, 102, 241, 0.15)" />

<VPCard title="OpenCode" desc="npm i -g opencode-ai" logo="https://opencode.ai/favicon-96x96-v3.png" link="https://opencode.ai/zh" background="rgba(59, 130, 246, 0.15)" />

</div>

## Claude Code + GLM

[配置参考](https://docs.bigmodel.cn/cn/coding-plan/tool/claude)

**安装 Claude Code**

```bash
npm install -g @anthropic-ai/claude-code
```

```bash
irm https://claude.ai/install.ps1 | iex
```

验证安装

```bash
claude --version
```

**GLM**

[智谱 API 平台](https://bigmodel.cn/apikey/platform) 创建 API_KEY

Windows 新建 `用户名/.claude/settings.json`

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_zhipu_api_key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1
  }
}
```

Windows 新建 `用户名/.claude.json`

```json
{
  "hasCompletedOnboarding": true
}
```

**切换模型**

`用户名/.claude/settings.json`

```json
{
  "env": {
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-5.1",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5.1",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1"
  }
}
```

如果需要频繁切换大模型，使用 [cc-switch](https://github.com/farion1231/cc-switch)

插件安装 `/plugin`

```
code-review	代码审查
code-simplifier	代码简化
context7	库文档查询
```

**[阿里云百炼接入 Claude Code](https://help.aliyun.com/zh/model-studio/claude-code)**

```json
{
  "ANTHROPIC_BASE_URL": "https://dashscope.aliyuncs.com/apps/anthropic",
  "ANTHROPIC_API_KEY|ANTHROPIC_AUTH_TOKEN": "YOUR_DASHSCOPE_API_KEY",
  "ANTHROPIC_MODEL": "glm-5.1|glm-5|glm-4.7|glm-4.6"
}
```

**[Kimi 接入 Claude Code](https://www.kimi.com/code/docs/more/third-party-agents.html)**

```json
{
  "ANTHROPIC_BASE_URL": "https://api.kimi.com/coding/",
  "ANTHROPIC_API_KEY|ANTHROPIC_AUTH_TOKEN": "YOUR_DASHSCOPE_API_KEY",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "kimi-for-coding",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "kimi-for-coding",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "kimi-for-coding"
}
```

## Coding Plan

<div class="vp-card-container">

<VPCard title="阿里云百炼" desc="需要抢购，每日 09:30" logo="https://www.google.com/s2/favicons?domain=aliyun.com&sz=64" link="https://common-buy.aliyun.com/coding-plan" background="rgba(255, 106, 0, 0.15)" />

<VPCard title="智谱" desc="需要抢购，每日 10:00" logo="https://www.google.com/s2/favicons?domain=bigmodel.cn&sz=64" link="https://bigmodel.cn/glm-coding" background="rgba(59, 130, 246, 0.15)" />

<VPCard title="腾讯云" desc="需要抢购" logo="https://www.google.com/s2/favicons?domain=cloud.tencent.com&sz=64" link="https://console.cloud.tencent.com/tokenhub/codingplan" background="rgba(0, 115, 230, 0.15)" />

</div>
