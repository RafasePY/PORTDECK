import React,{useRef,useState} from 'react';
import {registerPlugin} from '@capacitor/core';
const Native=registerPlugin('PortDeckNative');
export const BACKUP_FORMAT='portdeck-backup';
// Só dados do PortDeck: biblioteca, perfis (com fotos) e preferências. O "jogo em execução" não entra (vale só para a sessão).
const KEYS=k=>k.startsWith('portdeck-')&&k!=='portdeck-android-running-v1';
function openArt(){return new Promise((ok,fail)=>{const req=indexedDB.open('portdeck-android-art',1);req.onupgradeneeded=()=>req.result.createObjectStore('images');req.onsuccess=()=>ok(req.result);req.onerror=()=>fail(req.error);});}
async function readAllArt(){const db=await openArt();try{return await new Promise((ok,fail)=>{const out={},tx=db.transaction('images','readonly'),req=tx.objectStore('images').openCursor();req.onsuccess=()=>{const c=req.result;if(c){out[c.key]=c.value;c.continue();}else ok(out);};req.onerror=()=>fail(req.error);});}finally{db.close();}}
async function replaceArt(images){const db=await openArt();try{await new Promise((ok,fail)=>{const tx=db.transaction('images','readwrite'),st=tx.objectStore('images');st.clear();Object.entries(images).forEach(([k,v])=>{if(typeof v==='string'&&v.startsWith('data:image/'))st.put(v,k);});tx.oncomplete=ok;tx.onerror=()=>fail(tx.error);});}finally{db.close();}}

export async function buildBackup(){
 const storage={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(KEYS(k))storage[k]=localStorage.getItem(k);}
 return {format:BACKUP_FORMAT,version:1,createdAt:new Date().toISOString(),storage,art:await readAllArt()};
}
export function summarize(b){
 let games=0,profiles=0;try{games=JSON.parse(b.storage['portdeck-android-library-v1']||'[]').length;}catch{}try{profiles=JSON.parse(b.storage['portdeck-player-profiles-v1']||'{}').profiles?.length||0;}catch{}
 return {games,profiles,images:Object.keys(b.art||{}).length,createdAt:b.createdAt};
}
export function parseBackup(text){
 const b=JSON.parse(text);
 if(b?.format!==BACKUP_FORMAT||b.version!==1||typeof b.storage!=='object'||!b.storage)throw Error('Este arquivo não é um backup do PortDeck.');
 if(b.storage['portdeck-android-library-v1']!=null&&!Array.isArray(JSON.parse(b.storage['portdeck-android-library-v1'])))throw Error('Backup com biblioteca inválida.');
 return b;
}
// Substitui a biblioteca, perfis e artes atuais pelos do backup (o jogador confirma antes).
export async function restoreBackup(b){
 Object.keys({...localStorage}).filter(KEYS).forEach(k=>localStorage.removeItem(k));
 Object.entries(b.storage).forEach(([k,v])=>{if(KEYS(k)&&typeof v==='string')localStorage.setItem(k,v);});
 await replaceArt(b.art||{});
}

export default function BackupPanel({notify}){
 const file=useRef(null),[busy,setBusy]=useState(false),[pending,setPending]=useState(null);
 const save=async()=>{setBusy(true);try{const b=await buildBackup(),s=summarize(b),name='PortDeck-backup-'+new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')+'.json';const r=await Native.saveBackup({name,data:JSON.stringify(b)});notify(`Backup salvo em ${r?.path||'Downloads'} (${s.games} apps, ${s.profiles} perfis).`);}catch(e){notify(e.message||'Não foi possível salvar o backup.');}finally{setBusy(false);}};
 const pick=f=>{if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const b=parseBackup(String(reader.result));setPending({b,s:summarize(b)});}catch(e){notify(e.message||'Arquivo de backup inválido.');}};reader.onerror=()=>notify('Não foi possível ler o arquivo.');reader.readAsText(f);};
 const restore=async()=>{setBusy(true);try{await restoreBackup(pending.b);notify('Backup restaurado. Recarregando…');setTimeout(()=>location.reload(),600);}catch(e){notify(e.message||'Não foi possível restaurar.');setBusy(false);}};
 return <section className="ad-backup" aria-label="Backup e restauração">
  <div><strong>Backup e restauração</strong><small>Salva biblioteca, capas, perfis e fotos em Downloads/PortDeck. Use antes de desinstalar ou para levar para outro tablet.</small></div>
  {pending?<div className="ad-backup-confirm" role="alertdialog" aria-label="Confirmar restauração"><p>Restaurar backup de {new Date(pending.s.createdAt).toLocaleString('pt-BR')}? <b>{pending.s.games} apps, {pending.s.profiles} perfis, {pending.s.images} imagens.</b> Isso substitui a biblioteca atual.</p><button type="button" onClick={()=>setPending(null)} disabled={busy}>Cancelar</button><button type="button" className="action-primary" onClick={restore} disabled={busy}>Restaurar</button></div>
  :<div className="ad-backup-actions"><button type="button" onClick={save} disabled={busy}>{busy?'Salvando…':'Fazer backup'}</button><button type="button" onClick={()=>file.current?.click()} disabled={busy}>Restaurar backup</button></div>}
  <input ref={file} type="file" accept=".json,application/json" hidden onChange={e=>{pick(e.target.files?.[0]);e.target.value='';}}/>
 </section>;
}
