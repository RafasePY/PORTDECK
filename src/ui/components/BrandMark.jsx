import React from 'react';
/** PORTDECK CORE — símbolo proprietário de portal/caminho. Ícone vetorial escalável, sem mídia de terceiros. */
export default function BrandMark({large=false,animated=false}){
 return <svg className={'portdeck-core'+(large?' portdeck-core-large':'')+(animated?' portdeck-core-animating':'')} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
 <defs>
   <linearGradient id="pdcore" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#D9FFFD"/><stop offset=".47" stopColor="#69DAD1"/><stop offset="1" stopColor="#7598CB"/></linearGradient>
   <linearGradient id="pdcut" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#112735"/><stop offset="1" stopColor="#06111F"/></linearGradient>
 </defs>
 <path d="M27 6 H63 C77 6 87 16 87 30 V63 C87 77 77 87 63 87 H28 C14 87 7 77 7 63 V27 C7 14 14 6 27 6Z" fill="url(#pdcore)" />
 <path d="M32 18H61C69 18 75 24 75 32V60C75 68 69 75 61 75H32C24 75 19 69 19 61V32C19 24 24 18 32 18Z" fill="url(#pdcut)"/>
 <path d="M34 63 V34 L60 26 V47 L34 55" fill="none" stroke="#9BF5E8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
 <circle cx="64" cy="69" r="8" fill="#B7FDFF"/>
 {animated&&<circle className="core-arc" cx="50" cy="50" r="47" stroke="#96F6EE" strokeWidth="3" strokeDasharray="23 272" fill="none" strokeLinecap="round"/>}
 </svg>;
}
