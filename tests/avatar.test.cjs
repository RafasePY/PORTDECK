const {test}=require('node:test');const assert=require('node:assert/strict');
test('crop stays inside portrait and landscape photos at every edge',async()=>{
 const {cropRect}=await import('../src/ui/avatar.mjs');
 for(const [w,h]of [[1200,800],[800,1200],[256,256]])for(const zoom of [1,2,3])for(const x of [0,50,100])for(const y of [0,50,100]){
 const r=cropRect(w,h,zoom,x,y);assert.ok(r.sx>=0&&r.sy>=0);assert.ok(r.sx+r.side<=w+.001&&r.sy+r.side<=h+.001);
 }
 assert.throws(()=>cropRect(0,100));
});
test('legacy profiles survive and only bounded JPEG photos persist',async()=>{
 const {normalize,defaults}=await import('../src/ui/profiles.mjs');
 const old=defaults();assert.deepEqual(normalize(old),old);
 const photo='data:image/jpeg;base64,/9j/AA==';
 old.profiles[0].photo=photo;assert.equal(normalize(old).profiles[0].photo,photo);
 for(const bad of ['https://example.com/p.jpg','data:image/svg+xml;base64,AA==','data:image/jpeg;base64,'+'A'.repeat(120001)]){
 old.profiles[0].photo=bad;assert.equal(normalize(old).profiles[0].photo,undefined);
 }
});
