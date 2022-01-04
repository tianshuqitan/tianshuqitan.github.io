import{_ as n,c as a,o as t,b as e}from"./app.c05613ff.js";const m='{"title":"Frontmatter","description":"","frontmatter":{},"headers":[{"level":2,"title":"JSON \u683C\u5F0F","slug":"json-\u683C\u5F0F"},{"level":2,"title":"\u9884\u5B9A\u4E49\u5C5E\u6027","slug":"\u9884\u5B9A\u4E49\u5C5E\u6027"}],"relativePath":"vitepress/vitepress_frontmatter.md","lastUpdated":1641277086967}',s={},o=e(`<h1 id="frontmatter" tabindex="-1">Frontmatter <a class="header-anchor" href="#frontmatter" aria-hidden="true">#</a></h1><p>\u6240\u6709\u5305\u542B YAML frontmatter \u5757\u7684 Markdown \u6587\u4EF6\u5C06\u7531 <a href="https://github.com/jonschlinkert/gray-matter" target="_blank" rel="noopener noreferrer">gray-matter</a> \u5904\u7406\u3002frontmatter \u5FC5\u987B\u4F4D\u4E8E Markdown \u6587\u4EF6\u7684\u9876\u90E8\uFF0C\u4E14\u5FC5\u987B\u91C7\u7528\u6709\u6548\u7684 YAML \u683C\u5F0F\uFF08---\uFF09</p><div class="language-md"><pre><code><span class="token front-matter-block"><span class="token punctuation">---</span>
<span class="token font-matter yaml language-yaml"><span class="token key atrule">title</span><span class="token punctuation">:</span> Docs with VitePress
<span class="token key atrule">editLink</span><span class="token punctuation">:</span> <span class="token boolean important">true</span></span>
<span class="token punctuation">---</span></span>
</code></pre></div><p>\u5728\u4E09\u6A2A\u7EBF\u4E4B\u95F4\uFF0C\u4F60\u53EF\u4EE5\u8BBE\u7F6E<a href="#%E9%A2%84%E5%AE%9A%E4%B9%89%E5%B1%9E%E6%80%A7">\u9884\u5B9A\u4E49\u5C5E\u6027</a>\uFF0C\u751A\u81F3\u81EA\u5B9A\u4E49\u53D8\u91CF\u3002\u8FD9\u4E9B\u53D8\u91CF\u53EF\u4EE5\u901A\u8FC7\u7279\u6B8A\u7684 <code>$frontmatter</code> \u53D8\u91CF\u4F7F\u7528\u3002</p><div class="language-md"><pre><code><span class="token front-matter-block"><span class="token punctuation">---</span>
<span class="token font-matter yaml language-yaml"><span class="token key atrule">title</span><span class="token punctuation">:</span> Docs with VitePress
<span class="token key atrule">editLink</span><span class="token punctuation">:</span> <span class="token boolean important">true</span></span>
<span class="token punctuation">---</span></span>

<span class="token title important"><span class="token punctuation">#</span> {{ $frontmatter.title }}</span>

Guide content
</code></pre></div><h2 id="json-\u683C\u5F0F" tabindex="-1">JSON \u683C\u5F0F <a class="header-anchor" href="#json-\u683C\u5F0F" aria-hidden="true">#</a></h2><p>VitePress \u540C\u6837\u652F\u6301 JSON \u683C\u5F0F\u7684 frontmatter \u8BED\u6CD5\uFF0C\u4EE5\u82B1\u62EC\u53F7\u5F00\u5934\u548C\u7ED3\u5C3E\uFF1A</p><div class="language-json"><pre><code>---
<span class="token punctuation">{</span>
    <span class="token property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Blogging Like a Hacker&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;editLink&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span>
<span class="token punctuation">}</span>
---
</code></pre></div><h2 id="\u9884\u5B9A\u4E49\u5C5E\u6027" tabindex="-1">\u9884\u5B9A\u4E49\u5C5E\u6027 <a class="header-anchor" href="#\u9884\u5B9A\u4E49\u5C5E\u6027" aria-hidden="true">#</a></h2><p><strong>title</strong></p><ul><li>Type: <code>string</code></li><li>Default: <code>h1_title || siteData.title</code></li></ul><p><strong>head</strong></p><ul><li>Type: <code>array</code></li><li>Default: <code>undefined</code></li></ul><p>\u6307\u5B9A\u8981\u6CE8\u5165\u7684\u989D\u5916\u5934\u90E8\u6807\u7B7E</p><div class="language-yaml"><pre><code><span class="token punctuation">---</span>
<span class="token key atrule">head</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token punctuation">-</span> meta
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> description
      <span class="token key atrule">content</span><span class="token punctuation">:</span> hello
  <span class="token punctuation">-</span> <span class="token punctuation">-</span> meta
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> keywords
      <span class="token key atrule">content</span><span class="token punctuation">:</span> super duper SEO
<span class="token punctuation">---</span>
</code></pre></div><p><strong>navbar</strong></p><ul><li>Type: <code>boolean</code></li><li>Default: <code>undefined</code></li></ul><p>\u4F60\u53EF\u4EE5\u4F7F\u7528 <code>navbar: false</code> \u5728\u4E00\u4E9B\u754C\u9762\u7981\u7528\u5BFC\u822A\u6761\u3002</p><p><strong>sidebar</strong></p><ul><li>Type: <code>boolean|&#39;auto&#39;</code></li><li>Default: <code>undefined</code></li></ul><p>\u663E\u793A\u4FA7\u8FB9\u680F <code>sidebar: auto</code>\uFF0C\u7981\u7528\u4FA7\u8FB9\u680F <code>sidebar: false</code></p><p><strong>editLink</strong></p><ul><li>Type: <code>boolean</code></li><li>Default: <code>undefined</code></li></ul><p>\u9875\u9762\u662F\u5426\u5E94\u5305\u542B\u7F16\u8F91\u94FE\u63A5\u3002</p>`,24),p=[o];function l(c,r,i,u,d,k){return t(),a("div",null,p)}var g=n(s,[["render",l]]);export{m as __pageData,g as default};
