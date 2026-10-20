import React from 'react';
export const layoutFromDevice=(device,override)=>override&&override!=='auto'?override:(device?.kind||'touch');
const keyMap={
  xbox:{accept:'A',back:'B',options:'≡',home:'⊞'},
  xinput:{accept:'A',back:'B',options:'≡',home:'⊞'},
  '8bitdo':{accept:'A',back:'B',options:'≡',home:'⌂'},
  nintendo:{accept:'A',back:'B',options:'+',home:'⌂'},
  playstation:{accept:'✕',back:'○',options:'OPTIONS',home:'⌂'},
  generic:{accept:'A',back:'B',options:'≡',home:'⌂'},
  keyboard:{accept:'↵',back:'Esc',options:'F2',home:'⌂'},
  touch:{accept:'☝',back:'↶',options:'⋯',home:'⌂'}
};
export function ButtonGlyph({layout,action}){
 const k=keyMap[layout]||keyMap.generic;
 return <span className={'pd-glyph pd-glyph-'+layout+' pd-glyph-'+action} aria-label={k[action]}>{k[action]}</span>;
}
export default function ControlHints({layout}){
 if(layout==='touch')return <div className="ad-hint-set ad-hint-touch"><span><ButtonGlyph layout={layout} action="accept"/> Toque: selecionar</span><span><ButtonGlyph layout={layout} action="options"/> Segurar: opções</span><span><ButtonGlyph layout={layout} action="home"/> Início</span></div>;
 return <div className="ad-hint-set"><span><ButtonGlyph layout={layout} action="accept"/> Selecionar</span><span><ButtonGlyph layout={layout} action="back"/> Voltar</span><span><ButtonGlyph layout={layout} action="options"/> Opções</span><span><span className="pd-combo">Start + Select</span> Início</span></div>;
}
