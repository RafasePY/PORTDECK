const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {Library, splitArgs, importLegacyTSV} = require('../src/backend/library.cjs');
test('imports legacy UTF-16 TSV, including played time and paths',()=>{
  const games=importLegacyTSV('\uFEFFGod of War 3\tC:\\Ports\\god.exe\t--full\tC:\\Ports\t\t\t60\t6500\r\n');
  assert.equal(games.length,1);assert.equal(games[0].name,'God of War 3');assert.equal(games[0].playedSeconds,6500);
});
test('splits quoted launch parameters safely',()=>{
  assert.deepEqual(splitArgs('--resolution "1920 1080" --borderless'),['--resolution','1920 1080','--borderless']);
  assert.throws(()=>splitArgs('--name "bad'));
});
test('adds, edits and removes without touching game files',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pd-'));
  try{const exe=path.join(dir,'my-game.exe');fs.writeFileSync(exe,'demo');const db=new Library(dir);
    const g=db.add(exe);assert.equal(db.list().length,1);
    const direct=path.join(dir,'Play my-game.exe');fs.writeFileSync(direct,'demo');
    db.update({...g,name:'Meu jogo',playedSeconds:42,directExe:direct});
    const persisted=new Library(dir).list()[0];assert.equal(persisted.playedSeconds,42);assert.equal(persisted.directExe,direct);
    assert.throws(()=>db.update({...g,directExe:path.join(dir,'inexistente.exe')}));
    db.remove(g.id);assert.equal(new Library(dir).list().length,0);assert.ok(fs.existsSync(exe));
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
