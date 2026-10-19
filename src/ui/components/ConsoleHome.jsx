import React,{useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';

const duration=s=>{const t=Math.max(0,Number(s)||0);const h=Math.floor(t/3600),m=Math.floor((t%3600)/60);return h? h+'h '+String(m).padStart(2,'0')+'min':m+'min';};
const date=iso=>{if(!iso)return 'Ainda não jogado';const d=new Date(iso);return Number.isNaN(d.getTime())?'Ainda não jogado':d.toLocaleDateString('pt-BR');};
const cardAnim={type:'spring',stiffness:360,damping:30};
function GameTile({game,selected,src,onSelect,onContext}){
  return <motion.button type="button" className={'console-tile'+(selected?' active':'')} aria-label={'Selecionar '+game.name} aria-pressed={selected} data-console-tile={game.id} onClick={()=>onSelect(game.id)} onContextMenu={e=>{e.preventDefault();onContext(game.id,e.clientX,e.clientY);}}
    whileHover={{scale:1.055,y:-4}} whileTap={{scale:.97}} transition={cardAnim}>
    <span className="console-tile-art">{src?<img src={src} alt="" draggable="false"/>:<span className="console-tile-fallback"><strong>{game.name.slice(0,2).toUpperCase()}</strong></span>}</span>
    <span className="console-tile-caption">{game.name}</span>
  </motion.button>;
}
export default function ConsoleHome({games,game,art,selected,onSelect,onPlay,onConfigure,onDetails,onAdd,onContext,onMenu,zone='games',actionIndex=0,onZone,onAction}){
  const shelf=useRef(null);
  useEffect(()=>{
    const item=shelf.current?.querySelector('[data-console-tile].active');
    item?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest',inline:'center'});
  },[selected]);
  const logo=game?.logo&&art[game.logo];
  const backdrop=game?.banner&&art[game.banner];
  const description=game?.description?.trim()||'';
  const act=(index,fn)=>{onZone('actions');onAction(index);fn();};
  return <div className="console-home">
    <section className="console-shelf" aria-label="Jogos cadastrados">
      <div className="console-shelf-scroll" ref={shelf}>
        {games.map(g=><GameTile key={g.id} game={g} selected={g.id===selected} src={g.cover&&art[g.cover]} onSelect={id=>{onZone('games');onSelect(id);}} onContext={onContext}/>)}
        <button className="console-add" onClick={onAdd} title="Adicionar port" aria-label="Adicionar port"><span>+</span><small>Adicionar</small></button>
      </div>
      <div className="console-shelf-progress">{games.length?String(Math.max(1,games.findIndex(g=>g.id===selected)+1)).padStart(2,'0')+' / '+String(games.length).padStart(2,'0'):'BIBLIOTECA VAZIA'}</div>
    </section>
    <div className="console-stage">
      <AnimatePresence mode="wait">
        <motion.div className="console-story" key={game?.id||'empty'} initial={{opacity:0,x:-28,filter:'blur(8px)'}} animate={{opacity:1,x:0,filter:'blur(0px)'}} exit={{opacity:0,x:-14}} transition={{duration:.33}}>
          <div className="console-eyebrow"><span className="console-led"/> {game?'DETALHES DO JOGO':'PORTDECK PULSE'}</div>
          {game?(logo?<img className="console-game-logo" src={logo} alt={game.name}/>:<h1>{game.name}</h1>):<h1>Seu próximo jogo começa aqui.</h1>}
          {description?<p className="console-description">{description}</p>:!game?<p className="console-description">Adicione seu primeiro jogo para começar.</p>:null}
          {game&&<div className="console-metadata"><span>◷ {duration(game.playedSeconds)} jogadas</span><span>▦ Última sessão: {date(game.lastPlayed)}</span></div>}
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
