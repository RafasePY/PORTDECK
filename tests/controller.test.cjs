'use strict';
const{test}=require('node:test'),assert=require('node:assert/strict');
let mod;
test('load standard controller helpers',async()=>{mod=await import('../src/ui/input/controller.mjs');assert.ok(mod.comboCommand)});
test('8BitDo is detected before generic XInput and controller labels are honest',()=>{
 assert.equal(mod.identifyController('8BitDo Ultimate 2.4G (STANDARD GAMEPAD)').kind,'8bitdo');
 assert.equal(mod.identifyController('Xbox 360 Controller').kind,'xbox');
 assert.equal(mod.identifyController('Sony Interactive Entertainment Wireless Controller').kind,'playstation');
 assert.equal(mod.identifyController('XInput STANDARD GAMEPAD').kind,'xinput');
 assert.equal(mod.identifyController('').kind,'keyboard');
});
test('Start + Select has priority over isolated Start and gamepad Home',()=>{
 const btn=Array.from({length:17},()=>({pressed:false}));
 btn[8].pressed=true;btn[9].pressed=true;
 assert.equal(mod.comboCommand(btn),'home-combo');
 assert.equal(mod.isStartSelectPressed(btn),true);
 btn[8].pressed=false;assert.equal(mod.comboCommand(btn),'menu');
 btn[9].pressed=false;btn[16].pressed=true;assert.equal(mod.comboCommand(btn),'home');
});
