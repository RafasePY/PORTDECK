import {test,expect} from '@playwright/test';
// 1.0: controle na central e na lista de apps, jogo aberto/fechar jogo, Start+Select vindo de dentro do jogo e nomes longos.
const ANDROID='http://127.0.0.1:4174/';
const enter=async page=>{await page.locator('.ps-welcome[data-ready="true"]').waitFor();await page.keyboard.press('Enter');await expect(page.locator('.ps-welcome')).toHaveCount(0);};
const press=async(page,buttons)=>{await page.evaluate(b=>window.padButtons=b,buttons);await page.waitForTimeout(110);await page.evaluate(()=>window.padButtons=[]);await page.waitForTimeout(90);};
function fixture(opts){
 const games=[{id:'mine',name:'Minecraft',packageName:'com.mojang.minecraftpe'},{id:'kart',name:'Mario Kart',packageName:'demo.kart'}];
 if(opts.empty)localStorage.removeItem('portdeck-android-library-v1');else if(!localStorage.getItem('portdeck-android-library-v1'))localStorage.setItem('portdeck-android-library-v1',JSON.stringify(games.map(g=>({cover:'',banner:'',logo:'',playedSeconds:0,lastPlayed:null,...g}))));
 window.calls=[];window.listeners={};
 const native={listApps:{apps:[{id:'yt',name:'YouTube',packageName:'com.google.android.youtube'},{id:'wa',name:'WhatsApp',packageName:'com.whatsapp'},{id:'gm',name:'Gmail',packageName:'com.google.android.gm'}]},launchApp:{},closeApp:{closed:true},launchOptions:{activities:[]},getStatus:{tabletBattery:64,charging:false},status:{available:true,granted:false},gamepadStatus:{available:true,enabled:false},openGamepadSettings:{}};
 window.Capacitor={PluginHeaders:[{name:'PortDeckNative',methods:['listApps','launchApp','launchOptions','closeApp','appSettings'].map(name=>({name,rtype:'promise'}))},{name:'PortDeckPlatform',methods:[{name:'getStatus',rtype:'promise'}]},{name:'PortDeckNotifications',methods:['status','gamepadStatus','openGamepadSettings','openSettings','open',{name:'addListener',rtype:'callback'}].map(m=>typeof m==='string'?{name:m,rtype:'promise'}:m)}],
  nativePromise:async(plugin,method,options)=>{window.calls.push([plugin,method,options]);return native[method]??{};},
  nativeCallback:(plugin,method,options,cb)=>{(window.listeners[options?.eventName]||=[]).push(cb);return 'cb'+Math.random();}};
 window.padButtons=[];Object.defineProperty(navigator,'getGamepads',{value:()=>[{id:'Xbox test',connected:true,buttons:Array.from({length:17},(_,i)=>({pressed:window.padButtons.includes(i),value:window.padButtons.includes(i)?1:0})),axes:[0,0]}]});
}
test('control center: gamepad focus starts on a card (not ×), is visible and reaches every option',async({page})=>{
 await page.addInitScript(fixture,{});await page.goto(ANDROID);await enter(page);
 await press(page,[8,9]);
 const center=page.locator('[data-control-center]');await expect(center).toBeVisible();
 const focused=center.locator('button:focus');
 await expect(focused).toHaveCount(1);await expect(focused).not.toHaveAttribute('data-center-close','');
 await expect(page.locator('html')).toHaveClass(/pad-nav/);
 expect(await focused.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
 const seen=new Set();for(let i=0;i<8;i++){seen.add(await focused.innerText());await press(page,[15]);}
 expect([...seen].some(t=>/Alternar usuário/.test(t))).toBeTruthy();expect([...seen].some(t=>/Sair/.test(t))).toBeTruthy();
 while(!/Alternar usuário/.test(await focused.innerText()))await press(page,[15]);
 await press(page,[0]);await expect(page.getByRole('heading',{name:'Alternar usuário'})).toBeVisible();
});
test('app picker: gamepad walks the apps, skips the search box and adds the chosen app',async({page})=>{
 await page.addInitScript(fixture,{empty:true});await page.goto(ANDROID);await enter(page);
 await expect(page.getByRole('heading',{name:'Adicionar aplicativo Android'})).toBeVisible();
 await expect(page.locator('.ad-installed button').first()).toBeFocused();
 for(let i=0;i<12;i++){await press(page,[13]);expect(await page.evaluate(()=>document.activeElement?.matches('input:not([type=file])'))).toBeFalsy();}
 while(!/WhatsApp/.test(await page.evaluate(()=>document.activeElement?.innerText||'')))await press(page,[13]);
 await press(page,[0]);
 await expect(page.getByRole('heading',{name:'Adicionar aplicativo Android'})).toHaveCount(0);
 await expect(page.locator('.console-tile-caption',{hasText:'WhatsApp'})).toHaveCount(1);
});
test('running game: badge, Voltar/Fechar jogo in the center and menu, survives reload, close calls Android',async({page})=>{
 await page.addInitScript(fixture,{});await page.goto(ANDROID);await enter(page);
 await page.getByRole('button',{name:/Jogar/}).first().click();
 await expect(page.locator('[data-console-tile="mine"] .console-tile-running')).toHaveText('Em execução');
 await page.reload();await enter(page);
 await expect(page.locator('[data-console-tile="mine"] .console-tile-running')).toBeVisible();
 await page.locator('[data-console-tile="mine"]').click({button:'right'});
 await expect(page.getByRole('menuitem',{name:'Voltar ao jogo'})).toBeVisible();await expect(page.getByRole('menuitem',{name:'Fechar jogo'})).toBeVisible();
 await page.keyboard.press('Escape');
 await press(page,[16]);const center=page.locator('[data-control-center]');
 await expect(center).toContainText('Em execução');await center.getByRole('button',{name:/Fechar jogo/}).click();
 await expect.poll(()=>page.evaluate(()=>window.calls.filter(c=>c[1]==='closeApp').map(c=>c[2].packageName))).toEqual(['com.mojang.minecraftpe']);
 await expect(page.locator('.console-tile-running')).toHaveCount(0);
 expect(await page.evaluate(()=>localStorage.getItem('portdeck-android-running-v1'))).toBeNull();
});
test('Start+Select inside a game (Completo APK) brings PortDeck back with the control center; settings explain activation',async({page})=>{
 await page.addInitScript(fixture,{});await page.goto(ANDROID);await enter(page);
 await page.evaluate(()=>window.listeners.homeButton.forEach(cb=>cb({})));
 await expect(page.locator('[data-control-center]')).toBeVisible();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Notificações do tablet'}).click();
 await expect(page.getByRole('heading',{name:'Start + Select dentro dos jogos'})).toBeVisible();
 await page.getByRole('button',{name:'Ativar'}).click();
 await expect.poll(()=>page.evaluate(()=>window.calls.some(c=>c[1]==='openGamepadSettings'))).toBeTruthy();
});
test('a very long name does not stretch the cover and the title stops at two lines',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('portdeck-android-library-v1',JSON.stringify([{id:'a',packageName:'demo.a',name:'Curto'},{id:'b',packageName:'demo.b',name:'Dragon Ball Z Budokai Tenkaichi 3 Edição Definitiva Brasil Remasterizada Completa'}].map(g=>({cover:'',banner:'',logo:'',playedSeconds:0,lastPlayed:null,...g})))));
 await page.goto(ANDROID);await enter(page);
 const short=await page.locator('[data-console-tile="a"]').boundingBox();
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(700);
 const long=await page.locator('[data-console-tile="b"]').boundingBox();
 expect(long.width).toBeLessThan(short.width*1.4);
 const h1=page.locator('.console-story h1');const lh=await h1.evaluate(el=>parseFloat(getComputedStyle(el).lineHeight)||el.getBoundingClientRect().height);
 expect((await h1.boundingBox()).height).toBeLessThan(lh*2.6);
});
