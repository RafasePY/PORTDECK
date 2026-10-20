import {test,expect} from '@playwright/test';
const ANDROID='http://127.0.0.1:4174/';
test('android: empty library offers adding an app once the welcome profile closes',async({page})=>{
 await page.goto(ANDROID);
 await expect(page.getByRole('heading',{name:'Quem vai jogar?'})).toBeVisible({timeout:12000});
 await expect(page.getByRole('heading',{name:'Adicionar aplicativo Android'})).toHaveCount(0);
 await page.locator('.player-select').first().click();
 await expect(page.getByRole('heading',{name:'Adicionar aplicativo Android'})).toBeVisible();
});
test('android: dismissing the welcome also offers the first app, but switching profiles later does not',async({page})=>{
 await page.goto(ANDROID);
 await expect(page.getByRole('heading',{name:'Quem vai jogar?'})).toBeVisible({timeout:12000});
 await page.keyboard.press('Escape');
 await expect(page.getByRole('heading',{name:'Adicionar aplicativo Android'})).toBeVisible();
 await page.locator('.ad-modal>header button').click();
 await page.locator('.player-chip').click();
 await page.locator('.player-select').first().click();
 await expect(page.locator('[data-player-dialog]')).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'Adicionar aplicativo Android'})).toHaveCount(0);
});
test('android: a library with games goes straight to the console after the profile',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('portdeck-android-library-v1',JSON.stringify([{id:'demo',packageName:'com.example.demo',name:'Demo',cover:'',banner:'',logo:'',playedSeconds:0,lastPlayed:null}])));
 await page.goto(ANDROID);
 await expect(page.getByRole('heading',{name:'Quem vai jogar?'})).toBeVisible({timeout:12000});
 await page.locator('.player-select').first().click();
 await expect(page.locator('[data-player-dialog]')).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'Adicionar aplicativo Android'})).toHaveCount(0);
});
const withGames=()=>localStorage.setItem('portdeck-android-library-v1',JSON.stringify(['Celeste','Hollow Knight'].map((name,i)=>({id:'a'+i,packageName:'com.example.a'+i,name,cover:'',banner:'',logo:'',playedSeconds:0,lastPlayed:null}))));
test('android: arrow keys move through games right after the welcome profile closes',async({page})=>{
 await page.addInitScript(withGames);
 await page.goto(ANDROID);
 await expect(page.getByRole('heading',{name:'Quem vai jogar?'})).toBeVisible({timeout:12000});
 await page.keyboard.press('Escape');
 await expect(page.locator('.console-tile.active')).toBeFocused();
 await expect(page.locator('.console-tile.active')).toHaveAttribute('data-console-tile','a0');
 await page.keyboard.press('ArrowRight');
 await expect(page.locator('.console-tile.active')).toHaveAttribute('data-console-tile','a1');
});
test('android: notification settings explain access and preview a pop-up',async({page})=>{
 await page.addInitScript(withGames);
 await page.goto(ANDROID);
 await expect(page.getByRole('heading',{name:'Quem vai jogar?'})).toBeVisible({timeout:12000});
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Notificações do tablet'}).click();
 await expect(page.getByText('Acesso às notificações ainda não liberado')).toBeVisible();
 await expect(page.getByRole('button',{name:'Liberar acesso'})).toBeVisible();
 await page.getByRole('button',{name:'Ver exemplo'}).click();
 const popup=page.locator('.ad-alert');
 await expect(popup).toContainText('Assim chegam suas mensagens');
 await page.getByRole('button',{name:'Dispensar notificação'}).click();
 await expect(popup).toHaveCount(0);
});
