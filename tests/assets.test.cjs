'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {AssetStore,imageType,MAX_IMAGE_BYTES}=require('../src/backend/assets.cjs');
const PNG=Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489','hex');
const JPG=Buffer.from('ffd8ffe000104a46494600010101006000600000ffd9','hex');
const WEBP=Buffer.from('5249464610000000574542505650382000000000000000','hex');
test('accepts PNG/JPG/WebP signatures and rejects other content',()=>{
 assert.equal(imageType(PNG).mime,'image/png');assert.equal(imageType(JPG).ext,'jpg');assert.equal(imageType(WEBP).ext,'webp');
 assert.throws(()=>imageType(Buffer.from('not an image')));
});
test('copies an image into managed assets without modifying source and keeps stable content-addressed path',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'portdeck-assets-'));
 try{
  const src=path.join(root,'arte com espaço.png');fs.writeFileSync(src,PNG);
  const store=new AssetStore(root);const game='0c01a123-4f00-4aba-9898-fbd55e89b352';
  const dest=store.import(game,'logo',src);
  assert.ok(dest.includes(path.join('assets',game)));
  assert.ok(dest.endsWith('.png'));assert.ok(fs.existsSync(src));
  assert.deepEqual(fs.readFileSync(dest),fs.readFileSync(src));
  assert.equal(dest,store.import(game,'logo',src));
  assert.match(store.read(dest),/^data:image\/png;base64,/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('rejects invalid kinds, traversal id, too large, and nonexistent images',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'portdeck-assets-'));
 try{
  const store=new AssetStore(root),source=path.join(root,'valid.png');fs.writeFileSync(source,PNG);
  assert.throws(()=>store.import('../wrong','logo',source));
  assert.throws(()=>store.import('test','script',source));
  assert.throws(()=>store.import('test','cover',path.join(root,'missing.png')));
  const big=path.join(root,'big.png');fs.writeFileSync(big,Buffer.concat([PNG,Buffer.alloc(MAX_IMAGE_BYTES)]));
  assert.throws(()=>store.import('test','cover',big),/12 MB/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
