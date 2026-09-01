import{r as u}from"./index.BCOEHr3l.js";var l={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var p;function f(){if(p)return i;p=1;var r=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function a(s,o,t){var c=null;if(t!==void 0&&(c=""+t),o.key!==void 0&&(c=""+o.key),"key"in o){t={};for(var n in o)n!=="key"&&(t[n]=o[n])}else t=o;return o=t.ref,{$$typeof:r,type:s,key:c,ref:o!==void 0?o:null,props:t}}return i.Fragment=e,i.jsx=a,i.jsxs=a,i}var h;function R(){return h||(h=1,l.exports=f()),l.exports}var J=R();/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),E=r=>r.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,a,s)=>s?s.toUpperCase():a.toLowerCase()),m=r=>{const e=E(r);return e.charAt(0).toUpperCase()+e.slice(1)},k=(...r)=>r.filter((e,a,s)=>!!e&&e.trim()!==""&&s.indexOf(e)===a).join(" ").trim(),j=r=>{for(const e in r)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var w={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=u.forwardRef(({color:r="currentColor",size:e=24,strokeWidth:a=2,absoluteStrokeWidth:s,className:o="",children:t,iconNode:c,...n},x)=>u.createElement("svg",{ref:x,...w,width:e,height:e,stroke:r,strokeWidth:s?Number(a)*24/Number(e):a,className:k("lucide",o),...!t&&!j(n)&&{"aria-hidden":"true"},...n},[...c.map(([C,v])=>u.createElement(C,v)),...Array.isArray(t)?t:[t]]));/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=(r,e)=>{const a=u.forwardRef(({className:s,...o},t)=>u.createElement(y,{ref:t,iconNode:e,className:k(`lucide-${_(m(r))}`,`lucide-${r}`,s),...o}));return a.displayName=m(r),a};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],M=d("book-open",A);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],P=d("search",$);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],S=d("shield-check",L);export{M as B,P as S,S as a,d as c,J as j};
