'use strict';
const {app, BrowserWindow, dialog, ipcMain, shell} = require('electron');
// PULSE reproduz áudio local de inicialização antes da primeira interação.
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
const {spawn} = require('node:child_process');
const {existsSync} = require('node:fs');
const path = require('node:path');
const {Library, splitArgs, suggestDirectExe} = require('./backend/library.cjs');
const {AssetStore} = require('./backend/assets.cjs');
let win, db, assetStore, inputBridge;
const running = new Map();
const imageLimit = 12 * 1024 * 1024;
const send = () => {if (win && !win.isDestroyed()) win.webContents.send('library:changed', db.list());};
const sendRunning = () => {if (win && !win.isDestroyed()) win.webContents.send('games:running', [...running.keys()]);};
// Apenas processos iniciados pelo PortDeck podem receber comandos de encerramento.
const errorMessage = e => e && e.message ? e.message : String(e);

function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 880, minWidth: 800, minHeight: 520,
    backgroundColor: '#070914', autoHideMenuBar: true, fullscreen: true, frame: false,
    title: 'PortDeck', show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => {win=null;});
}

function startInputBridge(){
  if(process.platform!=='win32')return;
  const exe=app.isPackaged
    ? path.join(process.resourcesPath,'native','PortDeckInputBridge.exe')
    : path.join(__dirname,'..','assets','native','PortDeckInputBridge.exe');
  if(!existsSync(exe)){console.info('PortDeck: XInput bridge não foi compilado. Atalho disponível com janela em foco.');return;}
  try{
    const helper=spawn(exe,[],{windowsHide:true,stdio:['pipe','pipe','ignore'],shell:false});
    inputBridge=helper;
    let buffer='';
    helper.stdout.setEncoding('utf8');
    helper.stdout.on('data',chunk=>{
      buffer+=chunk;
      if(buffer.length>2048){buffer='';return;}
      let next;
      while((next=buffer.indexOf('\n'))!==-1){
        const line=buffer.slice(0,next).trim();buffer=buffer.slice(next+1);
        if(!/^HOME [0-3]$/.test(line))continue;
        // Só recupera o PortDeck quando ELE tem um jogo iniciado sob acompanhamento.
        if(running.size===0||!win||win.isDestroyed()||win.isFocused())continue;
        try{
          if(win.isMinimized())win.restore();
          win.show();
          win.focus();
          win.webContents.send('input:home');
        }catch(err){console.warn('PortDeck: não conseguiu recuperar a janela:',errorMessage(err));}
      }
    });
    helper.once('error',err=>{console.warn('XInput bridge indisponível:',errorMessage(err));inputBridge=null;});
    helper.once('close',()=>{if(inputBridge===helper)inputBridge=null;});
  }catch(err){console.warn('Não foi possível iniciar o XInput bridge:',errorMessage(err));}
}

