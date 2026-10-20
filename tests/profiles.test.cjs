const {test}=require('node:test');const assert=require('node:assert/strict');
const mod=import('../src/ui/profiles.mjs');
test('first run, create and switch profiles survive storage round trip',async()=>{
 const {readProfiles,writeProfiles}=await mod;let raw=null;const storage={getItem:()=>raw,setItem:(_,v)=>{raw=v;}};
 const initial=readProfiles(storage);assert.equal(initial.profiles.length,1);
 const next={...initial,activeId:'two',profiles:[...initial.profiles,{id:'two',name:'Luísa',avatar:'✦',theme:'violet'}]};
 writeProfiles(storage,next);assert.deepEqual(readProfiles(storage),next);
});
test('invalid, duplicate and stale profile values are handled',async()=>{
 const {normalize}=await mod;
 const data=normalize({version:1,activeId:'missing',profiles:[{id:'a',name:'  Carlos  ',avatar:'bad',theme:'__proto__'},{id:'a',name:'Duplicate'}]});
 assert.equal(data.profiles.length,1);assert.equal(data.activeId,'a');assert.equal(data.profiles[0].name,'Carlos');assert.equal(data.profiles[0].theme,'ocean');
 assert.throws(()=>normalize({version:2,profiles:[]}));
});
test('corrupt storage is not silently overwritten and save failures propagate',async()=>{
 const {readProfiles,writeProfiles,defaults}=await mod;let writes=0;
 const storage={getItem:()=>'{broken',setItem:()=>{writes++;throw Error('quota');}};
 assert.throws(()=>readProfiles(storage));assert.equal(writes,0);assert.throws(()=>writeProfiles(storage,defaults()),/quota/);
});
