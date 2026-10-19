import React,{useCallback,useEffect,useRef,useState} from 'react';
import{createRoot}from'react-dom/client';
import{AnimatePresence,motion,useReducedMotion}from'motion/react';
import './style.css';

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
function Boot({leave,onSkip,reduced}){
  return <AnimatePresence>{!leave&&<motion.div key="boot" className="boot" initial={{opacity:1}} exit={{opacity:0,transition:{duration:reduced?.2:.7}}} onClick={onSkip}>
    <div className="boot-rays"/><motion.div className="boot-logo" initial={{opacity:0,scale:.55,rotate:-25,filter:'blur(12px)'}} animate={{opacity:1,scale:1,rotate:0,filter:'blur(0px)'}} transition={{duration:reduced?.2:1.1,type:'spring',bounce:.24}}>
      <span className="mark large"><i/></span><span className="wordmark">PORT<span>DECK</span></span>
      <small>UM PORTAL PARA SEUS JOGOS</small>
    </motion.div><div className="boot-line"/><div className="boot-hint">PRESSIONE QUALQUER BOTÃO PARA CONTINUAR</div>
  </motion.div>}</AnimatePresence>;
}
function Cover({game,art,active,onClick,compact=false}){
  const photo=game.cover&&art[game.cover];
  return <motion.button type="button" layout="position" whileHover={{y:-8,scale:1.035}} whileTap={{scale:.96}} transition={{type:'spring',stiffness:350,damping:27}} onClick={onClick}
    className={'game-tile'+(active?' chosen':'')+(compact?' compact':'')} aria-label={'Selecionar '+game.name} aria-pressed={active}>
    <div className="tile-visual">{photo?<img src={photo} alt="" loading="lazy"/>:<div className="tile-placeholder"><span className="fake-orbit"/><strong>{game.name.slice(0,2).toUpperCase()}</strong></div>}
      <div className="tile-overlay"/>{active&&<span className="tile-active">SELECIONADO</span>}
    </div><div className="tile-meta"><strong>{game.name}</strong><small>{$time(seconds(game))}</small></div>
  </motion.button>;
}
const ImagePicker=({label,value,onChange,onSelect})=><label className="field"><span>{label}</span><div className="browse-line"><input value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Selecione PNG, JPG ou WebP"/><button type="button" className="thin-btn" onClick={onSelect}>Procurar</button></div></label>;
function EditModal({game,onClose,onSave,onDelete,onLaunch,onBrowse,onImage}){
  const [form,setForm]=useState({...game});
  const put=(field,value)=>setForm(v=>({...v,[field]:value}));
  useEffect(()=>{setForm({...game});},[game.id]);
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
        <div className="art-fields"><ImagePicker label="Capa vertical" value={form.cover} onChange={v=>put('cover',v)} onSelect={async()=>{const s=await onImage();if(s)put('cover',s);}}/><ImagePicker label="Banner de fundo (16:9)" value={form.banner} onChange={v=>put('banner',v)} onSelect={async()=>{const s=await onImage();if(s)put('banner',s);}}/><ImagePicker label="Logotipo transparente" value={form.logo} onChange={v=>put('logo',v)} onSelect={async()=>{const s=await onImage();if(s)put('logo',s);}}/></div>
        <footer className="editor-actions"><button type="button" className="delete" onClick={onDelete}>Remover da biblioteca</button><div><button type="button" className="thin-btn" onClick={onClose}>Cancelar</button><button className="action-primary" type="submit">Salvar perfil</button></div></footer>
      </form>
    </motion.div>
  </motion.div>;
}
function App(){
  const reduced=useReducedMotion(),[games,setGames]=useState([]),[selected,setSelected]=useState(''),[view,setView]=useState('home'),[editing,setEditing]=useState(null),[running,setRunning]=useState([]),[art,setArt]=useState({}),[muted,setMuted]=useState(!defaultSound()),[intro,setIntro]=useState(true),[query,setQuery]=useState(''),[toast,setToast]=useState(''),[pad,setPad]=useState('');
  const gamesRef=useRef(games),stateRef=useRef({}),seen=useRef(new Set()),lastPad=useRef(''),lastPadAt=useRef(0),toastTimeout=useRef(null),selectArea=useRef(null);
  const game=games.find(g=>g.id===selected)||games[0],focusedId=game?.id;
  const currentArt=game&&(art[game.banner]||art[game.cover]);
  const titleArt=game&&art[game.logo];
  const enabled=!muted;
  const announce=useCallback(message=>{setToast(message);clearTimeout(toastTimeout.current);toastTimeout.current=setTimeout(()=>setToast(''),4200);},[]);
  const fail=useCallback(e=>announce('⚠ '+(e?.message||String(e))),[announce]);
  const reload=useCallback(async()=>{if(api)try{setGames(sortGames(await api.list()));}catch(e){fail(e);}},[fail]);
  useEffect(()=>{gamesRef.current=games;if(games.length&&!games.some(g=>g.id===selected))setSelected(games[0].id);},[games,selected]);
  useEffect(()=>{if(!api)return;reload();api.running().then(setRunning).catch(fail);const off=api.onLibrary(g=>setGames(sortGames(g)));const offRun=api.onRunning(ids=>setRunning(ids));return()=>{off();offRun();};},[reload,fail]);
  useEffect(()=>{let alive=true;for(const g of games)for(const key of ['cover','banner','logo']){const file=g[key];if(!file||seen.current.has(file))continue;seen.current.add(file);api?.loadCover(file).then(src=>{if(src&&alive)setArt(old=>({...old,[file]:src}));}).catch(()=>{});}return()=>{alive=false;};},[games]);
  const choose=useCallback((id)=>{if(!id)return;setSelected(id);sound('move',enabled);},[enabled]);
  const jump=useCallback(delta=>{const all=gamesRef.current;const old=stateRef.current.selected;const n=all.findIndex(g=>g.id===old);if(all.length){const next=all[(Math.max(0,n)+delta+all.length)%all.length];setSelected(next.id);sound('move',stateRef.current.enabled);}},[]);
  const play=useCallback(async(id)=>{const target=id||stateRef.current.selected;if(!target)return;sound('select',stateRef.current.enabled);try{if(!api)return announce('Prévia: execução disponível no PortDeck instalado.');await api.play(target);const found=gamesRef.current.find(g=>g.id===target);announce('Iniciando '+(found?.name||'jogo')+'...');}catch(e){fail(e);}},[announce,fail]);
  const add=useCallback(async()=>{if(!api)return announce('Execute o PortDeck para adicionar jogos.');try{const g=await api.add();if(g){await reload();setSelected(g.id);setEditing(g);}}catch(e){fail(e);}},[announce,reload,fail]);
  const openEditor=useCallback(id=>{const target=gamesRef.current.find(g=>g.id===id);if(target){setEditing(target);sound('select',stateRef.current.enabled);}},[]);
  stateRef.current={selected:focusedId,enabled,view,editing,play,jump,openEditor,muted,intro};
  useEffect(()=>{if(!intro)return;const t=setTimeout(()=>{setIntro(false);sound('start',enabled);},reduced?200:1850);return()=>clearTimeout(t);},[intro,reduced,enabled]);
  useEffect(()=>{const el=document.querySelector('[data-selected="true"]');if(el)el.scrollIntoView({behavior:reduced?'instant':'smooth',inline:'center',block:'nearest'});},[focusedId,view,reduced]);
  useEffect(()=>{const listener=e=>{const s=stateRef.current;if(s.intro){setIntro(false);e.preventDefault();return;}if(e.key==='F11'){e.preventDefault();api?.toggleFullscreen();return;}if(s.editing){if(e.key==='Escape'){setEditing(null);sound('back',s.enabled);}return;}if(e.target.closest?.('input,textarea,select'))return;if(e.key==='ArrowLeft'){e.preventDefault();s.jump(-1);}else if(e.key==='ArrowRight'){e.preventDefault();s.jump(1);}else if(e.key==='Enter'){e.preventDefault();s.play();}else if(e.key==='F2'){e.preventDefault();s.openEditor(s.selected);}else if(e.key==='Escape'){if(s.view==='detail'||s.view==='library'){setView('home');sound('back',s.enabled);}}};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener);},[]);
  useEffect(()=>{let frame,prior='',stamp=0;const poll=()=>{
    const s=stateRef.current;const pads=navigator.getGamepads?.()||[];const p=[...pads].find(x=>x?.connected);const name=p?.id||'';if(name!==lastPad.current){lastPad.current=name;setPad(name);}
    if(p&&!s.intro){const down=n=>p.buttons[n]?.pressed;const h=p.axes[0]||0;let cmd=down(14)||h<-.65?'left':down(15)||h>.65?'right':down(0)?'accept':down(1)?'back':down(2)?'edit':down(4)?'home':down(5)?'library':'';
      const now=performance.now();if(cmd&&(cmd!==prior||(cmd==='left'||cmd==='right')&&now-stamp>230)){stamp=now;if(!s.editing){if(cmd==='left')s.jump(-1);if(cmd==='right')s.jump(1);if(cmd==='accept')s.play();if(cmd==='edit')s.openEditor(s.selected);if(cmd==='home')setView('home');if(cmd==='library')setView('library');if(cmd==='back')setView('home');}else if(cmd==='back')setEditing(null);}
      prior=cmd;
    }else prior='';
    frame=requestAnimationFrame(poll);
  };frame=requestAnimationFrame(poll);return()=>cancelAnimationFrame(frame);},[]);
  const save=async values=>{if(!api)return;try{await api.update(values);setEditing(null);await reload();announce('Perfil atualizado.');}catch(e){fail(e);}};
  const remove=async()=>{if(!editing||!api)return;if(!window.confirm('Remover '+editing.name+' da biblioteca? Os arquivos do jogo serão preservados.'))return;try{await api.remove(editing.id);setEditing(null);await reload();announce('Jogo removido da biblioteca.');}catch(e){fail(e);}};
  const launch=async()=>{if(!editing||!api)return;try{await api.configure(editing.id);announce('Abrindo configurador...');}catch(e){fail(e);}};
  const filtered=games.filter(g=>g.name.toLowerCase().includes(query.toLowerCase()));
  const reveal=(target)=>{setView(target);sound('select',enabled);};
  const handleSound=()=>{setMuted(!muted);localStorage.setItem('portdeck-sound',muted?'on':'off');if(muted)sound('select',true);};
  const subtitle=running.includes(focusedId)?'EM EXECUÇÃO':'PRONTO PARA JOGAR';
  const spring={type:'spring',stiffness:290,damping:33};
  return <div className="shell">
    <AnimatePresence mode="wait"><motion.div key={game?.id||'empty'} className={'wallpaper'+(!currentArt?' no-art':'')} initial={{opacity:0,scale:1.085}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:reduced?.03:.55}} style={currentArt?{backgroundImage:'url("'+currentArt+'")'}:{}}/></AnimatePresence><div className="vignette"/><div className="ambient-noise"/>
    <div className="layout">
      <header className="header"><button className="branding" onClick={()=>reveal('home')}><span className="mark"><i/></span><span className="wordmark">PORT<span>DECK</span></span><em>PULSE</em></button><nav><button className={view==='home'?'on':''} onClick={()=>reveal('home')}>Início</button><button className={view==='library'?'on':''} onClick={()=>reveal('library')}>Biblioteca</button></nav><div className="head-right">
        <span className="pad-status"><Icon name="controller" size={19}/>{pad?( /8bitdo/i.test(pad)?'8BitDo':/xbox|xinput/i.test(pad)?'Xbox':/dualsense|dualshock|playstation/i.test(pad)?'PlayStation':'Controle conectado'):'Teclado / mouse'}</span>
        <button className="head-icon" title={muted?'Ativar efeitos sonoros':'Silenciar efeitos sonoros'} onClick={handleSound}><Icon name={muted?'mute':'volume'}/></button>
        <button className="head-icon" title="Tela cheia (F11)" onClick={()=>api?.toggleFullscreen()}><Icon name="fullscreen"/></button>
        <button className="head-icon close-app" title="Sair do PortDeck" onClick={()=>api?.closeWindow?.()}><Icon name="power"/></button>
      </div></header>
      <main>
        <AnimatePresence mode="wait">
          {view==='home'&&<motion.div key="home" className="home" initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-18}} transition={{duration:reduced?.05:.33}}>
            <section className="hero-content">
              <motion.div key={focusedId||'intro'} initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:reduced?.01:.45}}>
                <div className="eyebrow"><span className="signal"/> {subtitle} <span className="subline">/ SUA BIBLIOTECA</span></div>
                {titleArt?<img className="hero-logo" src={titleArt} alt={game.name}/>:<h1>{game?.name||'O jogo começa aqui.'}</h1>}
                <p>{game?'Seu jogo. Suas configurações. Um botão para começar.':'Adicione seu primeiro port e transforme sua biblioteca em um universo de jogos.'}</p>
                {game&&<div className="stats"><span><Icon name="controller" size={17}/> PC PORT</span><span>{$time(seconds(game))} jogadas</span>{game.fps&&<span>{game.fps} FPS de referência</span>}</div>}
                <div className="hero-actions"><button className="action-primary play-cta" onClick={()=>game?play(game.id):add()}><Icon name={game?'play':'add'} size={22}/>{game?'JOGAR AGORA':'ADICIONAR JOGO'}</button>{game&&<button className="action-secondary" onClick={()=>reveal('detail')}>Ver detalhes <Icon name="chevron" size={17}/></button>}</div>
              </motion.div>
            </section>
            <section className="continue"><div className="section-title"><div><span>CONTINUE SUA AVENTURA</span><h2>Seus jogos <em>{games.length}</em></h2></div><button className="section-add" onClick={add}><Icon name="add" size={18}/> Adicionar port</button></div>
              {games.length?<div className="covers" ref={selectArea}>{games.map(g=><div key={g.id} data-selected={g.id===focusedId}><Cover game={g} art={art} active={g.id===focusedId} onClick={()=>{if(g.id!==focusedId)choose(g.id);else reveal('detail');}}/></div>)}</div>:<button className="empty" onClick={add}><Icon name="add" size={28}/><span>Adicione seu primeiro jogo</span><small>Clique ou pressione A para escolher um arquivo .exe</small></button>}
            </section>
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
      <footer className="statusbar"><div><span className="keycap">{pad?'A':'Enter'}</span> Jogar <span className="keycap">{pad?'X':'F2'}</span> Configurar <span className="keycap">←</span><span className="keycap">→</span> Navegar</div><small>{games.length?String(games.length).padStart(2,'0')+' JOGO'+(games.length!==1?'S':''):'BIBLIOTECA VAZIA'} · PORTDECK PULSE</small></footer>
    </div>
    <AnimatePresence>{editing&&<EditModal key={editing.id} game={editing} onClose={()=>setEditing(null)} onSave={save} onDelete={remove} onLaunch={launch} onBrowse={()=>api?.chooseExecutable?.()} onImage={()=>api?.chooseCover?.()}/>}</AnimatePresence>
    <AnimatePresence>{toast&&<motion.div className="toast" initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} exit={{opacity:0,y:16}} role="status">{toast}</motion.div>}</AnimatePresence>
    <Boot leave={!intro} onSkip={()=>setIntro(false)} reduced={reduced}/>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
