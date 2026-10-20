import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {AVATARS,THEMES,defaults,readProfiles,writeProfiles} from '../profiles.mjs';

export function profileCommand(cmd){
 const root=document.querySelector('[data-player-dialog]');
 if(!root)return false;
 if(cmd==='back'||cmd==='home'||cmd==='home-combo'){root.querySelector('[data-profile-close]')?.click();return true;}
 const controls=[...root.querySelectorAll('button:not(:disabled),input')];
 if(['up','down','left','right'].includes(cmd)){
 const i=controls.indexOf(document.activeElement),delta=['up','left'].includes(cmd)?-1:1;
 controls[(i+delta+controls.length)%controls.length]?.focus();
 }else if(cmd==='accept'&&root.contains(document.activeElement))document.activeElement.click();
 return true;
}
export default function PlayerProfiles(){
 const [data,setData]=useState(()=>{try{return readProfiles(localStorage);}catch{return defaults();}});
 const [open,setOpen]=useState(false),[draft,setDraft]=useState(null),[error,setError]=useState('');
 const trigger=useRef(null),dialog=useRef(null);
 const active=data.profiles.find(p=>p.id===data.activeId)||data.profiles[0];
 useEffect(()=>{document.documentElement.style.setProperty('--dashboard-accent',THEMES[active.theme].color);},[active.theme]);
 const commit=value=>{try{const saved=writeProfiles(localStorage,value);setData(saved);setError('');return true;}catch{setError('Não foi possível salvar. Verifique o espaço disponível e tente novamente.');return false;}};
 const close=()=>{setOpen(false);setDraft(null);setError('');};
 const show=()=>{try{setData(readProfiles(localStorage));setError('');}catch{setError('Os perfis salvos não puderam ser lidos. Nenhum dado foi substituído.');}setOpen(true);};
 useEffect(()=>{
 if(!open)return;
 const before=trigger.current;
 const frame=requestAnimationFrame(()=>dialog.current?.querySelector('input,button')?.focus());
 const key=e=>{
 if(!dialog.current)return;
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return;}
 if(e.key==='Tab'){
 const items=[...dialog.current.querySelectorAll('button:not(:disabled),input')],i=items.indexOf(document.activeElement);
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
 <span className="player-avatar" style={{background:THEMES[active.theme].color}} aria-hidden="true">{active.avatar}</span><span className="player-name">{active.name}</span>
 </button>
 {open&&createPortal(<div className="player-shade" onPointerDown={e=>{if(e.target===e.currentTarget)close();}}>
 <section ref={dialog} className="player-panel" data-player-dialog role="dialog" aria-modal="true" aria-labelledby="player-title">
 <header><div><small>PORTDECK · PERFIS</small><h2 id="player-title">{draft?'Seu espaço. Seu estilo.':'Quem vai jogar?'}</h2></div><button data-profile-close className="player-close" onClick={close} aria-label="Fechar perfis">×</button></header>
 {error&&<p className="player-error" role="alert">{error}</p>}
 {draft?<form onSubmit={save}>
 <div className="player-preview"><span className="player-avatar" style={{background:THEMES[draft.theme].color}}>{draft.avatar}</span><div><strong>{draft.name||'Seu nome'}</strong><small>Pronto para a próxima aventura</small></div></div>
 <label className="player-label">Nome do perfil<input autoComplete="off" maxLength={24} required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
 <fieldset><legend>Escolha seu símbolo</legend><div className="player-options">{AVATARS.map(a=><button type="button" key={a} aria-label={'Avatar '+a} aria-pressed={draft.avatar===a} onClick={()=>setDraft({...draft,avatar:a})}>{a}</button>)}</div></fieldset>
 <fieldset><legend>Cor do seu PortDeck</legend><div className="player-themes">{Object.entries(THEMES).map(([id,t])=><button type="button" key={id} aria-pressed={draft.theme===id} onClick={()=>setDraft({...draft,theme:id})}><i style={{background:t.color}}/>{t.name}</button>)}</div></fieldset>
 <footer><button type="button" onClick={()=>setDraft(null)}>Cancelar</button><button className="player-primary" type="submit">Salvar perfil</button></footer>
 </form>:<>
 <div className="player-list">{data.profiles.map(p=><div key={p.id} className="player-row">
 <button className="player-select" aria-pressed={p.id===active.id} onClick={()=>{if(commit({...data,activeId:p.id}))close();}}><span className="player-avatar" style={{background:THEMES[p.theme].color}}>{p.avatar}</span><span><strong>{p.name}</strong><small>{p.id===active.id?'Perfil atual':'Entrar neste perfil'}</small></span><span className="player-check">{p.id===active.id?'✓':'›'}</span></button>
 <button className="player-edit" aria-label={'Editar perfil de '+p.name} onClick={()=>setDraft({...p})}>Editar</button>
 </div>)}</div>
 <button className="player-create" disabled={data.profiles.length>=12} onClick={()=>setDraft({id:crypto.randomUUID(),name:'',avatar:AVATARS[data.profiles.length%AVATARS.length],theme:'ocean'})}>＋ Criar perfil</button>
 <p className="player-note">Perfis locais neste dispositivo. A biblioteca, as horas e os saves dos jogos são compartilhados.</p>
 </>}
 </section></div>,document.body)}
 </>;
}
