import React,{useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import BrandMark from './BrandMark.jsx';
const AUTO_MS=3900,AUTO_REDUCED_MS=500;
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
export default function IntroScreen({open,ready,onEnter,controller,muted:externalMuted,onToggleSound}){
 const reduced=useReducedMotion(),enter=useRef(onEnter),played=useRef(false),leaving=useRef(false);
 const [localMuted,setLocalMuted]=useState(()=>{try{return localStorage.getItem('portdeck-sound')==='off';}catch{return false;}});
 const muted=externalMuted??localMuted;
 enter.current=onEnter;
 useEffect(()=>{if(!open||!ready)return;leaving.current=false;const timer=setTimeout(()=>{leaving.current=true;enter.current();},reduced?AUTO_REDUCED_MS:AUTO_MS);return()=>clearTimeout(timer);},[open,ready,reduced]);
 const proceed=()=>{if(!ready||leaving.current)return;leaving.current=true;if(!muted&&!played.current){played.current=true;sonicLogo();}enter.current();};
 const toggle=()=>{if(onToggleSound){onToggleSound();return;}const next=!localMuted;setLocalMuted(next);try{localStorage.setItem('portdeck-sound',next?'off':'on');}catch{}if(!next)sonicLogo();};
 return <AnimatePresence>{open&&<motion.section className={'portal-intro'+(reduced?' portal-still':'')} initial={{opacity:1}} exit={{opacity:0,scale:reduced?1:1.035}} transition={{duration:reduced?.05:.45}} aria-label="Abertura do PortDeck">
 <div className="portal-atmosphere" aria-hidden="true"/><div className="portal-plane" aria-hidden="true"/>
 <div className="portal-reveal"><div className="portal-light" aria-hidden="true"/><BrandMark large animated={!reduced}/>
 <div className="portal-title">PORT<span>DECK</span></div><div className="portal-tagline">SEU MUNDO. SEU JOGO.</div></div>
 <div className="portal-intro-controls"><button type="button" onClick={toggle} aria-pressed={!muted}>{muted?'Som desligado':'Som ligado'}</button><button type="button" disabled={!ready} onClick={proceed}>{ready?'Pular abertura':'Preparando…'} <span aria-hidden="true">›</span></button></div>
 <div className="portal-intro-progress" aria-hidden="true">{ready&&<i style={{animationDuration:AUTO_MS+'ms'}}/>}</div>
 </motion.section>}</AnimatePresence>;
}
