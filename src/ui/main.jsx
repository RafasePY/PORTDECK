import React,{useCallback,useEffect,useRef,useState} from 'react';
import{createRoot}from'react-dom/client';
import{AnimatePresence,motion,useReducedMotion}from'motion/react';
import './style.css';
import ConsoleHome from './components/ConsoleHome.jsx';
import GameContextMenu from './components/GameContextMenu.jsx';
import CloseGameOverlay from './components/CloseGameOverlay.jsx';
import BrandMark from './components/BrandMark.jsx';
import IntroScreen from './components/IntroScreen.jsx';
import{identifyController,comboCommand}from'./input/controller.mjs';

const api=window.portdeck;
const $time=s=>{const n=Math.max(0,Number(s)||0),h=Math.floor(n/3600),m=Math.floor((n%3600)/60);return h? h+'h '+String(m).padStart(2,'0')+'min':m+'min';};
const seconds=g=>g?.playedSeconds||0;
const sortGames=xs=>[...xs].sort((a,b)=>(Date.parse(b.lastPlayed||'')||0)-(Date.parse(a.lastPlayed||'')||0));
const defaultSound=()=>localStorage.getItem('portdeck-sound')!=='off';
let audioContext;
function sound(kind,enabled){
  if(!enabled)return;
  try{
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)return;
    audioContext||=new C();
    if(audioContext.state==='suspended')audioContext.resume();
    const notes=kind==='start'?[[130,430,.085,0],[260,600,.055,.13],[525,840,.035,.24]]:kind==='move'?[[420,620,.026,0]]:kind==='back'?[[650,330,.03,0]]:[[425,860,.048,0],[790,1110,.021,.06]];
    for(const [low,high,vol,delay]of notes){
      const now=audioContext.currentTime+delay,osc=audioContext.createOscillator(),amp=audioContext.createGain();
      osc.type=kind==='start'?'triangle':'sine';osc.frequency.setValueAtTime(low,now);
      osc.frequency.exponentialRampToValueAtTime(high,now+.15);
      amp.gain.setValueAtTime(.0001,now);amp.gain.exponentialRampToValueAtTime(vol,now+.018);
      amp.gain.exponentialRampToValueAtTime(.0001,now+.23);
      osc.connect(amp).connect(audioContext.destination);osc.start(now);osc.stop(now+.25);
    }
  }catch{}
}
const Icon=({name,size=20})=>{
  const common={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true};
  const shapes={
    play:<path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none"/>,
    gear:<><circle cx="12" cy="12" r="3"/><path d="M10 2h4l.7 2.6 2.2 1.2 2.6-.8 2 3.4-1.9 1.9v2.5l1.9 1.9-2 3.4-2.6-.8-2.2 1.2L14 22h-4l-.7-2.6-2.2-1.2-2.6.8-2-3.4 1.9-1.9v-2.5L2.5 9.3l2-3.4 2.6.8 2.2-1.2z"/></>,
    add:<path d="M12 5v14M5 12h14"/>,
    chevron:<path d="m9 18 6-6-6-6"/>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
    volume:<><path d="M3 10h4l5-4v12l-5-4H3zM16 9q4 3 0 6"/></>,
    mute:<><path d="M3 10h4l5-4v12l-5-4H3zM17 9l5 6m0-6-5 6"/></>,
    back:<path d="m15 18-6-6 6-6"/>,
    library:<><path d="M4 5h16v14H4zM9 5v14M15 5v14"/></>,
    controller:<><path d="M7 8h10c2 0 3 2 4 7 .5 3-2 4-4 2l-2-2H9l-2 2c-2 2-4.5 1-4-2 1-5 2-7 4-7zM7 11v4m-2-2h4M17 11h.01M19 13h.01"/></>,
    fullscreen:<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
    x:<path d="M5 5l14 14M19 5 5 19"/>,
    image:<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="1"/><path d="m3 16 5-5 4 4 3-3 6 5"/></>,
    edit:<path d="M14 5 19 10 9 20H4v-5L14 5zM12 7l5 5"/>,
    power:<path d="M12 2v10m-6-7a9 9 0 1 0 12 0"/>
  };
  return <svg {...common}>{shapes[name]||shapes.play}</svg>;
};
function Cover({game,art,active,onClick,compact=false}){
  const photo=game.cover&&art[game.cover];
  return <motion.button type="button" layout="position" whileHover={{y:-8,scale:1.035}} whileTap={{scale:.96}} transition={{type:'spring',stiffness:350,damping:27}} onClick={onClick}
    className={'game-tile'+(active?' chosen':'')+(compact?' compact':'')} aria-label={'Selecionar '+game.name} aria-pressed={active}>
    <div className="tile-visual">{photo?<img src={photo} alt="" loading="lazy"/>:<div className="tile-placeholder"><span className="fake-orbit"/><strong>{game.name.slice(0,2).toUpperCase()}</strong></div>}
      <div className="tile-overlay"/>{active&&<span className="tile-active">SELECIONADO</span>}
    </div><div className="tile-meta"><strong>{game.name}</strong><small>{$time(seconds(game))}</small></div>
  </motion.button>;
}
const ImagePicker=({label,value,onChange,onSelect,preview,error})=><label className="field"><span>{label}</span><div className="browse-line"><input value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Selecione PNG, JPG ou WebP"/><button type="button" className="thin-btn" onClick={onSelect}>Procurar</button></div>{preview?<div className="art-preview"><img src={preview} alt={'Prévia de '+label}/><small>Imagem carregada</small></div>:<div className="art-preview missing"><span>{value?'A imagem não foi carregada. Importe novamente se necessário.':'Nenhuma imagem importada'}</span></div>}{error&&<small className="art-error">{error}</small>}</label>;
function EditModal({game,art,onClose,onSave,onDelete,onLaunch,onBrowse,onImage}){
  const [form,setForm]=useState({...game});
  const [localPreviews,setLocalPreviews]=useState({}),[imageErrors,setImageErrors]=useState({});
  const pickArt=async kind=>{
    try{
      const asset=await onImage(kind);
      if(!asset)return;
      put(kind,asset.path);
      setLocalPreviews(p=>({...p,[kind]:asset.preview}));
      setImageErrors(p=>({...p,[kind]:''}));
    }catch(e){setImageErrors(p=>({...p,[kind]:e?.message||String(e)}));}
  };
  const put=(field,value)=>setForm(v=>({...v,[field]:value}));
  useEffect(()=>{setForm({...game});setLocalPreviews({});setImageErrors({});},[game.id]);
  return <motion.div className="modal-shade" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <motion.div className="editor" initial={{opacity:0,y:40,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:.97}} transition={{type:'spring',damping:26,stiffness:270}} role="dialog" aria-modal="true" aria-label="Configurar jogo">
      <header className="editor-head"><div><small>PERFIL DO JOGO</small><h2>{game.name}</h2></div><button className="ghost-icon" onClick={onClose} aria-label="Fechar"><Icon name="x"/></button></header>
      <form onSubmit={e=>{e.preventDefault();onSave(form);}}>
        <label className="field"><span>Nome do jogo</span><input required value={form.name||''} onChange={e=>put('name',e.target.value)}/></label>
        <label className="field"><span>Executável principal (.exe)</span><div className="browse-line"><input required value={form.exe||''} onChange={e=>put('exe',e.target.value)}/><button type="button" className="thin-btn" onClick={async()=>{const s=await onBrowse();if(s)put('exe',s);}}>Procurar</button></div></label>
        <label className="field"><span>Executável direto para Jogar</span><div className="browse-line"><input value={form.directExe||''} onChange={e=>put('directExe',e.target.value)} placeholder="Ex.: Play God of War III.exe"/><button type="button" className="thin-btn" onClick={async()=>{const s=await onBrowse();if(s)put('directExe',s);}}>Procurar</button></div><small>Se disponível, pula a tela inicial do port. Deixe vazio para usar o executável principal.</small></label>
        <button className="open-launcher" type="button" onClick={onLaunch}>Abrir configurador original ↗</button>
        <div className="two-fields"><label className="field"><span>Parâmetros de execução</span><input value={form.args||''} onChange={e=>put('args',e.target.value)}/></label><label className="field"><span>FPS de referência</span><input value={form.fps||''} onChange={e=>put('fps',e.target.value)} placeholder="Informativo"/></label></div>
        <label className="field"><span>Diretório de trabalho</span><input value={form.cwd||''} onChange={e=>put('cwd',e.target.value)}/></label>
        <label className="field"><span>Executável de configuração (opcional)</span><input value={form.config||''} onChange={e=>put('config',e.target.value)}/></label>
        <div className="art-fields">
          <ImagePicker label="Capa vertical" value={form.cover} onChange={v=>put('cover',v)} onSelect={()=>pickArt('cover')} preview={localPreviews.cover||art[form.cover]} error={imageErrors.cover}/>
          <ImagePicker label="Banner de fundo (16:9)" value={form.banner} onChange={v=>put('banner',v)} onSelect={()=>pickArt('banner')} preview={localPreviews.banner||art[form.banner]} error={imageErrors.banner}/>
          <ImagePicker label="Logotipo transparente" value={form.logo} onChange={v=>put('logo',v)} onSelect={()=>pickArt('logo')} preview={localPreviews.logo||art[form.logo]} error={imageErrors.logo}/>
        </div>
        <footer className="editor-actions"><button type="button" className="delete" onClick={onDelete}>Remover da biblioteca</button><div><button type="button" className="thin-btn" onClick={onClose}>Cancelar</button><button className="action-primary" type="submit">Salvar perfil</button></div></footer>
      </form>
    </motion.div>
  </motion.div>;
}
function App(){
  const reduced=useReducedMotion(),[menu,setMenu]=useState(null),[closing,setClosing]=useState(null),[focusZone,setFocusZone]=useState('games'),[actionIndex,setActionIndex]=useState(0),[clock,setClock]=useState(new Date()),[games,setGames]=useState([]),[selected,setSelected]=useState(''),[view,setView]=useState('home'),[editing,setEditing]=useState(null),[running,setRunning]=useState([]),[art,setArt]=useState({}),[muted,setMuted]=useState(!defaultSound()),[intro,setIntro]=useState(true),[introReady,setIntroReady]=useState(false),[query,setQuery]=useState(''),[toast,setToast]=useState(''),[pad,setPad]=useState('');
  const gamesRef=useRef(games),stateRef=useRef({}),assetRequests=useRef(new Map()),lastPad=useRef(''),lastPadAt=useRef(0),toastTimeout=useRef(null),selectArea=useRef(null);
  const game=games.find(g=>g.id===selected)||games[0],focusedId=game?.id;
  const contextGame=games.find(g=>g.id===menu?.id);
  const closingGame=games.find(g=>g.id===closing?.id);
  const currentArt=game&&(art[game.banner]||art[game.cover]);
  const titleArt=game&&art[game.logo];
  const enabled=!muted;
  const controller=identifyController(pad);
  useEffect(()=>{if(!api?.onHome)return;return api.onHome(()=>{setMenu(null);setEditing(null);setView('home');setFocusZone('games');announce('PortDeck · Início (Start + Select)');});},[]);
  const enterConsole=useCallback(()=>{if(!stateRef.current.introReady)return;setIntro(false);sound('select',stateRef.current.enabled);},[]);
  useEffect(()=>{const timer=setInterval(()=>setClock(new Date()),30000);return()=>clearInterval(timer);},[]);
  const announce=useCallback(message=>{setToast(message);clearTimeout(toastTimeout.current);toastTimeout.current=setTimeout(()=>setToast(''),4200);},[]);
  const fail=useCallback(e=>announce('⚠ '+(e?.message||String(e))),[announce]);
  const reload=useCallback(async()=>{if(api)try{setGames(sortGames(await api.list()));}catch(e){fail(e);}},[fail]);
  useEffect(()=>{gamesRef.current=games;if(games.length&&!games.some(g=>g.id===selected))setSelected(games[0].id);},[games,selected]);
  useEffect(()=>{if(!api)return;reload();api.running().then(setRunning).catch(fail);const off=api.onLibrary(g=>setGames(sortGames(g)));const offRun=api.onRunning(ids=>setRunning(ids));return()=>{off();offRun();};},[reload,fail]);
  useEffect(()=>{
    // Reassocia cada efeito à promessa em voo: mudança na biblioteca não pode perder a arte.
    if(!api)return;
    let active=true;
    for(const g of games)for(const kind of ['cover','banner','logo']){
      const file=g[kind];
      if(!file||art[file])continue;
      let pending=assetRequests.current.get(file);
      if(!pending){
        pending=api.loadCover(file).then(src=>{
          if(!src)throw new Error('Imagem indisponível');
          return src;
        }).catch(error=>{
          assetRequests.current.delete(file);throw error;
        });
        assetRequests.current.set(file,pending);
      }
      pending.then(src=>{
        if(active)setArt(old=>old[file]?old:{...old,[file]:src});
      }).catch(()=>{/* A interface exibe orientação para importar novamente. */});
    }
    return()=>{active=false;};
  },[games]);
  const choose=useCallback((id)=>{if(!id)return;setSelected(id);sound('move',enabled);},[enabled]);
  const jump=useCallback(delta=>{const all=gamesRef.current;const old=stateRef.current.selected;const n=all.findIndex(g=>g.id===old);if(all.length){const next=all[(Math.max(0,n)+delta+all.length)%all.length];setSelected(next.id);sound('move',stateRef.current.enabled);}},[]);
  const play=useCallback(async(id)=>{const target=id||stateRef.current.selected;if(!target)return;sound('select',stateRef.current.enabled);try{if(!api)return announce('Prévia: execução disponível no PortDeck instalado.');await api.play(target);const found=gamesRef.current.find(g=>g.id===target);announce('Iniciando '+(found?.name||'jogo')+'...');}catch(e){fail(e);}},[announce,fail]);
  const add=useCallback(async()=>{if(!api)return announce('Execute o PortDeck para adicionar jogos.');try{const g=await api.add();if(g){await reload();setSelected(g.id);setEditing(g);}}catch(e){fail(e);}},[announce,reload,fail]);
  const openEditor=useCallback(id=>{const target=gamesRef.current.find(g=>g.id===id);if(target){setEditing(target);sound('select',stateRef.current.enabled);}},[]);
  const openMenu=useCallback((id,x,y)=>{
    if(!gamesRef.current.some(g=>g.id===id))return;
    setSelected(id);setFocusZone('games');setMenu({id,x,y});
    sound('select',stateRef.current.enabled);
  },[]);
  const closeMenu=useCallback(()=>setMenu(null),[]);
  const openFolder=useCallback(async id=>{
    try{await api?.openFolder(id);}
    catch(e){fail(e);}
  },[fail]);
  const openLauncher=useCallback(async id=>{
    try{if(!api)throw new Error('Abra esta função no PortDeck instalado.');await api.configure(id);announce('Abrindo launcher original...');}
    catch(e){fail(e);}
  },[fail,announce]);
  const beginClose=useCallback(id=>{setMenu(null);setClosing({id,phase:'confirm'});},[]);
  const requestClose=useCallback(async(force=false)=>{
    const c=stateRef.current.closing;
    if(!c)return;
    const id=c.id;
    setClosing({id,phase:'closing'});
    try{if(!api?.stop)throw new Error('O encerramento não está disponível nesta compilação.');await api.stop(id,force);}
    catch(e){setClosing({id,phase:'force'});fail(e);}
  },[fail]);
  useEffect(()=>{
    if(!closing||closing.phase!=='closing')return;
    if(!running.includes(closing.id)){
      const t=setTimeout(()=>{setClosing(current=>current?.id===closing.id?null:current);announce('Jogo encerrado.');},550);
      return()=>clearTimeout(t);
    }
    const timer=setTimeout(()=>setClosing(current=>current?.id===closing.id&&current.phase==='closing'?{...current,phase:'force'}:current),6500);
    return()=>clearTimeout(timer);
  },[closing,running,announce]);
  const activate=useCallback(()=>{
    const s=stateRef.current;
    if(s.view==='library'){setView('detail');return;}
    if(s.view==='detail'){s.play();return;}
    if(s.focusZone==='games'){setFocusZone('actions');setActionIndex(0);sound('select',s.enabled);return;}
    if(s.actionIndex===0)s.play();
    else if(s.actionIndex===1)s.openEditor(s.selected);
    else document.querySelector('.console-actions .console-btn:nth-child(3)')?.click();
  },[]);
  stateRef.current={selected:focusedId,enabled,view,editing,play,jump,openEditor,openMenu,notify:announce,muted,intro,introReady,menu,closing,focusZone,actionIndex,activate};
  useEffect(()=>{const t=setTimeout(()=>{setIntroReady(true);sound('start',stateRef.current.enabled);},reduced?180:1150);return()=>clearTimeout(t);},[reduced]);
  useEffect(()=>{const el=document.querySelector('[data-selected="true"]');if(el)el.scrollIntoView({behavior:reduced?'instant':'smooth',inline:'center',block:'nearest'});},[focusedId,view,reduced]);
  useEffect(()=>{
    const listener=e=>{
      const st=stateRef.current;
      if(st.intro){if(['Enter',' ','Home'].includes(e.key)){e.preventDefault();if(st.introReady){setIntro(false);sound('select',st.enabled);}}return;}
      if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='h'&&!st.closing){
        e.preventDefault();setEditing(null);setMenu(null);setView('home');setFocusZone('games');st.notify('PortDeck · Início');return;
      }
      if(e.key==='F11'){e.preventDefault();api?.toggleFullscreen();return;}
      if(st.closing){if(e.key==='Escape'&&st.closing.phase!=='closing'){e.preventDefault();setClosing(null);}return;}
      if(st.menu){
        if(e.key==='Escape'){e.preventDefault();closeMenu();return;}
        if(['ArrowDown','ArrowUp'].includes(e.key)){
          e.preventDefault();
          const buttons=[...document.querySelectorAll('.game-context-menu [role="menuitem"]')];
          const i=buttons.indexOf(document.activeElement);
          buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();
        }else if(e.key==='Enter'){
          e.preventDefault();
          (document.activeElement?.matches?.('.game-context-menu [role="menuitem"]')?document.activeElement:document.querySelector('.game-context-menu [role="menuitem"]'))?.click();
        }
        return;
      }
      if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){
        e.preventDefault();
        if(st.selected){const tile=document.querySelector('.console-tile.active');const rect=tile?.getBoundingClientRect();st.openMenu(st.selected,rect?.left||180,(rect?.bottom||120)+8);}
        return;
      }
      if(st.editing){if(e.key==='Escape'){setEditing(null);sound('back',st.enabled);}return;}
      if(e.target?.closest?.('input,textarea,select,[role="menu"]'))return;
      if(e.key==='ArrowDown'&&st.view==='home'){e.preventDefault();setFocusZone('actions');setActionIndex(0);sound('move',st.enabled);}
      else if(e.key==='ArrowUp'&&st.view==='home'){e.preventDefault();setFocusZone('games');sound('move',st.enabled);}
      else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
        e.preventDefault();
        if(st.view==='home'&&st.focusZone==='actions'){
          const count=gamesRef.current.length?3:1;
          setActionIndex(i=>(i+(e.key==='ArrowLeft'?-1:1)+count)%count);
          sound('move',st.enabled);
        }else st.jump(e.key==='ArrowLeft'?-1:1);
      }
      else if(e.key==='Enter'){e.preventDefault();st.activate();}
      else if(e.key==='F2'){e.preventDefault();st.openEditor(st.selected);}
      else if(e.key==='Escape'){if(st.view!=='home'){setView('home');setFocusZone('games');sound('back',st.enabled);}}
    };
    window.addEventListener('keydown',listener);
    return()=>window.removeEventListener('keydown',listener);
  },[]);
  useEffect(()=>{
    if(intro||editing||menu||closing||view!=='home')return;
    const selector=focusZone==='games'?'.console-tile.active':'.console-actions .console-btn:nth-child('+(actionIndex+1)+')';
    const button=document.querySelector(selector);
    if(button&&button!==document.activeElement)button.focus({preventScroll:true});
  },[intro,editing,menu,closing,view,focusZone,actionIndex,focusedId]);
  useEffect(()=>{
    let frame,prior='',stamp=0;
    const poll=()=>{
      const st=stateRef.current;
      const pads=navigator.getGamepads?.()||[];
      const pad=[...pads].find(x=>x?.connected);
      const name=pad?.id||'';
      if(name!==lastPad.current){
        const previous=lastPad.current;lastPad.current=name;setPad(name);
        if(name)st.notify('Controle conectado: '+identifyController(name).label);
        else if(previous)st.notify('Controle desconectado');
      }
      if(pad){
        const down=n=>Boolean(pad.buttons[n]?.pressed);
        // Standard mapping: centro 16. Alguns drivers e Steam Input podem ocultar esse botão.
        const cmd=comboCommand(pad.buttons,pad.axes);
        if(st.intro){
          if(st.introReady&&['home','home-combo','menu','accept'].includes(cmd)){setIntro(false);sound('select',st.enabled);prior='';}
        }else{
          const now=performance.now(),canRepeat=['left','right','up','down'].includes(cmd);
          if(cmd&&(cmd!==prior||(canRepeat&&now-stamp>240))){
            stamp=now;
            if((cmd==='home-combo'||cmd==='home')&&st.closing?.phase!=='closing'){
              setMenu(null);setEditing(null);setClosing(null);setView('home');setFocusZone('games');
              st.notify('Início · PortDeck');sound('select',st.enabled);
            }
            else if(st.closing){
              if(cmd==='back'&&st.closing.phase!=='closing')setClosing(null);
              else if(cmd==='accept'&&st.closing.phase==='confirm')document.querySelector('.game-close-primary')?.click();
              else if(cmd==='accept'&&st.closing.phase==='force')document.querySelector('.game-close-force')?.click();
            }
            else if(st.menu){
              if(cmd==='back'||cmd==='menu')setMenu(null);
              else if(cmd==='down'||cmd==='up'){
                const buttons=[...document.querySelectorAll('.game-context-menu [role="menuitem"]')];
                const i=buttons.indexOf(document.activeElement);
                buttons[(i+(cmd==='down'?1:-1)+buttons.length)%buttons.length]?.focus();
              }
              else if(cmd==='accept')document.activeElement?.matches?.('.game-context-menu [role="menuitem"]')&&document.activeElement.click();
            }
            else if(st.editing){if(cmd==='back')setEditing(null);}
            else if(cmd==='menu'&&st.view==='home'&&st.selected){
              const tile=document.querySelector('.console-tile.active');
              const rect=tile?.getBoundingClientRect();st.openMenu(st.selected,rect?.left||180,(rect?.bottom||120)+8);
            }
            else if(cmd==='back'){setView('home');setFocusZone('games');sound('back',st.enabled);}
            else if(cmd==='edit')st.openEditor(st.selected);
            else if(cmd==='options'&&st.view==='home'){setFocusZone('actions');setActionIndex(2);document.querySelector('.console-actions .console-btn:nth-child(3)')?.click();}
            else if(cmd==='up'&&st.view==='home'){setFocusZone('games');sound('move',st.enabled);}
            else if(cmd==='down'&&st.view==='home'){setFocusZone('actions');setActionIndex(0);sound('move',st.enabled);}
            else if(cmd==='left'||cmd==='right'){
              if(st.view==='home'&&st.focusZone==='actions'){
                const count=gamesRef.current.length?3:1;
                setActionIndex(i=>(i+(cmd==='left'?-1:1)+count)%count);sound('move',st.enabled);
              }else st.jump(cmd==='left'?-1:1);
            }
            else if(cmd==='accept')st.activate();
            else if(cmd==='areaLeft'){setView('home');setFocusZone('games');}
            else if(cmd==='areaRight')setView('library');
          }
          prior=cmd;
        }
      }else prior='';
      frame=requestAnimationFrame(poll);
    };
    frame=requestAnimationFrame(poll);
    return()=>cancelAnimationFrame(frame);
  },[]);
  const save=async values=>{if(!api)return;try{await api.update(values);setEditing(null);await reload();announce('Perfil atualizado.');}catch(e){fail(e);}};
  const remove=async()=>{if(!editing||!api)return;if(!window.confirm('Remover '+editing.name+' da biblioteca? Os arquivos do jogo serão preservados.'))return;try{await api.remove(editing.id);setEditing(null);await reload();announce('Jogo removido da biblioteca.');}catch(e){fail(e);}};
  const launch=async()=>{if(!editing||!api)return;try{await api.configure(editing.id);announce('Abrindo configurador...');}catch(e){fail(e);}};
  const filtered=games.filter(g=>g.name.toLowerCase().includes(query.toLowerCase()));
  const reveal=(target)=>{setView(target);sound('select',enabled);};
  const handleSound=()=>{setMuted(!muted);localStorage.setItem('portdeck-sound',muted?'on':'off');if(muted)sound('select',true);};
  const subtitle=running.includes(focusedId)?'EM EXECUÇÃO':'PRONTO PARA JOGAR';
  const spring={type:'spring',stiffness:290,damping:33};
  return <div className="shell">
    <AnimatePresence mode="sync"><motion.div key={game?.id||'empty'} className={'wallpaper'+(!currentArt?' no-art':'')} initial={{opacity:0,scale:1.025}} animate={{opacity:1,scale:1}} exit={{opacity:0,transition:{duration:reduced?.01:.35}}} transition={{duration:reduced?.01:.5}} style={currentArt?{backgroundImage:'url("'+currentArt+'")'}:{}}/></AnimatePresence><div className="vignette"/><div className="ambient-noise"/>
    <div className="layout">
      <header className="header"><button className="branding" onClick={()=>reveal('home')}><BrandMark/><span className="wordmark">PORT<span>DECK</span></span><em>PULSE</em></button><nav><button className={view==='home'?'on':''} onClick={()=>reveal('home')}>Início</button><button className={view==='library'?'on':''} onClick={()=>reveal('library')}>Biblioteca</button></nav><div className="head-right">
        <span className={'pad-status pad-'+controller.kind}><Icon name="controller" size={19}/>{controller.label}</span>
        <span className="console-user"><span className="console-user-avatar">P</span> Jogador</span><time className="console-clock">{clock.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</time>
        <button className="head-icon" title={muted?'Ativar efeitos sonoros':'Silenciar efeitos sonoros'} onClick={handleSound}><Icon name={muted?'mute':'volume'}/></button>
        <button className="head-icon" title="Tela cheia (F11)" onClick={()=>api?.toggleFullscreen()}><Icon name="fullscreen"/></button>
        <button className="head-icon close-app" title="Sair do PortDeck" onClick={()=>api?.closeWindow?.()}><Icon name="power"/></button>
      </div></header>
      <main>
        <AnimatePresence mode="wait">
          {view==='home'&&<motion.div key="home" className="home-console-view" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?.01:.22}}>
            <ConsoleHome games={games} game={game} art={art} selected={focusedId} zone={focusZone} actionIndex={actionIndex} onZone={setFocusZone} onAction={setActionIndex} onSelect={choose} onPlay={()=>play(focusedId)} onConfigure={()=>openEditor(focusedId)} onDetails={()=>setView('detail')} onAdd={add} onContext={openMenu} onMenu={openMenu}/>
          </motion.div>}
          {view==='detail'&&<motion.div key="detail" className="detail" initial={{opacity:0,x:70}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}} transition={spring}>
            <button className="breadcrumb" onClick={()=>reveal('home')}><Icon name="back"/> Voltar à biblioteca</button>
            <div className="detail-content"><div className="eyebrow"><span className="signal"/> DETALHES DO JOGO</div>
              {titleArt?<img className="hero-logo" src={titleArt} alt={game?.name||''}/>:<h1>{game?.name}</h1>}
              <p>Última sessão: {game?.lastPlayed?new Date(game.lastPlayed).toLocaleDateString('pt-BR'):'ainda não jogado'}</p><div className="stats"><span>{$time(seconds(game))} jogadas</span><span>Port para Windows</span></div>
              <div className="hero-actions"><button className="action-primary play-cta" onClick={()=>play(game?.id)}><Icon name="play"/> JOGAR</button><button className="action-secondary" onClick={()=>openEditor(game?.id)}><Icon name="gear"/> CONFIGURAR</button></div>
              <div className="tip"><Icon name="image"/> Personalize a capa, o banner e o logotipo em Configurar para transformar esta página.</div>
            </div>
          </motion.div>}
          {view==='library'&&<motion.div key="library" className="library" initial={{opacity:0,x:65}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-35}} transition={{duration:.36}}>
            <div className="library-title"><div><div className="eyebrow">TODOS OS SEUS PORTS</div><h1>Biblioteca <span>{games.length}</span></h1></div><button className="action-primary" onClick={add}><Icon name="add" size={18}/> ADICIONAR</button></div>
            <label className="search"><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar jogos..." autoComplete="off"/></label>
            <div className="grid">{filtered.map(g=><Cover key={g.id} game={g} art={art} compact active={g.id===focusedId} onClick={()=>{choose(g.id);setView('detail');}}/>)}</div>
            {!filtered.length&&<div className="no-results">{games.length?'Nenhum jogo encontrado.':'Sua biblioteca ainda está vazia.'}</div>}
          </motion.div>}
        </AnimatePresence>
      </main>
      <footer className="statusbar"><div><span className="keycap">{controller.confirm}</span> Selecionar <span className="keycap">{controller.back}</span> Voltar <span className="keycap">{controller.options}</span> Opções <span className="keycap">Start + Select</span> Início</div><small>{games.length?String(games.length).padStart(2,'0')+' JOGO'+(games.length!==1?'S':''):'BIBLIOTECA VAZIA'} · PORTDECK PULSE</small></footer>
    </div>
    <AnimatePresence>{menu&&contextGame&&<GameContextMenu key={menu.id} game={contextGame} position={menu} running={running.includes(menu.id)} onClose={closeMenu} onPlay={()=>play(menu.id)} onLauncher={()=>openLauncher(menu.id)} onEdit={()=>openEditor(menu.id)} onFolder={()=>openFolder(menu.id)} onStop={()=>beginClose(menu.id)} onDetails={()=>setView('detail')}/>}</AnimatePresence>
    <AnimatePresence>{closing&&closingGame&&<CloseGameOverlay key={closing.id} game={closingGame} phase={closing.phase} onCancel={()=>setClosing(null)} onRequest={()=>requestClose(false)} onForce={()=>requestClose(true)}/>}</AnimatePresence>
    <AnimatePresence>{editing&&<EditModal key={editing.id} game={editing} art={art} onClose={()=>setEditing(null)} onSave={save} onDelete={remove} onLaunch={launch} onBrowse={()=>api?.chooseExecutable?.()} onImage={kind=>api?.importArt?.(editing.id,kind)}/>}</AnimatePresence>
    <AnimatePresence>{toast&&<motion.div className="toast" initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} exit={{opacity:0,y:16}} role="status">{toast}</motion.div>}</AnimatePresence>
    <IntroScreen open={intro} ready={introReady} onEnter={enterConsole} controller={controller}/>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
