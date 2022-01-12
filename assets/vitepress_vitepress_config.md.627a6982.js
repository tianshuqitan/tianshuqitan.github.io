import{_ as n,c as s,o as a,a as e}from"./app.43c824c7.js";const h='{"title":"\u914D\u7F6E","description":"","frontmatter":{},"headers":[{"level":2,"title":"\u4E3B\u9875\u5E03\u5C40","slug":"\u4E3B\u9875\u5E03\u5C40"}],"relativePath":"vitepress/vitepress_config.md","lastUpdated":1641278042470}',t={},p=e(`<h1 id="\u914D\u7F6E" tabindex="-1">\u914D\u7F6E <a class="header-anchor" href="#\u914D\u7F6E" aria-hidden="true">#</a></h1><p>\u9996\u5148\u5728\u60A8\u7684 <code>docs</code> \u76EE\u5F55\u4E2D\u521B\u5EFA\u4E00\u4E2A <code>.vitepress</code> \u76EE\u5F55\u3002 \u8FD9\u662F\u6240\u6709 <code>VitePress</code> \u7279\u5B9A\u6587\u4EF6\u5C06\u88AB\u653E\u7F6E\u7684\u5730\u65B9\u3002\u4F60\u7684\u9879\u76EE\u7ED3\u6784\u5927\u6982\u662F\u8FD9\u6837\u7684\uFF1A</p><div class="language-sh"><pre><code>.
\u251C\u2500 docs
\u2502  \u251C\u2500 .vitepress
\u2502  \u2502  \u2514\u2500 config.js
\u2502  \u2514\u2500 index.md
\u2514\u2500 package.json
</code></pre></div><p>\u914D\u7F6E\u6587\u4EF6\u4E3A <code>.vitepress/config.js</code>\uFF0C\u5E94\u8BE5\u5BFC\u51FA\u4E00\u4E2A <code>JavaScript</code> \u5BF9\u8C61\uFF1A</p><div class="language-js"><pre><code>module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>
    title<span class="token operator">:</span> <span class="token string">&quot;CMJ\u7684\u7B14\u8BB0&quot;</span><span class="token punctuation">,</span>
    description<span class="token operator">:</span> <span class="token string">&#39;CMJ\u7684\u7B14\u8BB0&#39;</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>
</code></pre></div><p><strong>base</strong></p><ul><li>Type: <code>string</code></li><li>Default: <code>/</code></li></ul><p>\u7F51\u7AD9\u88AB\u90E8\u7F72\u5230\u7684\u57FA\u672C URL\u3002<code>base</code> \u4F1A\u88AB\u81EA\u52A8\u6DFB\u52A0\u5230\u5176\u4ED6\u9009\u9879\u4E2D\u4EE5 <code>/</code> \u5F00\u5934\u7684\u6240\u6709 URL\uFF0C\u56E0\u6B64\u53EA\u9700\u8981\u6307\u5B9A\u4E00\u6B21\u3002</p><div class="language-js"><pre><code>module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>
    base<span class="token operator">:</span> <span class="token string">&#39;/base/&#39;</span>
<span class="token punctuation">}</span>
</code></pre></div><p><strong>lang</strong></p><ul><li>Type: <code>string</code></li><li>Default: <code>en-US</code></li></ul><p>\u7F51\u7AD9\u7684 <code>lang</code> \u5C5E\u6027\uFF0C\u548C HTML \u4E2D\u7684 <code>&lt;html lang=&quot;en-US&quot;&gt;</code> \u6807\u7B7E\u7C7B\u4F3C\u3002</p><div class="language-js"><pre><code>module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>
    lang<span class="token operator">:</span> <span class="token string">&#39;en-US&#39;</span>
<span class="token punctuation">}</span>
</code></pre></div><p><strong>title</strong></p><ul><li>Type: <code>string</code></li><li>Default: <code>VitePress</code></li></ul><p>\u7F51\u7AD9\u7684\u6807\u9898\u3002 \u6240\u6709\u9875\u9762\u6807\u9898\u7684\u540E\u7F00\u3002\u5E76\u663E\u793A\u5728\u5BFC\u822A\u680F\u4E2D\u3002</p><div class="language-js"><pre><code>module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>
    title<span class="token operator">:</span> <span class="token string">&#39;VitePress&#39;</span>
<span class="token punctuation">}</span>
</code></pre></div><p><strong>description</strong></p><ul><li>Type: <code>string</code></li><li>Default: <code>A VitePress site</code></li></ul><p>\u7F51\u7AD9\u8BF4\u660E\u3002\u548C HTML \u7684 <code>&lt;meta&gt;</code> \u6807\u7B7E\u7C7B\u4F3C\u3002</p><div class="language-js"><pre><code>module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>
    description<span class="token operator">:</span> <span class="token string">&#39;A VitePress site&#39;</span>
<span class="token punctuation">}</span>
</code></pre></div><h2 id="\u4E3B\u9875\u5E03\u5C40" tabindex="-1">\u4E3B\u9875\u5E03\u5C40 <a class="header-anchor" href="#\u4E3B\u9875\u5E03\u5C40" aria-hidden="true">#</a></h2><p>VitePress \u63D0\u4F9B\u4E86\u4E3B\u9875\u5E03\u5C40\u3002\u5728\u6839\u76EE\u5F55\u4E0B\u7684 <code>index.md</code> YAML frontmatter \u4E2D\u6307\u5B9A <code>home: true</code>\u3002</p><p>\u793A\u4F8B\uFF1A</p><div class="language-yaml"><pre><code><span class="token punctuation">---</span>
<span class="token key atrule">home</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
<span class="token key atrule">heroImage</span><span class="token punctuation">:</span> /logo.png
<span class="token key atrule">heroAlt</span><span class="token punctuation">:</span> Logo image
<span class="token key atrule">heroText</span><span class="token punctuation">:</span> Hero Title
<span class="token key atrule">tagline</span><span class="token punctuation">:</span> Hero subtitle
<span class="token key atrule">actionText</span><span class="token punctuation">:</span> Get Started
<span class="token key atrule">actionLink</span><span class="token punctuation">:</span> /guide/
<span class="token key atrule">features</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Simplicity First
    <span class="token key atrule">details</span><span class="token punctuation">:</span> Minimal setup with markdown<span class="token punctuation">-</span>centered project structure helps you focus on writing.
  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Vue<span class="token punctuation">-</span>Powered
    <span class="token key atrule">details</span><span class="token punctuation">:</span> Enjoy the dev experience of Vue + webpack<span class="token punctuation">,</span> use Vue components in markdown<span class="token punctuation">,</span> and develop custom themes with Vue.
  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Performant
    <span class="token key atrule">details</span><span class="token punctuation">:</span> VitePress generates pre<span class="token punctuation">-</span>rendered static HTML for each page<span class="token punctuation">,</span> and runs as an SPA once a page is loaded.
<span class="token key atrule">footer</span><span class="token punctuation">:</span> MIT Licensed <span class="token punctuation">|</span> Copyright \xA9 2019<span class="token punctuation">-</span>present Evan You
<span class="token punctuation">---</span>
</code></pre></div>`,25),o=[p];function c(l,i,u,r,d,k){return a(),s("div",null,o)}var m=n(t,[["render",c]]);export{h as __pageData,m as default};
