import React from 'react';
import{AnimatePresence,motion,useReducedMotion}from'motion/react';
import BrandMark from './BrandMark.jsx';

export default function IntroScreen({open,ready,onEnter,controller}){
 const reduce=useReducedMotion();
 const label=controller?.kind==='touch'?'TOQUE':controller?.kind==='keyboard'?'ENTER':controller?.confirm||'A';
 return <AnimatePresence>{open&&<motion.div className="pd-gate" initial={{opacity:1}} exit={{opacity:0,transition:{duration:reduce?.05:.48}}} onClick={onEnter}>
   <div className="pd-gate-aura" aria-hidden="true"/>
   <motion.div className="pd-gate-inner" initial={{y:30,opacity:0,scale:.87}} animate={{y:0,opacity:1,scale:1}} transition={{duration:reduce?.05:.8,ease:[.19,1,.22,1]}}>
     <div className="pd-gate-icon"><BrandMark large animated={!ready}/></div>
     <div className="pd-gate-brand">PORT<span>DECK</span></div>
     <div className="pd-gate-edition">PULSE · CONSOLE EDITION</div>
   </motion.div>
   <motion.div className="pd-gate-bottom" initial={{opacity:0}} animate={{opacity:ready?1:.18}} transition={{duration:.45}}>
     <div className="pd-gate-rule" />
     <button disabled={!ready} type="button" onClick={e=>{e.stopPropagation();onEnter();}}>{ready?(controller?.kind==='touch'?'TOQUE PARA INICIAR':'PRESSIONE '+label+' PARA INICIAR'):'INICIANDO PORTDECK...'}</button>
     {ready&&<span>ou Enter · Start + Select {controller?.kind==='keyboard'?'':'· Home, quando disponível'}</span>}
   </motion.div>
 </motion.div>}</AnimatePresence>;
}
