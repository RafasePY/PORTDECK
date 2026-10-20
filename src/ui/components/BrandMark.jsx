import React,{useId} from 'react';
/** Original PD monogram: a portal, a shared stem and two open paths. */
export default function BrandMark({large=false,animated=false}){
 const id=useId().replace(/:/g,'');
 return <svg className={'portdeck-core portal-mark'+(large?' portdeck-core-large':'')+(animated?' portal-draw':'')} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
 <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#effaff"/><stop offset=".48" stopColor="#9ad9ff"/><stop offset="1" stopColor="#5a8cff"/></linearGradient></defs>
 <path className="portal-depth" d="M30 98V22h30c25 0 39 15 39 38s-14 38-39 38H49" fill="none" stroke="#3664ad" strokeWidth="9" strokeLinejoin="round" transform="translate(3 3)"/>
 <path className="portal-outer" pathLength="1" d="M27 96V20h30c25 0 39 15 39 38S82 96 57 96H46" fill="none" stroke={'url(#'+id+')'} strokeWidth="6" strokeLinecap="square"/>
 <path className="portal-inner" pathLength="1" d="M46 79V39h12c13 0 19 7 19 17s-6 17-19 17H46" fill="none" stroke="#e5f5ff" strokeWidth="6"/>
 <path className="portal-horizon" pathLength="1" d="M12 108h96" stroke="#9fd5ff" strokeWidth="1" opacity=".45"/>
 </svg>;
}
