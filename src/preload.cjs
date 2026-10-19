'use strict';
const {contextBridge,ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('portdeck',Object.freeze({
  list:()=>ipcRenderer.invoke('library:list'),
  add:()=>ipcRenderer.invoke('games:add'),
  update:g=>ipcRenderer.invoke('games:update',g),
  remove:id=>ipcRenderer.invoke('games:remove',id),
  play:id=>ipcRenderer.invoke('games:play',id),
  configure:id=>ipcRenderer.invoke('games:configure',id),
  chooseCover:()=>ipcRenderer.invoke('covers:choose'),
  chooseExecutable:()=>ipcRenderer.invoke('games:chooseExecutable'),
  suggestDirectExecutable:id=>ipcRenderer.invoke('games:suggestDirectExecutable',id),
  loadCover:path=>ipcRenderer.invoke('covers:load',path),
  toggleFullscreen:()=>ipcRenderer.invoke('window:toggleFullscreen'),
  running:()=>ipcRenderer.invoke('games:runningList'),
  onLibrary:cb=>{const fn=(_,games)=>cb(games);ipcRenderer.on('library:changed',fn);return()=>ipcRenderer.removeListener('library:changed',fn);},
  onRunning:cb=>{const fn=(_,ids)=>cb(ids);ipcRenderer.on('games:running',fn);return()=>ipcRenderer.removeListener('games:running',fn);}
}));
