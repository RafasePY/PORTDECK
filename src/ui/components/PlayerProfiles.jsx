import ProfilePhoto from './ProfilePhoto.jsx';
import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {AVATARS,THEMES,defaults,readProfiles,writeProfiles} from '../profiles.mjs';

export function profileCommand(cmd){
 const root=document.querySelector('[data-player-dialog]');
 if(!root)return false;
 if(cmd==='back'||cmd==='home'||cmd==='home-combo'){root.querySelector('[data-profile-close]')?.click();return true;}
 if(cmd==='menu'){root.querySelector('.player-edit')?.click();return true;}
 const controls=[...root.querySelectorAll('button:not(:disabled),input:not([hidden])')];
 const focused=document.activeElement;
 if(focused?.matches('input[type=range]')&&['left','right'].includes(cmd)){const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(focused,Math.max(Number(focused.min),Math.min(Number(focused.max),Number(focused.value)+(cmd==='right'?1:-1)*Number(focused.step||1))));focused.dispatchEvent(new Event('input',{bubbles:true}));focused.dispatchEvent(new Event('change',{bubbles:true}));return true;}
 if(['up','down','left','right'].includes(cmd)){
 const i=controls.indexOf(document.activeElement),delta=['up','left'].includes(cmd)?-1:1;
 controls[(i+delta+controls.length)%controls.length]?.focus();
 }else if(cmd==='accept'&&root.contains(document.activeElement))document.activeElement.click();
 return true;
}
// Troca de usuário como no PS4: só abre quando o jogador escolhe (avatar, tecla P ou ↑ + A no controle), nunca sozinha.
export default function PlayerProfiles(){
 const [data,setData]=useState(()=>{try{return readProfiles(localStorage);}catch{return defaults();}});
 const [open,setOpen]=useState(false),[draft,setDraft]=useState(null),[error,setError]=useState(''),[focusId,setFocusId]=useState(null);
 const trigger=useRef(null),dialog=useRef(null);
 const active=data.profiles.find(p=>p.id===data.activeId)||data.profiles[0];
 const focused=data.profiles.find(p=>p.id===focusId)||active;
 useEffect(()=>{document.documentElement.style.setProperty('--dashboard-accent',THEMES[active.theme].color);},[active.theme]);
 const commit=value=>{try{const saved=writeProfiles(localStorage,value);setData(saved);setError('');return true;}catch{setError('Não foi possível salvar. Verifique o espaço disponível e tente novamente.');return false;}};
 const close=()=>{setOpen(false);setDraft(null);setError('');setFocusId(null);};
 const show=()=>{try{setData(readProfiles(localStorage));setError('');}catch{setError('Os perfis salvos não puderam ser lidos. Nenhum dado foi substituído.');}setOpen(true);};
 useEffect(()=>{
 if(!open)return;
 const before=trigger.current;
 const frame=requestAnimationFrame(()=>['.player-select[aria-pressed=true]','button:not(:disabled)'].map(q=>dialog.current?.querySelector(q)).find(Boolean)?.focus());
 const key=e=>{
 if(!dialog.current)return;
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(draft)setDraft(null);else close();return;}
 if(e.key==='Tab'){
 const items=[...dialog.current.querySelectorAll('button:not(:disabled),input:not([hidden])')],i=items.indexOf(document.activeElement);
 if(e.shiftKey&&i<=0){e.preventDefault();items.at(-1)?.focus();}
 else if(!e.shiftKey&&(i===items.length-1||i<0)){e.preventDefault();items[0]?.focus();}
 }else if(!e.target.matches('input')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
 e.preventDefault();profileCommand(e.key.replace('Arrow','').toLowerCase());
 }
 e.stopImmediatePropagation();
 };
 window.addEventListener('keydown',key,true);
 return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',key,true);before?.focus({preventScroll:true});};
 },[open,draft?.id]);
 const save=e=>{
 e.preventDefault();const name=draft.name.trim();if(!name){setError('Digite um nome para continuar.');return;}
 const next={...draft,name:name.slice(0,24)};
 const profiles=data.profiles.some(p=>p.id===next.id)?data.profiles.map(p=>p.id===next.id?next:p):[...data.profiles,next];
 if(commit({...data,profiles,activeId:next.id})){setDraft(null);}
 };
 return <>
 <button ref={trigger} className="player-chip" onClick={show} aria-label={'Perfil de '+active.name} aria-haspopup="dialog" title="Seu perfil (P)">
 <span className="player-avatar" style={{background:THEMES[active.theme].color}} aria-hidden="true">{active.photo?<img src={active.photo} alt=""/>:active.avatar}</span><span className="player-name">{active.name}</span>
 </button>
 {open&&createPortal(<div className="player-shade ps-users-shade">
 <section ref={dialog} className={draft?'player-panel':'ps-users'} data-player-dialog role="dialog" aria-modal="true" aria-labelledby="player-title">
 {draft?<header><div><small>PORTDECK · PERFIS</small><h2 id="player-title">Seu espaço. Seu estilo.</h2></div><button data-profile-close className="player-close" onClick={()=>setDraft(null)} aria-label="Voltar para os usuários">×</button></header>
 :<header className="ps-users-top"><h2 id="player-title">Alternar usuário</h2></header>}
 {error&&<p className="player-error" role="alert">{error}</p>}
 {draft?<form onSubmit={save}>
 <div className="player-preview"><span className="player-avatar" style={{background:THEMES[draft.theme].color}}>{draft.photo?<img src={draft.photo} alt=""/>:draft.avatar}</span><div><strong>{draft.name||'Seu nome'}</strong><small>Pronto para a próxima aventura</small></div></div>
 <ProfilePhoto photo={draft.photo} onChange={photo=>setDraft(d=>({...d,photo}))} onError={setError}/>
 <label className="player-label">Nome do perfil<input autoComplete="off" maxLength={24} required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
 <fieldset><legend>Escolha seu símbolo</legend><div className="player-options">{AVATARS.map(a=><button type="button" key={a} aria-label={'Avatar '+a} aria-pressed={draft.avatar===a} onClick={()=>setDraft({...draft,avatar:a,photo:''})}>{a}</button>)}</div></fieldset>
 <fieldset><legend>Cor do seu PortDeck</legend><div className="player-themes">{Object.entries(THEMES).map(([id,t])=><button type="button" key={id} aria-pressed={draft.theme===id} onClick={()=>setDraft({...draft,theme:id})}><i style={{background:t.color}}/>{t.name}</button>)}</div></fieldset>
 <footer><button type="button" onClick={()=>setDraft(null)}>Cancelar</button><button className="player-primary" type="submit">Salvar perfil</button></footer>
 </form>:<>
 <div className="ps-users-body">
 <h3>Quem vai jogar?</h3>
 <ul><li>A biblioteca, as horas e os saves dos jogos continuam compartilhados.</li><li>Cada usuário guarda nome, foto e a cor do PortDeck neste dispositivo.</li></ul>
 <div className="ps-users-row">
 <button className="ps-user ps-user-new" disabled={data.profiles.length>=12} aria-label="Novo usuário" onFocus={()=>setFocusId(null)} onClick={()=>setDraft({id:crypto.randomUUID(),name:'',avatar:AVATARS[data.profiles.length%AVATARS.length],theme:'ocean'})}><span className="ps-user-art" aria-hidden="true">＋</span><strong>Novo usuário</strong></button>
 {data.profiles.map(p=><button key={p.id} className="player-select ps-user" aria-pressed={p.id===active.id} aria-label={p.name+(p.id===active.id?', perfil atual':'')} onFocus={()=>setFocusId(p.id)} onClick={()=>{if(commit({...data,activeId:p.id}))close();}}>
 <span className="ps-user-art" style={{background:THEMES[p.theme].color}} aria-hidden="true">{p.photo?<img src={p.photo} alt=""/>:p.avatar}</span><strong>{p.name}</strong>{p.id===active.id&&<small>Perfil atual</small>}</button>)}
 </div>
 </div>
 <footer className="ps-users-foot"><span><kbd>A</kbd> Confirmar</span><button type="button" data-profile-close onClick={close}><kbd>B</kbd> Cancelar</button><button type="button" className="player-edit" aria-label={'Editar perfil de '+focused.name} onClick={()=>setDraft({...focused})}><kbd>☰</kbd> Editar perfil</button></footer>
 </>}
 </section></div>,document.body)}
 </>;
}
