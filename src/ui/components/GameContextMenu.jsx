import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import{motion}from'motion/react';

const GAP=10,MARGIN=14,WIDTH=340;
// Menu ao lado da capa, como no PS5: ancorado no jogo selecionado; sem capa visível, no ponto do clique.
function placement(gameId,position,height){
  const tile=gameId&&document.querySelector(`[data-console-tile="${CSS.escape(gameId)}"]`);
  const r=tile?.getBoundingClientRect();
  const vw=window.innerWidth,vh=window.innerHeight;
  if(r&&r.width&&r.right>0&&r.left<vw){
    let left=r.right+GAP;
    if(left+WIDTH>vw-MARGIN)left=r.left-GAP-WIDTH;
    if(left<MARGIN)left=Math.max(MARGIN,Math.min(vw-WIDTH-MARGIN,r.left+r.width/2-WIDTH/2));
    return {left,top:Math.max(MARGIN,Math.min(r.top,vh-height-MARGIN))};
  }
  return {left:Math.max(MARGIN,Math.min(position?.x??200,vw-WIDTH-MARGIN)),top:Math.max(MARGIN,Math.min(position?.y??120,vh-height-MARGIN))};
}

export function TileMenu({gameId,label,position,items,onClose,className=''}){
  const ref=useRef(null),close=useRef(onClose),[spot,setSpot]=useState(null);
  close.current=onClose;
  useLayoutEffect(()=>{setSpot(placement(gameId,position,ref.current?.offsetHeight||320));},[gameId,position?.x,position?.y,items.length]);
  useEffect(()=>{
    ref.current?.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
    const listener=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current();}};
    const reposition=()=>setSpot(placement(gameId,position,ref.current?.offsetHeight||320));
    // A capa selecionada cresce com animação; realinha quando ela termina.
    const settle=setTimeout(reposition,520);
    window.addEventListener('keydown',listener,true);window.addEventListener('resize',reposition);
    return()=>{clearTimeout(settle);window.removeEventListener('keydown',listener,true);window.removeEventListener('resize',reposition);};
  },[gameId]);
  return <motion.div className="game-menu-shade" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onPointerDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <motion.div role="menu" ref={ref} className={'game-context-menu '+className} aria-label={label}
      style={spot?{left:spot.left,top:spot.top}:{left:-9999,top:0}} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-6}} transition={{duration:.14}}
      onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();e.stopPropagation();const buttons=[...ref.current.querySelectorAll('button:not(:disabled)')];const i=buttons.indexOf(document.activeElement);buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}}}>
      {items.map(a=><button key={a.label} role="menuitem" type="button" className={a.danger?'game-menu-danger':''} onClick={()=>{onClose();a.run();}}>{a.label}</button>)}
    </motion.div>
  </motion.div>;
}

// Menu contextual independente dos arquivos do jogo. Pressionar Start/Options ou clique direito.
export default function GameContextMenu({game,running,position,onClose,onPlay,onLauncher,onEdit,onFolder,onStop,onDetails}){
  const items=[
    {label:'Jogar',run:onPlay},
    {label:'Abrir launcher original',run:onLauncher},
    {label:'Gerenciar arquivos do jogo',run:onFolder},
    {label:'Editar perfil e artes',run:onEdit},
    {label:'Informações',run:onDetails}
  ];
  if(running)items.push({label:'Fechar jogo',run:onStop,danger:true});
  return <TileMenu gameId={game.id} label={'Opções de '+game.name} position={position} items={items} onClose={onClose}/>;
}
