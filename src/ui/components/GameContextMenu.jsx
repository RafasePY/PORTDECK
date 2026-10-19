import React,{useEffect,useRef} from 'react';
import{motion}from'motion/react';

// Menu contextual independente dos arquivos do jogo. Pressionar Start/Options ou clique direito.
export default function GameContextMenu({game,running,position,onClose,onPlay,onLauncher,onEdit,onFolder,onStop,onDetails}){
  const ref=useRef(null);
  const left=Math.max(14,Math.min(position.x||200,window.innerWidth-335));
  const top=Math.max(75,Math.min(position.y||120,window.innerHeight-430));
  useEffect(()=>{
    ref.current?.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
    const listener=e=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}
    };
    window.addEventListener('keydown',listener,true);
    return()=>window.removeEventListener('keydown',listener,true);
  },[game.id,onClose]);
  function choose(fn){onClose();fn();}
  const actions=[
    {label:'Jogar',hint:'Iniciar perfil salvo',run:onPlay},
    {label:'Abrir launcher original',hint:'Configurações do port',run:onLauncher},
    {label:'Gerenciar arquivos do jogo',hint:'Abrir pasta no Explorador',run:onFolder},
    {label:'Gerenciar conteúdo',hint:'Arquivos e mods do port',run:onFolder},
    {label:'Editar perfil e artes',hint:'Capa, banner e executáveis',run:onEdit},
    {label:'Informações do jogo',hint:'Tempo de jogo e última sessão',run:onDetails}
  ];
  if(running)actions.push({label:'Fechar jogo',hint:'Solicitar encerramento do processo',run:onStop,danger:true});
  return <motion.div className="game-menu-shade" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onPointerDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <motion.div role="menu" ref={ref} className="game-context-menu" aria-label={'Opções de '+game.name}
      style={{left,top}} initial={{opacity:0,scale:.97,y:-8}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.97}} transition={{duration:.16}}
      onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();e.stopPropagation();const buttons=[...ref.current.querySelectorAll('button:not(:disabled)')];const i=buttons.indexOf(document.activeElement);buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}}}>
      <div className="game-menu-title">{game.name}<small>OPÇÕES DO JOGO</small></div>
      {actions.map(a=><button key={a.label} role="menuitem" type="button" className={a.danger?'game-menu-danger':''} onClick={()=>choose(a.run)}><span>{a.label}</span><small>{a.hint}</small></button>)}
      <div className="game-menu-foot">B / Esc: voltar · Start: opções</div>
    </motion.div>
  </motion.div>;
}
