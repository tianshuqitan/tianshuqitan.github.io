import{f as N,u as X,g as b,h as Z,y as ee,t as se,i as le,j as I,k as q,l,m as te,n as ae,s as re,R as P,p as ue,q as ie,v as ne,x as oe,z as ce,A as T,B as $,P as ve,C as me,D as he,E as de,F as ye,G as pe,H as ge,I as fe,J as j,K as He,L as x}from"./app-C252dbTB.js";const ke=["/","/get-started.html","/AI/","/Bookmarks/BookMarks_Unity.html","/Bookmarks/","/Vuepress/","/Vuepress/VuePress_Config.html","/Vuepress/VuePress_Deployment.html","/Vuepress/VuePress_Install.html","/Vuepress/VuePress_ThemeHope.html","/404.html","/category/","/tag/","/article/","/star/","/timeline/"],Re="SLIMSEARCH_QUERY_HISTORY",p=j(Re,[]),qe=()=>{const{queryHistoryCount:a}=x;return{enabled:a>0,queryHistories:p,addQueryHistory:i=>{p.value=Array.from(new Set([i,...p.value.slice(0,a-1)]))},removeQueryHistory:i=>{p.value=[...p.value.slice(0,i),...p.value.slice(i+1)]}}},V=a=>ke[a.id]+("anchor"in a?`#${a.anchor}`:""),xe="SLIMSEARCH_RESULT_HISTORY",{resultHistoryCount:F}=x,g=j(xe,[]),Qe=()=>({enabled:F>0,resultHistories:g,addResultHistory:u=>{{const i={link:V(u),display:u.display};"header"in u&&(i.header=u.header),g.value=[i,...g.value.slice(0,F-1)]}},removeResultHistory:u=>{g.value=[...g.value.slice(0,u),...g.value.slice(u+1)]}}),we=a=>{const u=ve(),i=b(),Q=me(),n=I(0),f=q(()=>n.value>0),v=he([]);return de(()=>{const{search:w,terminate:h}=ye(),H=ge(d=>{const{resultsFilter:C=t=>t,querySplitter:y,suggestionsFilter:A,...r}=u.value;d?(n.value+=1,w(d,i.value,r).then(t=>C(t,d,i.value,Q.value)).then(t=>{n.value-=1,v.value=t}).catch(t=>{console.warn(t),n.value-=1,n.value||(v.value=[])})):v.value=[]},x.searchDelay-x.suggestDelay,{maxWait:5e3});pe([a,i],([d])=>H(d.join(" "))),fe(()=>{h()})}),{isSearching:f,results:v}};var Se=N({name:"SearchResult",props:{queries:{type:Array,required:!0},isFocusing:Boolean},emits:["close","updateQuery"],setup(a,{emit:u}){const i=X(),Q=b(),n=Z(ee),{addQueryHistory:f,queryHistories:v,removeQueryHistory:w}=qe(),{resultHistories:h,addResultHistory:H,removeResultHistory:d}=Qe(),C=se(a,"queries"),{results:y,isSearching:A}=we(C),r=le({isQuery:!0,index:0}),t=I(0),m=I(0),_=q(()=>v.value.length>0||h.value.length>0),S=q(()=>y.value.length>0),L=q(()=>y.value[t.value]||null),B=()=>{const{isQuery:e,index:s}=r;s===0?(r.isQuery=!e,r.index=e?h.value.length-1:v.value.length-1):r.index=s-1},M=()=>{const{isQuery:e,index:s}=r;s===(e?v.value.length-1:h.value.length-1)?(r.isQuery=!e,r.index=0):r.index=s+1},U=()=>{t.value=t.value>0?t.value-1:y.value.length-1,m.value=L.value.contents.length-1},O=()=>{t.value=t.value<y.value.length-1?t.value+1:0,m.value=0},Y=()=>{m.value<L.value.contents.length-1?m.value+=1:O()},z=()=>{m.value>0?m.value-=1:U()},D=e=>e.map(s=>He(s)?s:l(s[0],s[1])),G=e=>{if(e.type==="customField"){const s=oe[e.index]||"$content",[o,R=""]=ce(s)?s[Q.value].split("$content"):s.split("$content");return e.display.map(c=>l("div",D([o,...c,R])))}return e.display.map(s=>l("div",D(s)))},k=()=>{t.value=0,m.value=0,u("updateQuery",""),u("close")},J=()=>l("ul",{class:"slimsearch-result-list"},l("li",{class:"slimsearch-result-list-item"},[l("div",{class:"slimsearch-result-title"},n.value.queryHistory),v.value.map((e,s)=>l("div",{class:["slimsearch-result-item",{active:r.isQuery&&r.index===s}],onClick:()=>{u("updateQuery",e)}},[l(T,{class:"slimsearch-result-type"}),l("div",{class:"slimsearch-result-content"},e),l("button",{class:"slimsearch-remove-icon",innerHTML:$,onClick:o=>{o.preventDefault(),o.stopPropagation(),w(s)}})]))])),K=()=>l("ul",{class:"slimsearch-result-list"},l("li",{class:"slimsearch-result-list-item"},[l("div",{class:"slimsearch-result-title"},n.value.resultHistory),h.value.map((e,s)=>l(P,{to:e.link,class:["slimsearch-result-item",{active:!r.isQuery&&r.index===s}],onClick:()=>{k()}},()=>[l(T,{class:"slimsearch-result-type"}),l("div",{class:"slimsearch-result-content"},[e.header?l("div",{class:"content-header"},e.header):null,l("div",e.display.map(o=>D(o)).flat())]),l("button",{class:"slimsearch-remove-icon",innerHTML:$,onClick:o=>{o.preventDefault(),o.stopPropagation(),d(s)}})]))]));return te("keydown",e=>{if(a.isFocusing){if(S.value){if(e.key==="ArrowUp")z();else if(e.key==="ArrowDown")Y();else if(e.key==="Enter"){const s=L.value.contents[m.value];f(a.queries.join(" ")),H(s),i.push(V(s)),k()}}else if(e.key==="ArrowUp")B();else if(e.key==="ArrowDown")M();else if(e.key==="Enter"){const{index:s}=r;r.isQuery?(u("updateQuery",v.value[s]),e.preventDefault()):(i.push(h.value[s].link),k())}}}),ae([t,m],()=>{var e;(e=document.querySelector(".slimsearch-result-list-item.active .slimsearch-result-item.active"))==null||e.scrollIntoView(!1)},{flush:"post"}),()=>l("div",{class:["slimsearch-result-wrapper",{empty:a.queries.length?!S.value:!_.value}],id:"slimsearch-results"},a.queries.length?A.value?l(re,{hint:n.value.searching}):S.value?l("ul",{class:"slimsearch-result-list"},y.value.map(({title:e,contents:s},o)=>{const R=t.value===o;return l("li",{class:["slimsearch-result-list-item",{active:R}]},[l("div",{class:"slimsearch-result-title"},e||n.value.defaultTitle),s.map((c,W)=>{const E=R&&m.value===W;return l(P,{to:V(c),class:["slimsearch-result-item",{active:E,"aria-selected":E}],onClick:()=>{f(a.queries.join(" ")),H(c),k()}},()=>[c.type==="text"?null:l(c.type==="title"?ue:c.type==="heading"?ie:ne,{class:"slimsearch-result-type"}),l("div",{class:"slimsearch-result-content"},[c.type==="text"&&c.header?l("div",{class:"content-header"},c.header):null,l("div",G(c))])])})])})):n.value.emptyResult:_.value?[J(),K()]:n.value.emptyHistory)}});export{Se as default};
