# AICode

* [VibeVibe](https://www.vibevibe.cn/zh/)

## AI IDE

基本都是基于 VSCode 做的编辑器，可选择大模型。

* [OpenCode](https://opencode.ai/zh)
  * 开源 AI 编程代理，内置免费模型，或连接任意提供商的任意模型，包括 Claude, GPT, Gemini 等。
* [Cursor](https://cursor.com/cn)
* [Trae](https://www.trae.cn/)
  * 公司: 字节跳动
* [Windsurf](https://windsurf.com/)

## AI 插件

* [Claude Code(推荐)](https://claude.com/product/claude-code)
* [Codex](https://developers.openai.com/codex/ide)
  * OpenAI’s coding agent
* [RooCode(推荐)](https://roocode.com/)
  * Cline 分支
* [OpenCode](https://opencode.ai/zh)
* [Cline](https://cline.bot/)
* [Copilot](https://github.com/features/copilot)
  * VSCode 自带，有一定的免费额度
  * 默认模型: Claude Haiku 4.5
* [通义灵码](https://lingma.aliyun.com/lingma)

## CLI 命令行工具

* [Claude Code](https://claude.com/product/claude-code)
  * `npm install -g @anthropic-ai/claude-code`
  * [Claude Code Router](https://github.com/musistudio/claude-code-router)
    * CLI 代理。
    * 跳过 Anthropic 账号/登录。
    * 支持更换模型 OpenRouter、DeepSeek、Gemini。
    * 如果官方适配(如 GLM)，就不需要了。
* [Codex](https://developers.openai.com/codex/cli)
  * `npm i -g @openai/codex`
* [Gemini CLI](https://geminicli.com/)
  * `npm install -g @google/gemini-cli`
* [Cline CLI](https://cline.bot/)
  * `npm install -g cline`
* [QwenCode](https://qwen.ai/qwencode)
  * https://qwen.ai/blog?id=qwen3-coder
  * 修改自 Gemini CLI，针对 Qwen3‑Coder 系列的模型增强了解析器和工具支持。
* [OpenCode](https://opencode.ai/zh)
  * `npm i -g opencode-ai`

## ClaudeCode + GLM

[配置参考](https://docs.bigmodel.cn/cn/coding-plan/tool/claude)

**安装ClaudeCode**

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

[智谱API平台](https://bigmodel.cn/apikey/platform) 创建 API_KEY

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

## Coding Plan

* [阿里云百炼-需要抢购](https://help.aliyun.com/zh/model-studio/coding-plan)
* [智谱-需要抢购](https://bigmodel.cn/glm-coding)
* [腾讯云-需要抢购](https://console.cloud.tencent.com/tokenhub/codingplan)
