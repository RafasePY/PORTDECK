import React,{useCallback,useEffect,useRef,useState} from 'react';
import {registerPlugin} from '@capacitor/core';
import {AnimatePresence,motion} from 'motion/react';
const Alerts=registerPlugin('PortDeckNotifications');
export const POPUPS_KEY='portdeck-android-notification-popups-v1';
const LIMIT=3,DURATION=7000;
const readEnabled=()=>{try{return localStorage.getItem(POPUPS_KEY)!=='off';}catch{return true;}};

/** Pop-ups estilo console para notificações do tablet. Só recebe algo depois que o usuário libera o acesso no Android. */
export function useTabletNotifications({paused=false,onError}={}){
 const [granted,setGranted]=useState(null),[enabled,setEnabledState]=useState(readEnabled),[items,setItems]=useState([]);
 const state=useRef({}),timers=useRef(new Map());
 state.current={enabled,paused};
 const dismiss=useCallback(key=>{clearTimeout(timers.current.get(key));timers.current.delete(key);setItems(xs=>xs.filter(x=>x.key!==key));},[]);
 const show=useCallback(item=>{
  if(!item?.key)return;
  clearTimeout(timers.current.get(item.key));
  timers.current.set(item.key,setTimeout(()=>dismiss(item.key),DURATION));
  setItems(xs=>[item,...xs.filter(x=>x.key!==item.key)].slice(0,LIMIT));
 },[dismiss]);
 const refresh=useCallback(async()=>{try{const r=await Alerts.status();setGranted(!!r?.granted);}catch{setGranted(false);}},[]);
 useEffect(()=>{
  refresh();
  const onVisible=()=>{if(!document.hidden)refresh();};
  document.addEventListener('visibilitychange',onVisible);
  let handle,alive=true;
  try{
   Promise.resolve(Alerts.addListener('notification',data=>{
    const s=state.current;
    if(!s.enabled||s.paused||document.hidden)return;
    show(data);
   })).then(h=>{if(alive)handle=h;else h?.remove?.();}).catch(()=>{});
  }catch{}
  return()=>{alive=false;handle?.remove?.();document.removeEventListener('visibilitychange',onVisible);timers.current.forEach(clearTimeout);timers.current.clear();};
 },[refresh,show]);
 const setEnabled=value=>{setEnabledState(value);try{localStorage.setItem(POPUPS_KEY,value?'on':'off');}catch{}if(!value)setItems([]);};
 const open=async item=>{dismiss(item.key);if(item.preview)return;try{await Alerts.open({key:item.key});}catch(e){onError?.(e.message||'Não foi possível abrir a notificação.');}};
 const openSettings=async()=>{try{await Alerts.openSettings();}catch(e){onError?.(e.message||'Não foi possível abrir as configurações.');}};
 const preview=()=>show({key:'preview-'+Date.now(),preview:true,app:'PortDeck',title:'Assim chegam suas mensagens',text:'Toque no aviso para abrir o aplicativo da notificação. Ele some sozinho em alguns segundos.'});
 return {granted,enabled,setEnabled,items,dismiss,open,openSettings,preview,refresh};
}

export function NotificationPopups({items,onOpen,onDismiss}){
 return <div className="ad-alerts" aria-live="polite">
  <AnimatePresence initial={false}>{items.map(item=><motion.div layout key={item.key} className="ad-alert" initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:40}} transition={{duration:.28}}>
   <button type="button" className="ad-alert-body" onClick={()=>onOpen(item)} aria-label={'Abrir notificação de '+item.app}>
    {item.icon?<img src={item.icon} alt=""/>:<span className="ad-alert-glyph" aria-hidden="true">✉</span>}
    <span><small>{item.app}</small>{item.title&&<strong>{item.title}</strong>}{item.text&&<em>{item.text}</em>}</span>
   </button>
   <button type="button" className="ad-alert-close" onClick={()=>onDismiss(item.key)} aria-label="Dispensar notificação">×</button>
  </motion.div>)}</AnimatePresence>
 </div>;
}

export function NotificationSettings({granted,enabled,setEnabled,openSettings,preview}){
 return <div className="ad-alert-settings">
  <p>Quando chegar uma mensagem no tablet — WhatsApp, Gmail ou qualquer app com notificação ativada — o PortDeck mostra um aviso no canto da tela. Toque nele para abrir o app.</p>
  <p className={'ad-alert-state'+(granted?' on':'')}>{granted==null?'Verificando acesso…':granted?'✓ Acesso às notificações liberado':'Acesso às notificações ainda não liberado'}</p>
  {!granted&&<p className="ad-alert-help">Na tela que abrir, ative <b>PortDeck</b> e confirme. Depois volte para cá.</p>}
  <div className="ad-alert-actions">
   {granted?<button type="button" onClick={()=>setEnabled(!enabled)} aria-pressed={enabled}>{enabled?'Pop-ups ligados':'Pop-ups desligados'}</button>:<button type="button" className="action-primary" onClick={openSettings}>Liberar acesso</button>}
   <button type="button" onClick={preview}>Ver exemplo</button>
   {granted&&<button type="button" onClick={openSettings}>Gerenciar acesso</button>}
  </div>
  <small>As notificações aparecem só com o PortDeck aberto. Nada é salvo nem enviado para a internet.</small>
 </div>;
}
