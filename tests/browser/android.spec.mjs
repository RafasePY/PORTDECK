import {test,expect} from '@playwright/test';
// A abertura espera o jogador apertar um botão, como no PS4.
const enter=async page=>{await page.locator('.ps-welcome[data-ready="true"]').waitFor({timeout:8000});await page.keyboard.press('Enter');};
const ANDROID='http://127.0.0.1:4174/';
const addApp=page=>page.getByRole('heading',{name:'Adicionar aplicativo Android'});
const withGames=()=>localStorage.setItem('portdeck-android-library-v1',JSON.stringify(['Celeste','Hollow Knight'].map((name,i)=>({id:'a'+i,packageName:'com.example.a'+i,name,cover:'',banner:'',logo:'',playedSeconds:0,lastPlayed:null}))));
test('android: empty library offers adding an app right after the welcome screen',async({page})=>{
 await page.goto(ANDROID);
 await enter(page);
 await expect(addApp(page)).toBeVisible();
 await expect(page.locator('[data-player-dialog]')).toHaveCount(0);
});
test('android: switching users later does not reopen the app picker',async({page})=>{
 await page.goto(ANDROID);
 await enter(page);
 await expect(addApp(page)).toBeVisible();
 await page.locator('.ad-modal>header button').click();
 await expect(addApp(page)).toHaveCount(0);
 await page.locator('.player-chip').click();
 await expect(page.getByRole('heading',{name:'Alternar usuário'})).toBeVisible();
 await page.locator('.player-select').first().click();
 await expect(page.locator('[data-player-dialog]')).toHaveCount(0);
 await expect(addApp(page)).toHaveCount(0);
});
test('android: a library with games goes straight to the console, without asking who plays',async({page})=>{
 await page.addInitScript(withGames);
 await page.goto(ANDROID);
 await enter(page);
 await expect(page.locator('.console-tile.active')).toBeFocused();
 await page.waitForTimeout(800);
 await expect(page.locator('[data-player-dialog]')).toHaveCount(0);
 await expect(addApp(page)).toHaveCount(0);
});
test('android: arrow keys move through games right after the welcome screen',async({page})=>{
 await page.addInitScript(withGames);
 await page.goto(ANDROID);
 await enter(page);
 await expect(page.locator('.console-tile.active')).toBeFocused();
 await expect(page.locator('.console-tile.active')).toHaveAttribute('data-console-tile','a0');
 await page.keyboard.press('ArrowRight');
 await expect(page.locator('.console-tile.active')).toHaveAttribute('data-console-tile','a1');
});
test('android: notification settings explain access and preview a pop-up',async({page})=>{
 await page.addInitScript(withGames);
 await page.goto(ANDROID);
 await enter(page);
 await page.getByRole('button',{name:'Notificações do tablet'}).click();
 await expect(page.getByText('Acesso às notificações ainda não liberado')).toBeVisible();
 await expect(page.getByRole('button',{name:'Liberar acesso'})).toBeVisible();
 await page.getByRole('button',{name:'Ver exemplo'}).click();
 const popup=page.locator('.ad-alert');
 await expect(popup).toContainText('Assim chegam suas mensagens');
 await page.getByRole('button',{name:'Dispensar notificação'}).click();
 await expect(popup).toHaveCount(0);
});
