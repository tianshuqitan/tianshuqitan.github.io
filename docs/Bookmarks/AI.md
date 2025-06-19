---
title: "AI"
article: false
---

AI 相关内容，如大模型、API 平台、AI IDE与插件等。

<!-- more -->

# AI

## 大模型

**网页版**

* [DeepSeek Chat](https://chat.deepseek.com/)
* [通义](https://www.tongyi.com/)
* [豆包](https://www.doubao.com/chat/)

**模型下载**

* [HuggingFace](https://huggingface.co/)
* [HuggingFace - 国内镜像](https://hf-mirror.com/)

**推理模型**

* [Claude](https://www.anthropic.com/)
* [DeepSeek](https://www.deepseek.com/)
* [Gemini](https://gemini.google.com/)
* [Arena Leaderboard(排行榜)](https://web.lmarena.ai/leaderboard)
* [Google AI 开发者](https://ai.google.dev/)

**文生图**

* [Flux - Github](https://github.com/black-forest-labs/flux)
* [Flux 官网](https://blackforestlabs.ai/)


**ComfyUI**

* [ComfyUI](https://www.comfy.org/download)
  * [ComfyUI-Github](https://github.com/comfyanonymous/ComfyUI)
  * [ComfyUI-Manager](https://github.com/Comfy-Org/ComfyUI-Manager)
  * [ComfyUI-GGUF](https://github.com/city96/ComfyUI-GGUF)
  * [ComfyUI-Crystools](https://github.com/crystian/ComfyUI-Crystools)
  * [flux1-dev-fp8.safetensors](https://hf-mirror.com/Comfy-Org/flux1-dev)
    * Flux1-Dev Check Point
    * 已经包含了 TwoTextEncoders
    * ConfyUI 中使用 Load CheckPoint 节点，`ComfyUI/models/checkpoints/`
  * [flux1-schnell-fp8.safetensors](https://hf-mirror.com/Comfy-Org/flux1-schnell)
    * Flux1-Schnell Check Point
  * [flux1-schnell-Q4_K_S.gguf](https://hf-mirror.com/city96/FLUX.1-schnell-gguf)
    * [black-forest-labs/FLUX.1-schnell](https://hf-mirror.com/black-forest-labs/FLUX.1-schnell) 量化模型
    * ConfyUI 中使用 `ComfyUI-GGUF` 节点，放置目录 `ComfyUI/models/unet`

**图生模型**

* [Tripo](https://www.tripo3d.ai/)
* [Trellis3D](https://trellis3d.github.io/)
* [Trellis3D - Online](https://huggingface.co/spaces/JeffreyXiang/TRELLIS)

## 大模型 API 平台

* [OpenRouter](https://openrouter.ai/)

## IDE/Plugins

* [Cursor](https://www.cursor.com/)
* [Cline](https://app.cline.bot/)
* [RooCode](https://roocode.com/)
* [Continue](https://www.continue.dev/)
* [Trae(字节)](https://traeide.com/)
* [Trae 下载(从文档进来的)](https://www.trae.ai/)

## MCP

* [MCP(ModelContextProtocol)](https://modelcontextprotocol.io/introduction)
* [MCP 示例](https://modelcontextprotocol.io/examples)
* [MCP 官方汇总 - Github](https://github.com/modelcontextprotocol/servers)
* [Awesome MCP Servers - Github](https://github.com/punkpeye/awesome-mcp-servers)
* [Awesome MCP Servers - Web](https://mcpservers.org/ "A collection of servers for the Model Context Protocol.")

## 开源库

* [OpenPose](https://github.com/CMU-Perceptual-Computing-Lab/openpose)
* [nanoGPT](https://github.com/karpathy/nanoGPT "The simplest, fastest repository for training/finetuning medium-sized GPTs.")

## AI 工具网站

* [LiblibAI](https://www.liblib.art/)
* [OpenPoseEditor](https://openposeai.com/)
* [OpenPoseEditor - ZhuYu(推荐)](https://zhuyu1997.github.io/open-pose-editor/?lng=zh)
* [LLM 3D 可视化](https://bbycroft.net/llm)

## AI 翻译

[吴恩达老师的反思式三步翻译法：AI 翻译 Prompt](https://blog.baduyifei.com/ai-translation-prompt/)

```
你是一位精通简体中文的专业翻译。请帮我将该 Markdown 文档翻译为中文，并另存为文件。

规则：
1. 翻译要遵循原文，不要随意扩展，也不要遗漏任何信息。
2. 保留原始 Markdown 格式。
3. 保留 Unity 及计算机等相关术语。
4. 翻译专业术语的时候，第一次出现要在括号里面写上英文原文，如："垃圾回收(Garbage Collector)"，之后就可以只写中文了。
5. 人名不翻译。
6. 代码块不翻译。
7. Markdown 的引用以及链接不翻译。
8. 在保证内容的原意的基础上，尝试进行意译，使其更易于理解，更符合中文的表达习惯，同时保持原有的格式不变。

翻译不完整，请补全剩余部分。
```