import{r as c}from"./index.DBy5LfQW.js";var l={exports:{}},u={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var d;function k(){if(d)return u;d=1;var t=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function a(s,o,r){var i=null;if(r!==void 0&&(i=""+r),o.key!==void 0&&(i=""+o.key),"key"in o){r={};for(var n in o)n!=="key"&&(r[n]=o[n])}else r=o;return o=r.ref,{$$typeof:t,type:s,key:i,ref:o!==void 0?o:null,props:r}}return u.Fragment=e,u.jsx=a,u.jsxs=a,u}var p;function R(){return p||(p=1,l.exports=k()),l.exports}var L=R();/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),w=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,a,s)=>s?s.toUpperCase():a.toLowerCase()),h=t=>{const e=w(t);return e.charAt(0).toUpperCase()+e.slice(1)},m=(...t)=>t.filter((e,a,s)=>!!e&&e.trim()!==""&&s.indexOf(e)===a).join(" ").trim(),A=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var _={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=c.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:a=2,absoluteStrokeWidth:s,className:o="",children:r,iconNode:i,...n},v)=>c.createElement("svg",{ref:v,..._,width:e,height:e,stroke:t,strokeWidth:s?Number(a)*24/Number(e):a,className:m("lucide",o),...!r&&!A(n)&&{"aria-hidden":"true"},...n},[...i.map(([C,f])=>c.createElement(C,f)),...Array.isArray(r)?r:[r]]));/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=(t,e)=>{const a=c.forwardRef(({className:s,...o},r)=>c.createElement(j,{ref:r,iconNode:e,className:m(`lucide-${E(h(t))}`,`lucide-${t}`,s),...o}));return a.displayName=h(t),a};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]],T=x("phone",P);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],J=x("shield-check",$);export{T as P,J as S,x as c,L as j};
