import React,{useCallback,useEffect,useRef,useState} from 'react';
import {registerPlugin} from '@capacitor/core';
import {AnimatePresence,motion} from 'motion/react';
const Alerts=registerPlugin('PortDeckNotifications');
export const POPUPS_KEY='portdeck-android-notification-popups-v1';
const LIMIT=3,DURATION=7000;
const readEnabled=()=>{try{return localStorage.getItem(POPUPS_KEY)!=='off';}catch{return true;}};

/** Pop-ups estilo console para notificações do tablet. Só recebe algo depois que o usuário libera o acesso no Android. */
export function useTabletNotifications({paused=false,onError}={}){
 const [granted,setGranted]=useState(null),[available,setAvailable]=useState(true),[enabled,setEnabledState]=useState(readEnabled),[items,setItems]=useState([]);
 const state=useRef({}),timers=useRef(new Map());
 state.current={enabled,paused};
 const dismiss=useCallback(key=>{clearTimeout(timers.current.get(key));timers.current.delete(key);setItems(xs=>xs.filter(x=>x.key!==key));},[]);
 const show=useCallback(item=>{
  if(!item?.key)return;
  clearTimeout(timers.current.get(item.key));
  timers.current.set(item.key,setTimeout(()=>dismiss(item.key),DURATION));
  setItems(xs=>[item,...xs.filter(x=>x.key!==item.key)].slice(0,LIMIT));
 },[dismiss]);
 const refresh=useCallback(async()=>{try{const r=await Alerts.status();setAvailable(r?.available!==false);setGranted(!!r?.granted);}catch{setGranted(false);}},[]);
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
 return {available,granted,enabled,setEnabled,items,dismiss,open,openSettings,preview,refresh};
}

/** Start + Select dentro dos jogos (APK Completo): estado do serviço de acessibilidade e aviso de "voltei ao PortDeck". */
export function useGamepadAccess({onHome,onCloseResult}={}){
 const [state,setState]=useState({available:false,enabled:false}),home=useRef(onHome),closed=useRef(onCloseResult);home.current=onHome;closed.current=onCloseResult;
 const refresh=useCallback(async()=>{try{const r=await Alerts.gamepadStatus();setState({available:!!r?.available,enabled:!!r?.enabled,connected:!!r?.connected,lastKey:r?.lastKey||'',lastKeyAt:r?.lastKeyAt||0,batteryFree:!!r?.batteryFree});}catch{setState({available:false,enabled:false});}},[]);
 useEffect(()=>{
  refresh();
  const onVisible=()=>{if(!document.hidden)refresh();};
  document.addEventListener('visibilitychange',onVisible);
  let handle,alive=true;
  let closeHandle;
  try{Promise.resolve(Alerts.addListener('homeButton',()=>home.current?.())).then(h=>{if(alive)handle=h;else h?.remove?.();}).catch(()=>{});}catch{}
  try{Promise.resolve(Alerts.addListener('closeResult',r=>closed.current?.(r))).then(h=>{if(alive)closeHandle=h;else h?.remove?.();}).catch(()=>{});}catch{}
  // Aberto a frio por Start+Select (o Android tinha encerrado o PortDeck durante o jogo).
  try{Promise.resolve(Alerts.consumeHome()).then(r=>{if(alive&&r?.home)home.current?.();}).catch(()=>{});}catch{}
  return()=>{alive=false;handle?.remove?.();closeHandle?.remove?.();document.removeEventListener('visibilitychange',onVisible);};
 },[refresh]);
 const openSettings=async()=>{try{await Alerts.openGamepadSettings();}catch{}};
 const openBattery=async()=>{try{await Alerts.openBatterySettings();}catch{}};
 return {...state,openSettings,openBattery,refresh};
}

const ago=t=>{if(!t)return '';const s=Math.max(0,Math.round((Date.now()-t)/1000));return s<60?'há '+s+' s':s<3600?'há '+Math.round(s/60)+' min':'há '+Math.round(s/3600)+' h';};
export function GamepadAccessSettings({available,enabled,connected,lastKey,lastKeyAt,batteryFree,openSettings,openBattery,refresh}){
 // Atualiza o diagnóstico enquanto a janela está aberta (para testar apertando Start/Select).
 useEffect(()=>{if(!available||!refresh)return;const id=setInterval(refresh,1500);return()=>clearInterval(id);},[available,refresh]);
 if(!available)return null;
 return <div className="ad-alert-settings ad-gamepad-settings">
  <h3>Start + Select dentro dos jogos</h3>
  <p>Com um jogo aberto, aperte <b>Start + Select</b> (ou o botão Home do controle) para voltar ao PortDeck e abrir a central, como o botão PS.</p>
  <p className={'ad-alert-state'+(enabled?' on':'')}>{enabled?'✓ Ativado':'Ainda não ativado'}</p>
  {!enabled&&<p className="ad-alert-help">Toque em Ativar → <b>Apps instalados</b> → <b>PortDeck · Start + Select</b> → ligar. Se aparecer "configuração restrita": Configurações → Apps → PortDeck Safe → ⋮ → Permitir configurações restritas.</p>}
  <div className="ad-alert-actions"><button type="button" className={enabled?'':'action-primary'} onClick={openSettings}>{enabled?'Gerenciar':'Ativar'}</button>{enabled&&<button type="button" className={batteryFree?'':'action-primary'} onClick={openBattery}>{batteryFree?'✓ Bateria sem restrição':'Não deixar o Android adormecer'}</button>}</div>
  {enabled&&<p className="ad-gamepad-diag" aria-live="polite">Serviço {connected?'ativo':'parado — desative e ative de novo em Acessibilidade'} · Último botão recebido: {lastKey?<b>{lastKey} {ago(lastKeyAt)}</b>:'nenhum ainda'}</p>}
  {enabled&&!batteryFree&&<p className="ad-alert-help">A Samsung adormece apps em segundo plano e o Start+Select para de responder depois de um tempo de jogo. Toque em <b>Não deixar o Android adormecer</b> e permita. Se ainda parar: Config. → Bateria → Limites de uso em segundo plano → <b>Apps que nunca entram em suspensão</b> → adicionar PortDeck Safe.</p>}
  <small>Também usado pelo "Fechar jogo": o PortDeck abre as Configurações do jogo e aperta Forçar parada por você. Ele só lê a tela de Configurações nesse momento; não lê jogos, mensagens nem o que você digita.</small>
 </div>;
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
