import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const ANDROID='http://127.0.0.1:4174/';
const enter=async page=>{await page.locator('.ps-welcome[data-ready="true"]').waitFor();await page.keyboard.press('Enter');await expect(page.locator('.ps-welcome')).toHaveCount(0);};
function fixture(){
 const canvas=document.createElement('canvas');canvas.width=900;canvas.height=700;const c=canvas.getContext('2d');
 const cover=(name,color)=>{const grad=c.createLinearGradient(0,0,900,700);grad.addColorStop(0,color);grad.addColorStop(1,'#080f29');c.fillStyle=grad;c.fillRect(0,0,900,700);c.strokeStyle='#ffffff33';for(let i=0;i<8;i++){c.beginPath();c.arc(610,260,60+i*38,0,7);c.stroke();}c.fillStyle='white';c.font='bold 72px sans-serif';c.fillText(name,60,530);c.font='20px sans-serif';c.fillText('PORTDECK · ARTE DE DEMONSTRAÇÃO',60,600);return canvas.toDataURL('image/jpeg');};
 const games=[{id:'legacy',name:'ORBITAL',packageName:'demo.orbital',playedSeconds:6123,cover:'art:orbital',banner:'art:orbital',shortcutUri:'intent:preservado',lastPlayed:'2026-10-19T10:00:00Z'},{id:'second',name:'HORIZONTE',packageName:'demo.horizonte',playedSeconds:42,cover:'art:horizonte'},{id:'media',name:'CINEMA',packageName:'demo.cinema',category:'media',playedSeconds:17,cover:'art:cinema'}];
 if(!localStorage.getItem('portdeck-android-library-v1'))localStorage.setItem('portdeck-android-library-v1',JSON.stringify(games));
 const arts={'art:orbital':cover('ORBITAL','#305bb5'),'art:horizonte':cover('HORIZONTE','#b65b30'),'art:cinema':cover('CINEMA','#7947ae')};
 const req=indexedDB.open('portdeck-android-art',1);req.onupgradeneeded=()=>req.result.createObjectStore('images');req.onsuccess=()=>{const tx=req.result.transaction('images','readwrite');Object.entries(arts).forEach(([k,v])=>tx.objectStore('images').put(v,k));tx.oncomplete=()=>req.result.close();};
 window.portdeck={list:async()=>games,running:async()=>['legacy'],onLibrary:()=>()=>{},onRunning:()=>()=>{},onHome:fn=>{window.nativeHome=fn;return()=>{};},loadCover:async key=>arts[key],icon:async()=>'',update:async g=>Object.assign(games.find(x=>x.id===g.id),g),closeWindow:()=>{window.didExit=true;}};
 window.Capacitor={PluginHeaders:[{name:'PortDeckNative',methods:['listApps','launchApp','launchOptions'].map(name=>({name,rtype:'promise'}))},{name:'PortDeckPlatform',methods:[{name:'getStatus',rtype:'promise'}]}],nativePromise:async(plugin,method,options)=>{if(method==='listApps')return {apps:[{id:'new',name:'PLAYER',packageName:'demo.player'}]};if(method==='launchOptions')return {activities:[],canCreateShortcut:false};if(method==='getStatus')return {tabletBattery:73,charging:true};window.launched=options;return {};}};
 window.padButtons=[];Object.defineProperty(navigator,'getGamepads',{value:()=>[{id:'Xbox test',connected:true,buttons:Array.from({length:17},(_,i)=>({pressed:window.padButtons.includes(i),value:window.padButtons.includes(i)?1:0})),axes:[0,0]}]});
}
const press=async(page,buttons)=>{await page.evaluate(b=>window.padButtons=b,buttons);await page.waitForTimeout(110);await page.evaluate(()=>window.padButtons=[]);await page.waitForTimeout(90);};
for(const [platform,url]of [['Android',ANDROID],['Windows','/']]){
 test(platform+': tabs, legacy data, gamepad combo and trapped control center',async({page})=>{
  await page.addInitScript(fixture);await page.goto(url);await enter(page);
  await expect(page.locator('[data-console-tile="legacy"]')).toBeVisible();
  await press(page,[5]);await expect(page.locator('[data-console-tile="media"]')).toBeVisible();await expect(page.locator('[data-console-tile="legacy"]')).toHaveCount(0);
  await press(page,[4]);await expect(page.locator('[data-console-tile="legacy"]')).toBeVisible();
  await press(page,[8,9]);const center=page.locator('[data-control-center]');await expect(center).toBeVisible();await expect(page.getByRole('menu')).toHaveCount(0);
  await press(page,[15]);await expect(center.locator('button:focus')).toHaveCount(1);
  for(let i=0;i<9;i++)await page.keyboard.press('Tab');await expect(center.locator('button:focus')).toHaveCount(1);
  await center.getByRole('button',{name:'Sons do PortDeck'}).click();await expect.poll(()=>page.evaluate(()=>localStorage.getItem('portdeck-sound'))).toBe('off');
  await press(page,[1]);await expect(center).toHaveCount(0);await expect(page.locator('.console-tile.active')).toBeFocused();
  await page.keyboard.press('Home');await expect(center).toBeVisible();await center.getByRole('button',{name:'Alternar usuário'}).click();await expect(page.locator('[data-player-dialog]')).toBeVisible();await page.keyboard.press('Escape');
  if(platform==='Android'){const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('portdeck-android-library-v1')));expect(saved).toHaveLength(3);expect(saved[0].playedSeconds).toBe(6123);expect(saved[0].shortcutUri).toBe('intent:preservado');}
 });
}
test('Android: choose media when adding, move existing app, preserve after restart',async({page})=>{
 await page.addInitScript(fixture);await page.goto(ANDROID);await enter(page);await page.getByRole('button',{name:'Adicionar port',exact:true}).click();
 await page.getByRole('navigation',{name:'Adicionar aplicativo em'}).getByRole('button',{name:'Mídia'}).click();await page.getByRole('button',{name:/PLAYER/}).click();
 await expect(page.locator('[data-console-tile="new"]')).toBeVisible();await page.getByRole('button',{name:'Configurar',exact:false}).click();
 await page.getByRole('navigation',{name:'Aba do aplicativo'}).getByRole('button',{name:'Jogos',exact:true}).click();await page.getByRole('button',{name:'Salvar perfil'}).click();
 await page.reload();await enter(page);await expect(page.locator('[data-console-tile="new"]')).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('portdeck-android-library-v1')));expect(saved).toHaveLength(4);expect(saved.find(g=>g.id==='new').category).toBe('games');expect(saved.find(g=>g.id==='legacy').playedSeconds).toBe(6123);
});
test('Android: last launched app and actual tablet battery; exit requires confirmation',async({page})=>{
 await page.addInitScript(fixture);await page.goto(ANDROID);await enter(page);await page.getByRole('button',{name:/Jogar$/}).click();await page.keyboard.press('Home');const center=page.locator('[data-control-center]');await expect(center).toContainText('73%');await expect(center).toContainText('ORBITAL');await expect(center).toContainText('Último app aberto');await center.getByRole('button',{name:'Sair Fechar PortDeck'}).click();await expect(center).toContainText('Sair do PortDeck?');await center.getByRole('button',{name:'Cancelar',exact:true}).click();await expect(center).toContainText('Alternar usuário');
});
for(const size of [{width:1280,height:800},{width:800,height:1280},{width:1024,height:600}])test('Tablet layout '+size.width+'x'+size.height,async({page})=>{
 await page.setViewportSize(size);await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(fixture);await page.goto(ANDROID);await enter(page);await expect(page.locator('.console-tile img').first()).toBeVisible();await expect(page.locator('.ad-toast')).toHaveCount(0,{timeout:7000});
 const shots=process.env.PORTDECK_SCREENSHOTS;const dir='docs/screenshots/0.9';if(shots){fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:dir+'/jogos-'+size.width+'.jpg',type:'jpeg',quality:85});}
 await page.getByRole('button',{name:/Jogar$/}).click();await page.keyboard.press('Home');const center=page.locator('[data-control-center]');await expect(center).toBeVisible();const box=await center.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(size.width);expect(box.y+box.height).toBeLessThanOrEqual(size.height);
 if(shots)await page.screenshot({path:dir+'/central-'+size.width+'.jpg',type:'jpeg',quality:85});await page.keyboard.press('Escape');await page.getByRole('navigation',{name:'Biblioteca',exact:true}).getByRole('button',{name:'Mídia'}).click();await expect(page.locator('[data-console-tile="media"]')).toBeVisible();if(shots)await page.screenshot({path:dir+'/midia-'+size.width+'.jpg',type:'jpeg',quality:85});
});

test('Android: nested launch settings close before the unsaved editor',async({page})=>{await page.addInitScript(fixture);await page.goto(ANDROID);await enter(page);await page.getByRole('button',{name:/Configurar/}).click();await page.getByRole('button',{name:'Escolher como abrir'}).click();await expect(page.getByRole('heading',{name:'Como abrir este port'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('heading',{name:'Como abrir este port'})).toHaveCount(0);await expect(page.getByRole('heading',{name:'Personalizar jogo'})).toBeVisible();await press(page,[1]);await expect(page.getByRole('heading',{name:'Personalizar jogo'})).toHaveCount(0);await expect(page.locator('.console-tile.active')).toBeFocused();});
