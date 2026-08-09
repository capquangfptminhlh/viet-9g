import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{a as l}from"./index.Be5QA6oH.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=a=>a.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),f=a=>a.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,s,r)=>r?r.toUpperCase():s.toLowerCase()),x=a=>{const e=f(a);return e.charAt(0).toUpperCase()+e.slice(1)},d=(...a)=>a.filter((e,s,r)=>!!e&&e.trim()!==""&&r.indexOf(e)===s).join(" ").trim(),b=a=>{for(const e in a)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var y={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=l.forwardRef(({color:a="currentColor",size:e=24,strokeWidth:s=2,absoluteStrokeWidth:r,className:o="",children:c,iconNode:m,...i},h)=>l.createElement("svg",{ref:h,...y,width:e,height:e,stroke:a,strokeWidth:r?Number(s)*24/Number(e):s,className:d("lucide",o),...!c&&!b(i)&&{"aria-hidden":"true"},...i},[...m.map(([p,g])=>l.createElement(p,g)),...Array.isArray(c)?c:[c]]));/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=(a,e)=>{const s=l.forwardRef(({className:r,...o},c)=>l.createElement(j,{ref:c,iconNode:e,className:d(`lucide-${u(x(a))}`,`lucide-${a}`,r),...o}));return s.displayName=x(a),s};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]],k=n("globe",w);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],C=n("search",N);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],A=n("shield-check",v),_=[["all","Tất cả"],["data","Gói data"],["social","Gói mạng xã hội"],["combo","Gói combo"],["long_term","Chu kỳ dài"]];function E({searchQuery:a="",onSearchChange:e=()=>{},onCategorySelect:s=()=>{},selectedCategory:r="all"}){return t.jsxs("header",{className:"w-full border-b border-gray-100 bg-white font-sans",children:[t.jsx("div",{className:"bg-[#e60000] text-xs text-white",children:t.jsxs("div",{className:"mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-4",children:[t.jsxs("span",{className:"flex items-center gap-1.5",children:[t.jsx(A,{className:"h-4 w-4"}),"Trang thông tin độc lập; điều khoản gói và đăng ký do Viettel xác nhận."]}),t.jsxs("span",{className:"hidden items-center gap-1.5 md:flex",children:[t.jsx(k,{className:"h-4 w-4"}),"Thông tin tham khảo gói cước"]})]})}),t.jsxs("div",{className:"mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center",children:[t.jsxs("div",{className:"shrink-0",children:[t.jsxs("div",{className:"text-2xl font-black italic tracking-tight text-[#e60000]",children:["TRACUU",t.jsx("span",{className:"ml-1 rounded bg-[#e60000] px-1.5 py-0.5 text-[10px] not-italic text-white",children:"goicuoc.com"})]}),t.jsx("p",{className:"mt-1 text-[10px] font-medium text-gray-500",children:"Trang thông tin gói cước độc lập"})]}),t.jsxs("label",{className:"relative flex-1",children:[t.jsx(C,{className:"absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"}),t.jsx("input",{value:a,onChange:o=>e(o.target.value),placeholder:"Tìm gói cước",className:"w-full rounded-full border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#e60000]"})]}),t.jsx("p",{className:"text-sm font-bold text-gray-700",children:"Thông tin tham khảo gói cước"})]}),t.jsx("nav",{className:"border-t border-gray-100",children:t.jsx("div",{className:"mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4",children:_.map(([o,c])=>t.jsx("button",{type:"button",onClick:()=>s(o),className:`shrink-0 px-4 py-3 text-xs font-bold ${r===o?"border-b-2 border-[#e60000] text-[#e60000]":"text-gray-600 hover:text-[#e60000]"}`,children:c},o))})})]})}export{k as G,E as H,C as S,n as c};
