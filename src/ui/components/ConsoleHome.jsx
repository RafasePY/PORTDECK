import React,{useEffect,useRef} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';

const duration=s=>{const t=Math.max(0,Number(s)||0);const h=Math.floor(t/3600),m=Math.floor((t%3600)/60);return h? h+'h '+String(m).padStart(2,'0')+'min':m+'min';};
const date=iso=>{if(!iso)return 'Ainda não jogado';const d=new Date(iso);return Number.isNaN(d.getTime())?'Ainda não jogado':d.toLocaleDateString('pt-BR');};
const cardAnim={type:'spring',stiffness:360,damping:30};
function GameTile({game,selected,src,onSelect,onContext}){
  const reduced=useReducedMotion();
  const timer=useRef(null),origin=useRef(null),longPressed=useRef(false);
  const cancel=()=>{if(timer.current)clearTimeout(timer.current);timer.current=null;origin.current=null;};
  useEffect(()=>cancel,[]);
  return <motion.button type="button" className={'console-tile'+(selected?' active':'')} aria-label={'Selecionar '+game.name} aria-pressed={selected} data-console-tile={game.id}
    onClick={e=>{if(longPressed.current){longPressed.current=false;e.preventDefault();return;}onSelect(game.id);}}
    onContextMenu={e=>{e.preventDefault();if(longPressed.current)return;cancel();onContext(game.id,e.clientX,e.clientY);}}
    onPointerDown={e=>{if(e.pointerType!=='touch')return;longPressed.current=false;origin.current={x:e.clientX,y:e.clientY};timer.current=setTimeout(()=>{longPressed.current=true;onContext(game.id,e.clientX,e.clientY);},560);}}
    onPointerMove={e=>{const a=origin.current;if(a&&Math.hypot(e.clientX-a.x,e.clientY-a.y)>12)cancel();}}
    onPointerUp={cancel} onPointerCancel={cancel}
    whileHover={reduced?{}:{y:-2}} whileTap={reduced?{}:{scale:.99}} transition={cardAnim}>
    <span className="console-tile-art">{src?<img src={src} alt="" draggable="false"/>:<span className="console-tile-fallback"><strong>{game.name.slice(0,2).toUpperCase()}</strong></span>}</span>
    <span className="console-tile-caption">{game.name}</span>
  </motion.button>;
}
export default function ConsoleHome({games,game,art,selected,onSelect,onPlay,onConfigure,onDetails,onAdd,onContext,onMenu,isAddSelected=false,onAddFocus,estimatedTime=false,zone='games',actionIndex=0,onZone,onAction}){
  const shelf=useRef(null),reduced=useReducedMotion();
  useEffect(()=>{
    const item=shelf.current?.querySelector(isAddSelected?'[data-console-add="true"]':'[data-console-tile].active');
    item?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest',inline:'center'});
  },[selected,isAddSelected]);
  const logo=game?.logo&&art[game.logo];
  const backdrop=game?.banner&&art[game.banner];
  const description=game?.description?.trim()||'';
  const act=(index,fn)=>{onZone('actions');onAction(index);fn();};
  return <div className="console-home">
    <section className="console-shelf" aria-label="Jogos cadastrados">
      <div className="console-shelf-scroll" ref={shelf}>
        {games.map(g=><GameTile key={g.id} game={g} selected={g.id===selected} src={g.cover&&art[g.cover]} onSelect={id=>{onZone('games');onSelect(id);}} onContext={onContext}/>)}
        <button data-console-add="true" className={'console-add'+(isAddSelected?' console-add-selected':'')} aria-pressed={isAddSelected} onFocus={()=>onAddFocus?.()} onClick={onAdd} title="Adicionar port" aria-label="Adicionar port"><span>+</span><small>Adicionar</small></button>
      </div>
      <div className="console-shelf-progress">{games.length?String(Math.max(1,games.findIndex(g=>g.id===selected)+1)).padStart(2,'0')+' / '+String(games.length).padStart(2,'0'):'BIBLIOTECA VAZIA'}</div>
    </section>
    <div className="console-stage">
      <AnimatePresence mode="wait">
        <motion.div className="console-story" key={game?.id||'empty'} initial={{opacity:0,y:reduced?0:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced?0:.18}}>
          <div className="console-eyebrow"><span className="console-led"/> {game?'SUA BIBLIOTECA':'PORTDECK PULSE'}</div>
          {game?(logo?<img className="console-game-logo" src={logo} alt={game.name}/>:<h1>{game.name}</h1>):<h1>Seu próximo jogo começa aqui.</h1>}
          {description?<p className="console-description">{description}</p>:!game?<p className="console-description">Adicione seu primeiro jogo para começar.</p>:null}
          {game&&<div className="console-metadata"><span>◷ {duration(game.playedSeconds)} {estimatedTime?'estimados':'jogadas'}</span><span>▦ Última sessão: {date(game.lastPlayed)}</span></div>}
          <div className="console-actions">
            <button className={'console-btn console-play'+(zone==='actions'&&actionIndex===0?' console-focused':'')} onFocus={()=>{onZone('actions');onAction(0);}} onClick={()=>act(0,game?onPlay:onAdd)}>
              <span className="console-triangle">▶</span>{game?'Jogar':'Adicionar jogo'}
            </button>
            {game&&<>
              <button className={'console-btn console-secondary'+(zone==='actions'&&actionIndex===1?' console-focused':'')} onFocus={()=>{onZone('actions');onAction(1);}} onClick={()=>act(1,onConfigure)}>⚙ Configurar</button>
              <button className={'console-btn console-secondary'+(zone==='actions'&&actionIndex===2?' console-focused':'')} onFocus={()=>{onZone('actions');onAction(2);}} onClick={e=>{onZone('actions');onAction(2);const r=e.currentTarget.getBoundingClientRect();onMenu(game.id,r.left,r.bottom+8);}}>••• Mais opções</button>
            </>}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
    <div className="console-hint">← → Escolher jogo　 ·　 ↓ Ações　 ·　 Start Opções</div>
  </div>;
}
