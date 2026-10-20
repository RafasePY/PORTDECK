import React,{useRef} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import BrandMark from './BrandMark.jsx';
function sonicLogo(){
 try{
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
 const ctx=new Audio();ctx.resume().then(()=>{
 [146.83,220,293.66,440].forEach((frequency,index)=>{
 const osc=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime+index*.085;
 osc.type='sine';osc.frequency.setValueAtTime(frequency,t);gain.gain.setValueAtTime(0,t);
 gain.gain.linearRampToValueAtTime(.035,t+.04);gain.gain.exponentialRampToValueAtTime(.0001,t+.85);
 osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+.9);
 });setTimeout(()=>ctx.close().catch(()=>{}),1600);
 }).catch(()=>ctx.close().catch(()=>{}));
 }catch{}
}
const readMuted=()=>{try{return localStorage.getItem('portdeck-sound')==='off';}catch{return false;}};
// Tela de entrada no estilo do PS4: marca no canto, boas-vindas no centro e espera o jogador apertar um botão.
export default function IntroScreen({open,ready,onEnter,controller,muted}){
 const reduced=useReducedMotion(),played=useRef(false);
 const silent=muted??readMuted();
 const proceed=()=>{if(!ready)return;if(!silent&&!played.current){played.current=true;sonicLogo();}onEnter();};
 const prompt=controller?.kind==='touch'?<>Toque na tela para começar.</>:controller?.kind==='keyboard'?<>Pressione <kbd>Enter</kbd> para começar.</>:<>Pressione <kbd>{controller?.confirm||'A'}</kbd> para usar o controle.</>;
 return <AnimatePresence>{open&&<motion.section className={'ps-welcome'+(reduced?' ps-still':'')} data-ready={ready?'true':'false'} onClick={proceed}
   initial={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?.05:.5}} aria-label="Boas-vindas do PortDeck">
  <div className="ps-welcome-beams" aria-hidden="true"><i/><i/><i/></div>
  <header className="ps-welcome-brand"><BrandMark animated={!reduced}/><span>PORT<b>DECK</b></span></header>
  <div className="ps-welcome-center">
   <h1>Bem-vindo de volta ao PortDeck</h1>
   <p className={ready?'on':''} aria-live="polite">{ready?prompt:'Preparando…'}</p>
  </div>
 </motion.section>}</AnimatePresence>;
}
