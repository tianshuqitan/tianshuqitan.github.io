import{_ as n,c as s,o as a,a as t}from"./app.43c824c7.js";const g='{"title":"\u4E3B\u9898","description":"","frontmatter":{},"headers":[{"level":2,"title":"\u81EA\u5B9A\u4E49\u4E3B\u9898","slug":"\u81EA\u5B9A\u4E49\u4E3B\u9898"},{"level":2,"title":"\u6269\u5C55\u9ED8\u8BA4\u4E3B\u9898","slug":"\u6269\u5C55\u9ED8\u8BA4\u4E3B\u9898"}],"relativePath":"vitepress/vitepress_theming.md","lastUpdated":1641267561688}',e={},p=t(`<h1 id="\u4E3B\u9898" tabindex="-1">\u4E3B\u9898 <a class="header-anchor" href="#\u4E3B\u9898" aria-hidden="true">#</a></h1><h2 id="\u81EA\u5B9A\u4E49\u4E3B\u9898" tabindex="-1">\u81EA\u5B9A\u4E49\u4E3B\u9898 <a class="header-anchor" href="#\u81EA\u5B9A\u4E49\u4E3B\u9898" aria-hidden="true">#</a></h2><p>\u6DFB\u52A0 <code>.vitepress/theme/index.js</code> \u6587\u4EF6\uFF08\u4E3B\u9898\u5165\u53E3\u6587\u4EF6\uFF09\uFF0C\u542F\u7528\u81EA\u5B9A\u4E49\u4E3B\u9898\u3002</p><div class="language-bash"><pre><code><span class="token builtin class-name">.</span>
\u251C\u2500 docs
\u2502  \u251C\u2500 .vitepress
\u2502  \u2502  \u251C\u2500 theme
\u2502  \u2502  \u2502  \u2514\u2500 index.js
\u2502  \u2502  \u2514\u2500 config.js
\u2502  \u2514\u2500 index.md
\u2514\u2500 package.json
</code></pre></div><p>Vitepress \u81EA\u5B9A\u4E49\u4E3B\u9898\u53EA\u662F\u4E00\u4E2A\u5305\u542B\u4E09\u4E2A\u5C5E\u6027\u7684\u5BF9\u8C61\uFF0C\u5B9A\u4E49\u5982\u4E0B\uFF1A</p><div class="language-ts"><pre><code><span class="token keyword">interface</span> <span class="token class-name">Theme</span> <span class="token punctuation">{</span>
    Layout<span class="token operator">:</span> Component <span class="token comment">// Vue 3 component</span>
    NotFound<span class="token operator">?</span><span class="token operator">:</span> Component
    enhanceApp<span class="token operator">?</span><span class="token operator">:</span> <span class="token punctuation">(</span>ctx<span class="token operator">:</span> EnhanceAppContext<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span>
<span class="token punctuation">}</span>

<span class="token keyword">interface</span> <span class="token class-name">EnhanceAppContext</span> <span class="token punctuation">{</span>
    app<span class="token operator">:</span> App <span class="token comment">// Vue 3 app instance</span>
    router<span class="token operator">:</span> Router <span class="token comment">// VitePress router instance</span>
    siteData<span class="token operator">:</span> Ref<span class="token operator">&lt;</span>SiteData<span class="token operator">&gt;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u4E3B\u9898\u5165\u53E3\u6587\u4EF6\u5E94\u8BE5\u5C06\u4E3B\u9898\u4F5C\u4E3A\u9ED8\u8BA4\u5BFC\u51FA\uFF1A</p><div class="language-js"><pre><code><span class="token comment">// .vitepress/theme/index.js</span>
<span class="token keyword">import</span> Layout <span class="token keyword">from</span> <span class="token string">&#39;./Layout.vue&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
    Layout<span class="token punctuation">,</span>
    <span class="token function-variable function">NotFound</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token string">&#39;custom 404&#39;</span><span class="token punctuation">,</span> <span class="token comment">// &lt;- this is a Vue 3 functional component</span>
    <span class="token function">enhanceApp</span><span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> app<span class="token punctuation">,</span> router<span class="token punctuation">,</span> siteData <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// app is the Vue 3 app instance from \`createApp()\`. router is VitePress&#39;</span>
        <span class="token comment">// custom router. \`siteData\` is a \`ref\` of current site-level metadata.</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p><code>Layout</code> \u4E3B\u9898\u770B\u8D77\u6765\u5982\u4E0B\uFF1A</p><div class="language-vue"><pre><code><span class="token comment">&lt;!-- .vitepress/theme/Layout.vue --&gt;</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>template</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">&gt;</span></span>Custom Layout!<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Content</span> <span class="token punctuation">/&gt;</span></span><span class="token comment">&lt;!-- this is where markdown content will be rendered --&gt;</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>template</span><span class="token punctuation">&gt;</span></span>
</code></pre></div><p>\u9ED8\u8BA4\u5BFC\u51FA\u662F\u81EA\u5B9A\u4E49\u4E3B\u9898\u7684\u552F\u4E00\u65B9\u5F0F\u3002\u5728\u81EA\u5B9A\u4E49\u4E3B\u9898\u4E2D\uFF0C\u7528\u6CD5\u4E3A Vite + Vue 3\u3002\u4E3B\u9898\u9700\u8981<a href="./vitepress_vue.html">\u517C\u5BB9SSR</a>\u3002</p><p>\u8981\u5206\u53D1\u4E3B\u9898\u7684\u8BDD\uFF0C\u53EA\u9700\u8981\u5BFC\u51FA\u4E3B\u9898\u3002\u8981\u4F7F\u7528\u5916\u90E8\u4E3B\u9898\uFF0C\u5BFC\u5165\u5E76\u91CD\u65B0\u5BFC\u51FA\u81EA\u5B9A\u4E49\u4E3B\u9898\u3002</p><div class="language-js"><pre><code><span class="token comment">// .vitepress/theme/index.js</span>
<span class="token keyword">import</span> Theme <span class="token keyword">from</span> <span class="token string">&#39;awesome-vitepress-theme&#39;</span>
<span class="token keyword">export</span> <span class="token keyword">default</span> Theme
</code></pre></div><h2 id="\u6269\u5C55\u9ED8\u8BA4\u4E3B\u9898" tabindex="-1">\u6269\u5C55\u9ED8\u8BA4\u4E3B\u9898 <a class="header-anchor" href="#\u6269\u5C55\u9ED8\u8BA4\u4E3B\u9898" aria-hidden="true">#</a></h2><p>\u5982\u679C\u4F60\u60F3\u8981\u6269\u5C55\u548C\u81EA\u5B9A\u4E49\u9ED8\u8BA4\u4E3B\u9898\uFF0C\u4F60\u53EF\u4EE5\u4ECE <code>vitepress/theme</code> \u5BFC\u5165\u4E3B\u9898\u7136\u540E\u5728\u81EA\u5B9A\u4E49\u4E3B\u9898\u6587\u4EF6\u4E2D\u8FDB\u884C\u81EA\u5B9A\u4E49\u3002\u4E00\u4E0B\u662F\u4E00\u4E9B\u81EA\u5B9A\u4E49\u793A\u4F8B\uFF1A</p><p><strong>\u6CE8\u518C\u989D\u5168\u5C40\u7EC4\u4EF6</strong></p><div class="language-js"><pre><code><span class="token comment">// .vitepress/theme/index.js</span>
<span class="token keyword">import</span> DefaultTheme <span class="token keyword">from</span> <span class="token string">&#39;vitepress/theme&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
  <span class="token operator">...</span>DefaultTheme<span class="token punctuation">,</span>
  <span class="token function">enhanceApp</span><span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> app <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// register global components</span>
    app<span class="token punctuation">.</span><span class="token function">component</span><span class="token punctuation">(</span><span class="token string">&#39;MyGlobalComponent&#39;</span> <span class="token comment">/* ... */</span><span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p>\u7531\u4E8E\u6211\u4EEC\u4F7F\u7528\u7684\u662F Vite\uFF0C\u6211\u4EEC\u53EF\u4EE5\u4F7F\u7528 Vite \u7684<a href="https://vitejs.dev/guide/features.html#glob-import" target="_blank" rel="noopener noreferrer">\u5168\u5C40\u5BFC\u5165\u7279\u6027</a>\u81EA\u52A8\u6CE8\u518C\u7EC4\u4EF6\u76EE\u5F55\u3002</p><p><strong>\u81EA\u5B9A\u4E49CSS</strong></p><p>\u9ED8\u8BA4\u4E3B\u9898 <code>CSS</code> \u53EF\u4EE5\u901A\u8FC7\u8986\u5199\u6839\u7EA7\u7684 <code>CSS</code> \u5C5E\u6027\u6765\u81EA\u5B9A\u4E49\u3002</p><div class="language-js"><pre><code><span class="token comment">// .vitepress/theme/index.js</span>
<span class="token keyword">import</span> DefaultTheme <span class="token keyword">from</span> <span class="token string">&#39;vitepress/theme&#39;</span>
<span class="token keyword">import</span> <span class="token string">&#39;./custom.css&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> DefaultTheme
</code></pre></div><div class="language-css"><pre><code><span class="token comment">/* .vitepress/theme/custom.css */</span>
<span class="token selector">:root</span> <span class="token punctuation">{</span>
  <span class="token property">--c-brand</span><span class="token punctuation">:</span> #646cff<span class="token punctuation">;</span>
  <span class="token property">--c-brand-light</span><span class="token punctuation">:</span> #747bff<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div><p><a href="https://github.com/vuejs/vitepress/blob/master/src/client/theme-default/styles/vars.css" target="_blank" rel="noopener noreferrer">\u53EF\u4EE5\u88AB\u91CD\u5199\u7684\u9ED8\u8BA4\u4E3B\u9898\u7684 CSS \u5C5E\u6027</a></p><p><strong>Layout \u63D2\u69FD</strong></p><p>\u9ED8\u8BA4\u4E3B\u9898\u7684 <code>&lt;Layout/&gt;</code> \u7EC4\u4EF6\u6709\u51E0\u4E2A\u63D2\u69FD\uFF0C\u53EF\u7528\u4E8E\u5728\u9875\u9762\u7684\u7279\u5B9A\u4F4D\u7F6E\u8BF8\u5982\u5185\u5BB9\u3002\u4EE5\u4E0B\u662F\u5C06\u7EC4\u4EF6\u6CE8\u5165\u4FA7\u8FB9\u680F\u9876\u90E8\u7684\u793A\u4F8B\uFF1A</p><div class="language-js"><pre><code><span class="token comment">// .vitepress/theme/index.js</span>
<span class="token keyword">import</span> DefaultTheme <span class="token keyword">from</span> <span class="token string">&#39;vitepress/theme&#39;</span>
<span class="token keyword">import</span> MyLayout <span class="token keyword">from</span> <span class="token string">&#39;./MyLayout.vue&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
    <span class="token operator">...</span>DefaultTheme<span class="token punctuation">,</span>
    <span class="token comment">// override the Layout with a wrapper component that injects the slots</span>
    Layout<span class="token operator">:</span> MyLayout
<span class="token punctuation">}</span>
</code></pre></div><div class="language-vue"><pre><code><span class="token comment">&lt;!--.vitepress/theme/MyLayout.vue--&gt;</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">setup</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">import</span> DefaultTheme <span class="token keyword">from</span> <span class="token string">&#39;vitepress/theme&#39;</span>
    <span class="token keyword">const</span> <span class="token punctuation">{</span> Layout <span class="token punctuation">}</span> <span class="token operator">=</span> DefaultTheme
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>

<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>template</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Layout</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>template</span> <span class="token attr-name">#sidebar-top</span><span class="token punctuation">&gt;</span></span>
            My custom sidebar top content
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>template</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>Layout</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>template</span><span class="token punctuation">&gt;</span></span>
</code></pre></div><p>\u9ED8\u8BA4\u4E3B\u9898 layout \u4E2D\u53EF\u7528\u7684\u63D2\u69FD\uFF1A</p><ul><li><code>navbar-search</code></li><li><code>sidebar-top</code></li><li><code>sidebar-bottom</code></li><li><code>page-top-ads</code></li><li><code>page-top</code></li><li><code>page-bottom</code></li><li><code>page-bottom-ads</code></li><li>Only when <code>home: true</code> is enabled via frontmatter: <ul><li><code>home-hero</code></li><li><code>home-features</code></li><li><code>home-footer</code></li></ul></li></ul>`,29),o=[p];function c(l,r,i,u,k,d){return a(),s("div",null,o)}var h=n(e,[["render",c]]);export{g as __pageData,h as default};
