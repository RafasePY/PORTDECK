import {test,expect} from '@playwright/test';
// 1.2.1: no Windows o controle precisa alcançar Adicionar/Pesquisar/Biblioteca na fileira e todos os botões do topo.
const enter=async page=>{await page.locator('.ps-welcome[data-ready="true"]').waitFor();await page.keyboard.press('Enter');await expect(page.locator('.ps-welcome')).toHaveCount(0);};
const press=async(page,buttons)=>{await page.evaluate(b=>window.padButtons=b,buttons);await page.waitForTimeout(110);await page.evaluate(()=>window.padButtons=[]);await page.waitForTimeout(90);};
function fixture(){
 const games=[{id:'gow',name:'God of War III',exe:'C:/Jogos/gow.exe',cover:'',banner:'',logo:'',playedSeconds:540,lastPlayed:null}];
 window.added=0;window.fullscreen=0;
 window.portdeck={list:async()=>games,running:async()=>[],onLibrary:()=>()=>{},onRunning:()=>()=>{},onHome:()=>()=>{},loadCover:async()=>'',icon:async()=>'',add:async()=>{window.added++;return null;},toggleFullscreen:async()=>{window.fullscreen++;},closeWindow:async()=>{}};
 window.padButtons=[];Object.defineProperty(navigator,'getGamepads',{value:()=>[{id:'Xbox 360 Controller (XInput STANDARD GAMEPAD)',connected:true,buttons:Array.from({length:17},(_,i)=>({pressed:window.padButtons.includes(i),value:window.padButtons.includes(i)?1:0})),axes:[0,0]}]});
}
const focusedText=page=>page.evaluate(()=>document.activeElement?.getAttribute('aria-label')||document.activeElement?.title||document.activeElement?.innerText||'');
test('Windows gamepad: right from the last game reaches Adicionar, Pesquisar and Biblioteca; A on Adicionar adds',async({page})=>{
 await page.addInitScript(fixture);await page.goto('/');await enter(page);
 await expect(page.locator('.console-tile.active')).toBeFocused();
 await press(page,[15]);expect(await focusedText(page)).toMatch(/Adicionar/);
 await press(page,[0]);await expect.poll(()=>page.evaluate(()=>window.added)).toBe(1);
 await press(page,[15]);expect(await focusedText(page)).toMatch(/Pesquisar/);
 await press(page,[15]);expect(await focusedText(page)).toMatch(/biblioteca/i);
 await press(page,[0]);await expect(page.getByPlaceholder('Pesquisar na biblioteca (jogos e mídia)...')).toBeVisible();
});
test('Windows gamepad: up goes to the header and left/right reach sound, full screen and power',async({page})=>{
 await page.addInitScript(fixture);await page.goto('/');await enter(page);
 await press(page,[12]);await expect(page.locator('.player-chip')).toBeFocused();
 const seen=new Set();for(let i=0;i<10;i++){await press(page,[15]);seen.add(await focusedText(page));}
 const all=[...seen].join(' | ');
 expect(all).toMatch(/Tela cheia/);expect(all).toMatch(/efeitos sonoros/);expect(all).toMatch(/Sair do PortDeck/);
 while(!/Tela cheia/.test(await focusedText(page)))await press(page,[15]);
 await press(page,[0]);await expect.poll(()=>page.evaluate(()=>window.fullscreen)).toBe(1);
 await press(page,[13]);await expect(page.locator('.console-tile.active')).toBeFocused();
});