function registerHandlers() {
  ipcMain.handle('library:list', () => db.list());
  ipcMain.handle('games:add', async () => {
    const r = await dialog.showOpenDialog(win,{title:'Adicionar port', properties:['openFile'], filters:[{name:'Executáveis',extensions:['exe']}]});
    if (r.canceled || !r.filePaths[0]) return null;
    const game = db.add(r.filePaths[0]); send(); return game;
  });
  ipcMain.handle('games:update', (_event,game) => {const updated=db.update(game);send();return updated;});
  ipcMain.handle('games:remove', (_event,id) => {if(running.has(id)) throw new Error('Feche o jogo antes de removê-lo.');db.remove(id);send();return true;});
  ipcMain.handle('games:suggestDirectExecutable', (_event,id) => {
    const game=db.find(id);
    return game?suggestDirectExe(game.exe):'';
  });
  ipcMain.handle('games:chooseExecutable', async () => {
    const r=await dialog.showOpenDialog(win,{title:'Selecionar executável do jogo',properties:['openFile'],filters:[{name:'Executáveis Windows',extensions:['exe']}]});
    return r.canceled ? '' : (r.filePaths[0] || '');
  });
  ipcMain.handle('assets:import', async (_event,id,kind) => {
    if(!db.find(id))throw new Error('Jogo não encontrado.');
    if(!['cover','banner','logo'].includes(kind))throw new Error('Tipo de arte desconhecido.');
    const r=await dialog.showOpenDialog(win,{
      title:kind==='cover'?'Importar capa':kind==='banner'?'Importar banner':'Importar logotipo',
      properties:['openFile'],filters:[{name:'Arte PNG/JPG/WebP',extensions:['png','jpg','jpeg','webp']}]
    });
    if(r.canceled||!r.filePaths[0])return null;
    const file=assetStore.import(id,kind,r.filePaths[0]);
    return {path:file,preview:assetStore.read(file)};
  });
  ipcMain.handle('covers:choose', async () => {
    const r = await dialog.showOpenDialog(win,{title:'Escolher capa',properties:['openFile'],filters:[{name:'Imagens',extensions:['png','jpg','jpeg','webp']}]});
    return r.canceled ? '' : r.filePaths[0] || '';
  });
  ipcMain.handle('covers:load', (_event,cover) => {
    try{return assetStore.read(cover);}
    catch(err){console.warn('PortDeck: imagem não carregada:',errorMessage(err));return '';}
  });
  ipcMain.handle('window:close', () => {win?.close(); return true;});
  ipcMain.handle('window:toggleFullscreen', () => {win.setFullScreen(!win.isFullScreen());return win.isFullScreen();});
  ipcMain.handle('games:runningList', () => [...running.keys()]);
  ipcMain.handle('games:play', (_event,id) => runGame(id,false));
  ipcMain.handle('games:configure', (_event,id) => runGame(id,true));
  ipcMain.handle('games:openFolder', async (_event,id) => {
    const g=db.find(id);
    if(!g)throw new Error('Jogo não encontrado.');
    const folder=path.dirname(g.exe);
    if(!existsSync(folder))throw new Error('A pasta do jogo não foi encontrada.');
    const result=await shell.openPath(folder);
    if(result)throw new Error(result);
    return {ok:true};
  });
  ipcMain.handle('games:stop', async (_event,id,force=false) => {
    const proc=running.get(id);
    if(!proc)throw new Error('Este jogo não está em execução pelo PortDeck.');
    if(proc.child.exitCode!==null || !proc.child.pid)throw new Error('O processo do jogo já encerrou.');
    const pid=proc.child.pid;
    const command=process.platform==='win32'?'taskkill':null;
    if(command){
      const args=['/PID',String(pid)];
      if(force)args.push('/F','/T');
      await new Promise((resolve,reject)=>{
        const killer=spawn(command,args,{windowsHide:true,shell:false,stdio:'ignore'});
        killer.once('error',reject);
        killer.once('close',code=>code===0?resolve():reject(new Error('O Windows não conseguiu encerrar o processo. Feche-o pelo próprio jogo.')));
      });
    }else{
      proc.child.kill(force?'SIGKILL':'SIGTERM');
    }
    return {ok:true,pending:true};
  });
}

function runGame(id, configure) {
  const g=db.find(id);
  if (!g) throw new Error('Esse jogo não está na biblioteca.');
  if (!configure && running.has(id)) throw new Error('Esse jogo já está sendo executado.');
  // Configurar sempre abre o launcher original, salvo quando um configurador foi definido.
  // Jogar prioriza o .exe direto (ex.: Play God of War III.exe).
  const exe=configure?(g.config || g.exe):(g.directExe || g.exe);
  if (!existsSync(exe) || path.extname(exe).toLowerCase()!=='.exe') throw new Error('Executável não encontrado. Abra Configurar para corrigir o caminho.');
  const cwd=g.cwd && existsSync(g.cwd) ? g.cwd : path.dirname(exe);
  const args=configure?[]:splitArgs(g.args);
  let child;
  try { child = spawn(exe,args,{cwd, windowsHide:false, shell:false, stdio:'ignore'}); }
  catch(err) {throw new Error(`Falha ao iniciar o jogo: ${errorMessage(err)}`);}
  if (configure) {child.on('error',err=>console.error('Configurador:',err));return {ok:true};}
  const started=Date.now();
  const initial=g.playedSeconds;
  running.set(id,{child,started,initial});
  g.lastPlayed=new Date().toISOString();db.save();send();sendRunning();
  const saveProgress=()=>{if(!running.has(id))return; g.playedSeconds=initial+Math.max(0,Math.floor((Date.now()-started)/1000));db.save();send();};
  const timer=setInterval(saveProgress,15000);
  const finish=err=>{
    if (!running.has(id)) return;
    clearInterval(timer);saveProgress();running.delete(id);sendRunning();
    if (err && win && !win.isDestroyed()) dialog.showErrorBox('Erro ao executar',errorMessage(err));
  };
  child.once('error',finish);
  child.once('close',()=>finish());
  return {ok:true};
}

app.whenReady().then(()=>{
  const appdata=path.join(app.getPath('appData'),'PortDeck');
  try {db=new Library(appdata);}catch(e){dialog.showErrorBox('Biblioteca do PortDeck',`Não foi possível ler os jogos: ${errorMessage(e)}`);app.quit();return;}
  assetStore=new AssetStore(appdata);
  registerHandlers();createWindow();startInputBridge();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
});
app.on('before-quit',()=>{if(inputBridge&&!inputBridge.killed){try{inputBridge.stdin?.end();inputBridge.kill();}catch{}}});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
