// Gera os ícones do PortDeck (Android e Windows) a partir do monograma PD de BrandMark.jsx.
// Uso: npm install --no-save @playwright/test && node scripts/render-icons.mjs
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const mark=`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#effaff"/><stop offset=".48" stop-color="#9ad9ff"/><stop offset="1" stop-color="#5a8cff"/></linearGradient></defs>
<path d="M30 98V22h30c25 0 39 15 39 38s-14 38-39 38H49" fill="none" stroke="#3664ad" stroke-width="9" stroke-linejoin="round" transform="translate(3 3)"/>
<path d="M27 96V20h30c25 0 39 15 39 38S82 96 57 96H46" fill="none" stroke="url(#g)" stroke-width="6" stroke-linecap="square"/>
<path d="M46 79V39h12c13 0 19 7 19 17s-6 17-19 17H46" fill="none" stroke="#e5f5ff" stroke-width="6"/>`;
const backdrop=`radial-gradient(circle at 50% 38%,#164a86 0%,#0a2348 46%,#040c1c 100%)`;
const page=(size,{shape,scale,bg})=>`<!doctype html><html><body style="margin:0;background:transparent">
<div style="width:${size}px;height:${size}px;display:grid;place-items:center;overflow:hidden;background:${bg?backdrop:'transparent'};border-radius:${shape==='circle'?'50%':shape==='rounded'?'22%':'0'}">
<svg viewBox="0 0 120 120" style="width:${size*scale}px;height:${size*scale}px;filter:drop-shadow(0 0 ${size/40}px #62b7ff66)">${mark}</svg></div></body></html>`;

const outputs=[];
const densities={mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4};
for(const [name,d] of Object.entries(densities)){
 const dir=`android-source/res/mipmap-${name}`;
 outputs.push([`${dir}/ic_launcher.png`,48*d,{shape:'rounded',scale:.72,bg:true}]);
 outputs.push([`${dir}/ic_launcher_round.png`,48*d,{shape:'circle',scale:.68,bg:true}]);
 // Camada da frente do ícone adaptativo: 108dp com o símbolo dentro da zona segura de 66dp.
 outputs.push([`${dir}/ic_launcher_foreground.png`,108*d,{shape:'square',scale:.5,bg:false}]);
}
outputs.push(['build/icon.png',512,{shape:'rounded',scale:.72,bg:true}]);
outputs.push(['android-source/res/drawable-nodpi/portdeck_icon_backdrop.png',432,{shape:'square',scale:0,bg:true}]);

const browser=await chromium.launch(process.env.PORTDECK_CHROMIUM?{executablePath:process.env.PORTDECK_CHROMIUM}:{});
const tab=await browser.newPage();
for(const [file,size,opts] of outputs){
 await tab.setViewportSize({width:size,height:size});
 await tab.setContent(page(size,opts));
 fs.mkdirSync(path.dirname(file),{recursive:true});
 await tab.locator('div').screenshot({path:file,omitBackground:true});
}
await browser.close();
console.log('Ícones gerados:',outputs.length);
