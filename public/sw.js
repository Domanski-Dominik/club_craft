if(!self.define){let e,i={};const a=(a,s)=>(a=new URL(a+".js",s).href,i[a]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=i,document.head.appendChild(e)}else e=a,importScripts(a),i()})).then((()=>{let e=i[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(s,c)=>{const f=e||("document"in self?document.currentScript.src:"")||location.href;if(i[f])return;let n={};const t=e=>a(e,f),d={module:{uri:f},exports:n,require:t};i[f]=Promise.all(s.map((e=>d[e]||t(e)))).then((e=>(c(...e),n)))}}define(["./workbox-f1770938"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/HMfDE8AvjLNJ0wfKqiocf/_buildManifest.js",revision:"3e2d62a10f4d6bf0b92e14aecf7836f4"},{url:"/_next/static/HMfDE8AvjLNJ0wfKqiocf/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/1336-8e57e9b2d27a589a.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/1543-1b1fa236d9f2a6cd.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/2222-1d477fc63a407952.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/2284-aa310b3ccc3457d6.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/2523-0c9adaaf5e1d5913.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/2703-91410c3df9a61921.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/3492-dbf397676e4dad65.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/3493-fce02ee940c4778f.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/3773-3dc653ff27b15bce.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/4504-e1a8478e1c47c9a5.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/4657-3b9da1f8008e221c.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/4830-5aba349fa07e4569.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/5102-3d1ae88fc555e255.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/5175-407de0bc1ece6a3e.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/5190-893201edb02fc505.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/5520-9725a3bac81d9966.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/5787-54c4d08b20309262.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/5930-4b9142397118750a.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/6062-7fc2e967da536382.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/6083-c0e2ea72b3838edf.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/6285-ae8b6c1e8793fc06.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/6661-6ee2da253fc5cd0f.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/6664-59b6da06878a36eb.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/672-139895a1a8b29ed4.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/6746-18f93f0c52c7ca50.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/6839-38317d6bc27246d3.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/6858-cd4b0fa20eb56616.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/6949-88f9e7971282b99c.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/6edf0643-3339f6c96a12fdde.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/8258-06d468c8d54b9713.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/8433-419ff67f6ac6616d.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/8438-455c1b3224b599df.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/8498-406d558c0826ac9a.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/932-9f710604480f4f5f.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/9467-e346fa8c81edf95b.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/9667-5541a50bb0c619ba.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/9898-4b146b5781bae294.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/9903-4a64dbdd0053cd30.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/9918-2ca713789449c2eb.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/a6eb9415-92f2f07f5ac25962.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/_not-found/page-2c6469a0eee8ea5b.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/add/group/%5Bid%5D/loading-39bbb2952e621f81.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/add/group/%5Bid%5D/page-b8c4bdd5e254f7dd.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/add/group/loading-d06750c50b15a8d3.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/add/group/page-6d4fad4fc1284ca1.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/add/loading-75b024ac0db1ba89.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/add/page-cc410d9e22a6614f.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/calendar/page-6af24f292277478f.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/edit/group/%5Bid%5D/page-4adcbad1870df716.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/group/%5Bid%5D/loading-dbe351970159c7eb.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/group/%5Bid%5D/page-f1b0f17b4cee3a5e.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/home/coaches/page-6e829ae0928e2ecc.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/home/manageGroups/page-cd4621e6bc840bb7.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/home/page-85d0a1194591368b.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/import/page-a31f6f946c48a8d5.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/layout-26e602a3154de9fc.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/locations/edit/%5Bid%5D/loading-98231f392e901888.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/locations/edit/%5Bid%5D/page-bba74a5089c68357.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/locations/new/loading-e6ba99d6c233da9b.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/locations/new/page-1d2db27477dcc5e9.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/login/loading-e1ecc73423d84fa5.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/login/page-d5dd11c420623fb1.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/page-26b610ad56feedf0.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/participant/%5Bid%5D/loading-928751449024161d.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/participant/%5Bid%5D/page-52a0689785cb4cb5.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/participants/loading-ad9fd4a5596c2511.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/participants/page-f4c3e6c41c5764d1.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/profile/page-57489bf201463653.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/register/%5Bclub%5D/page-fbdef5f18b349290.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/register/page-b0510275badbeba0.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/register/verify/%5Btoken%5D/page-d87a179a2a5396cc.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/reset/%5Btoken%5D/page-a8e1b80b5fcb46bd.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/reset/page-47da586078b554f1.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/settings/page-b283a6f3cb4bf195.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/stats/page-dc5dfcdd93d0ebe1.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/app/zapisy/%5B...info%5D/page-1dddb2628e21bc44.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/fd9d1056-b54200f9df520016.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/framework-8e0e0f4a6b83a956.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/main-app-464e8bcdac33e981.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/main-b9ebc1bbf9ab97d7.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/pages/_app-f870474a17b7f2fd.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-400912b2445777e3.js",revision:"HMfDE8AvjLNJ0wfKqiocf"},{url:"/_next/static/css/2b91d6b71b492b0d.css",revision:"2b91d6b71b492b0d"},{url:"/_next/static/media/01b6d16db7cbd96b-s.woff2",revision:"aa5a44ef72b927d17eac76def8c255cf"},{url:"/_next/static/media/025c5221126e4e89-s.woff2",revision:"1d266eb6756cae89abcd598d56bb063e"},{url:"/_next/static/media/045832894acda0e9-s.p.woff2",revision:"200c41f352c466e1c2b117656a0256e8"},{url:"/_next/static/media/0881a2b922b3331e-s.woff2",revision:"a0891d7e3512851a00017bc6aa93a49a"},{url:"/_next/static/media/0e5e1c6a8db9e432-s.woff2",revision:"f201ef2b6f1307dd8b1ec0c0deffceea"},{url:"/_next/static/media/120a5a1920781bd0-s.p.woff2",revision:"8c4b05d4371467ba1d0bc60839c6dcb9"},{url:"/_next/static/media/2744aa005c8cf586-s.p.woff2",revision:"105daacb4bc4cf86575fb3136360ff4d"},{url:"/_next/static/media/27971e35634b7c88-s.woff2",revision:"4264bad61333859477947703b15aadfd"},{url:"/_next/static/media/279b47070a5d5877-s.woff2",revision:"f604c827dc8754b14422f431013955eb"},{url:"/_next/static/media/28aa5118b38b86e4-s.woff2",revision:"db5317b009a0dedd66dab31d7889b5f3"},{url:"/_next/static/media/2f66f084fba01545-s.woff2",revision:"8e0642a7dd6dfe9491afa20e4a470655"},{url:"/_next/static/media/418bb9d724f84584-s.woff2",revision:"cc9da36658c97547be935851d9d315a8"},{url:"/_next/static/media/46b92c15a48f3318-s.p.woff2",revision:"e6a3e7c444a2fdaef711876a4ce39596"},{url:"/_next/static/media/470a067cc6557a8c-s.woff2",revision:"3770df42d862e4dd073cc0e529daef2b"},{url:"/_next/static/media/483de911b1a0d258-s.woff2",revision:"28502b06e67112e0bf77a784aee917d0"},{url:"/_next/static/media/539b2ecbf014924b-s.woff2",revision:"e5b46e787824355760aa312fc91f6a91"},{url:"/_next/static/media/5693677ef07d9b51-s.woff2",revision:"96b57d1ae0a86dcf7913589b27426343"},{url:"/_next/static/media/6194a65a1b989dc8-s.woff2",revision:"12f0db351de86c05551dfe886ab6ab55"},{url:"/_next/static/media/674abd25bb7be96f-s.woff2",revision:"92e5e17ec75636ec7ab5c46a00a54342"},{url:"/_next/static/media/69eca568ddda66f3-s.woff2",revision:"274de48d6ba9190c6be659d8006169ee"},{url:"/_next/static/media/6a5d8dc148518b96-s.woff2",revision:"b8cd9bd4d2a44124d4f5a74f79bdc1d2"},{url:"/_next/static/media/6ebb97b5c9fa4e03-s.p.woff2",revision:"39aff03d2a35b1c80f210051f35d4b2b"},{url:"/_next/static/media/7a7012758df5a81e-s.woff2",revision:"26024640d95a44fd98f614d6f4372e4b"},{url:"/_next/static/media/7c16c8204ab29534-s.woff2",revision:"eac32b711872911e7e7c107eb7a7901a"},{url:"/_next/static/media/7c7db451c1a82f61-s.p.woff2",revision:"b5cdc415502634db78d05d91c1bf0551"},{url:"/_next/static/media/7d1684f14ddac155-s.woff2",revision:"604411f91e27fd9740f3c4482aef4d58"},{url:"/_next/static/media/7f5a4bbe7ec7be95-s.p.woff2",revision:"f44317e60bd99ef9140e4156d3ee26db"},{url:"/_next/static/media/80b1a0e600ca6d83-s.woff2",revision:"584ea11fad4f10a879c8530e7575cbbf"},{url:"/_next/static/media/82233a533941ac93-s.woff2",revision:"ac7d441c7fe6e91a0dce7510d3b3d38e"},{url:"/_next/static/media/8720059dfa14a1fe-s.woff2",revision:"1254e937b1635a843bc7bdee51de2aeb"},{url:"/_next/static/media/8fa52275b6c22437-s.woff2",revision:"066052f914495367d40b72599bd54598"},{url:"/_next/static/media/906678b269849541-s.woff2",revision:"21c838ead8641ef57bc94d27efcd257e"},{url:"/_next/static/media/98a28a5430a3cf7f-s.woff2",revision:"7dada9344a370f25dc1d3b7030da67b6"},{url:"/_next/static/media/994367e55fdd7fef-s.woff2",revision:"a2b09664c5faadff15e596aa57e8e5c7"},{url:"/_next/static/media/994bf73bb06543dc-s.woff2",revision:"0ed4fab7b6a3e3c06f70de37b3eb5f47"},{url:"/_next/static/media/a1ab1338b04b4a15-s.woff2",revision:"95b874303c176df8093f9a5b0e8f3b55"},{url:"/_next/static/media/a4e8963e7141b0f0-s.woff2",revision:"85486111ec13b11774a7ec6d9755dffc"},{url:"/_next/static/media/ac0efabfe978b0ad-s.woff2",revision:"ed31e4b8cd1d209be2e50af162f26e00"},{url:"/_next/static/media/b5c08a795ae281ca-s.woff2",revision:"5a3ac9809e02d838b15b80e557435268"},{url:"/_next/static/media/b9472d49e3bc18c3-s.woff2",revision:"8d5ccaf24e104a69a676ef5f4f2e95f2"},{url:"/_next/static/media/bb6334b8f5a99b5e-s.woff2",revision:"4603ddb13e6738af220fb5cf1fecbc0b"},{url:"/_next/static/media/c898cbfd2f789a8c-s.woff2",revision:"5dcd52bbafd405373cb80552de5f5a96"},{url:"/_next/static/media/c954d99df1178b91-s.woff2",revision:"3ac9ee74ef624c84c5c683d755388c2f"},{url:"/_next/static/media/cd31bf4b34f8dfb3-s.woff2",revision:"1a0c60b7297c849ea95c06380a4c0961"},{url:"/_next/static/media/d0f96be320385a33-s.woff2",revision:"1a238bfef8b13573198b56363c3bbbb7"},{url:"/_next/static/media/d536eaaa8eee0a4d-s.woff2",revision:"f6985e8df207520f323f4903eeded235"},{url:"/_next/static/media/d9e386ae70efc2f0-s.woff2",revision:"5e62d0433ab4fb48f80f72b6a41f07c2"},{url:"/_next/static/media/da897b99eb1fe4a1-s.p.woff2",revision:"4903a00d1c555c0846799302c673d6a1"},{url:"/_next/static/media/dad619d2ef97f73d-s.woff2",revision:"db80d4b05ac2ac1427700bfa7644ac3c"},{url:"/_next/static/media/df2942b6de9d14b5-s.woff2",revision:"47e8ccc33b3dcfbe6d31914569515bf4"},{url:"/_next/static/media/e0e418e0c2fc8a84-s.woff2",revision:"11f4301b1b916899d6e7a6d607d863fb"},{url:"/_next/static/media/e4f65e35dde2bee1-s.woff2",revision:"d3d2e988fd01f6b60121adc2cba7c541"},{url:"/_next/static/media/e7814bd1d06a39b6-s.woff2",revision:"ee93adb9ee2b722659c8ca1e26db0418"},{url:"/_next/static/media/ecf49d904668b268-s.woff2",revision:"9f2ae2ca944b5bd6c3d59b01f78ec5ff"},{url:"/_next/static/media/f1df6186c8d69644-s.woff2",revision:"307c90aaa7d9c628155ee8cb913b8382"},{url:"/_next/static/media/f756da832d8c34d4-s.woff2",revision:"ef6b28a1181a73b788c8669d6ad9adc8"},{url:"/apple_splash_1125.png",revision:"1c5c187a3e6b6d515ca1f260a9a7f0d5"},{url:"/apple_splash_1242.png",revision:"1542aa62f210cd82f2ec653a06ac1a1b"},{url:"/apple_splash_1536.png",revision:"874e263f4dfa2f2df0257ec5606e55f8"},{url:"/apple_splash_1668.png",revision:"ef80a1e8cc1d1003a2d99016f37cc219"},{url:"/apple_splash_2048.png",revision:"8c80c7d914f3332aa84b25821150b306"},{url:"/apple_splash_640.png",revision:"d8b05f6d44f090a81ccdaf8e33ab1687"},{url:"/apple_splash_750.png",revision:"08de1c18fc0c53354702ef9e5bd77de1"},{url:"/favicon.ico",revision:"894e9c8527cf581aba937a6938dc22a0"},{url:"/favicon1024x1024.png",revision:"318e3433bacc4db7b5fc806d7be6529b"},{url:"/favicon16x16.png",revision:"4048d079865a13d377ce34ae2e75bb45"},{url:"/favicon180x180.png",revision:"2258eff666bf565f67ff0d3520de6ded"},{url:"/favicon192x192.png",revision:"5c20a9dceed92a91b3e90c239732fa1e"},{url:"/favicon32x32.png",revision:"70c619e5afb8a9cbb3b5ff452e1c8659"},{url:"/favicon384x384.png",revision:"687b37631a8bc748df8535250e5b1710"},{url:"/favicon512x512.png",revision:"490a1551dec7bf5ca4f8eb0f5c525fb5"},{url:"/icon.png",revision:"490a1551dec7bf5ca4f8eb0f5c525fb5"},{url:"/logo.svg",revision:"f02cbd6ab35a1e134eaa6caadd9d2247"},{url:"/logo_figure.svg",revision:"c46283f0032e764812c6daa6fbdd602f"},{url:"/manifest.json",revision:"e1d17946e3b51d33b5c2d41d6ac012d4"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:e})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/\/_next\/static.+\.js$/i,new e.CacheFirst({cacheName:"next-static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4|webm)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:48,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e,url:{pathname:i}})=>!(!e||i.startsWith("/api/auth/callback")||!i.startsWith("/api/"))),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:i},sameOrigin:a})=>"1"===e.headers.get("RSC")&&"1"===e.headers.get("Next-Router-Prefetch")&&a&&!i.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc-prefetch",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:i},sameOrigin:a})=>"1"===e.headers.get("RSC")&&a&&!i.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:{pathname:e},sameOrigin:i})=>i&&!e.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e})=>!e),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
