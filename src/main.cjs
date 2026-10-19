'use strict';
const {app, BrowserWindow, dialog, ipcMain, nativeImage} = require('electron');
const {spawn} = require('node:child_process');
const {readFileSync, existsSync, statSync} = require('node:fs');
const path = require('node:path');
const {Library, splitArgs} = require('./backend/library.cjs');
let win, db;
const running = new Map();
const imageLimit = 12 * 1024 * 1024;
const send = () => {if (win && !win.isDestroyed()) win.webContents.send('library:changed', db.list());};
const sendRunning = () => {if (win && !win.isDestroyed()) win.webContents.send('games:running', [...running.keys()]);};
const errorMessage = e => e && e.message ? e.message : String(e);

function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 880, minWidth: 800, minHeight: 520,
    backgroundColor: '#0a111e', autoHideMenuBar: true, fullscreen: true,
    title: 'PortDeck', show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => {win=null;});
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
  ipcMain.handle('covers:choose', async () => {
    const r = await dialog.showOpenDialog(win,{title:'Escolher capa',properties:['openFile'],filters:[{name:'Imagens',extensions:['png','jpg','jpeg','webp']}]});
    return r.canceled ? '' : r.filePaths[0] || '';
  });
  ipcMain.handle('covers:load', (_event,cover) => {
    if (typeof cover !== 'string' || !/\.(png|jpe?g|webp)$/i.test(cover) || !existsSync(cover)) return '';
    if (statSync(cover).size > imageLimit) return '';
    const ext=path.extname(cover).toLowerCase();
    const mime=ext==='.png'?'image/png':ext==='.webp'?'image/webp':'image/jpeg';
    return `data:${mime};base64,${readFileSync(cover).toString('base64')}`;
  });
  ipcMain.handle('window:toggleFullscreen', () => {win.setFullScreen(!win.isFullScreen());return win.isFullScreen();});
  ipcMain.handle('games:runningList', () => [...running.keys()]);
  ipcMain.handle('games:play', (_event,id) => runGame(id,false));
  ipcMain.handle('games:configure', (_event,id) => runGame(id,true));
}

function runGame(id, configure) {
  const g=db.find(id);
  if (!g) throw new Error('Esse jogo não está na biblioteca.');
  if (!configure && running.has(id)) throw new Error('Esse jogo já está sendo executado.');
  const exe=configure?g.config:g.exe;
  if (!exe) throw new Error('Esse jogo não possui configurador definido.');
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
  registerHandlers();createWindow();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
