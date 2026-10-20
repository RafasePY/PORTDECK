export const PROFILE_KEY='portdeck-player-profiles-v1';
export const THEMES={ocean:{name:'Oceano',color:'#1674dc'},violet:{name:'Violeta',color:'#7059c9'},midnight:{name:'Meia-noite',color:'#334565'},forest:{name:'Floresta',color:'#23796f'}};
export const AVATARS=['◈','✦','◉','△','◎','⬡'];
export const defaults=()=>({version:1,activeId:'player-1',profiles:[{id:'player-1',name:'Jogador',avatar:'◈',theme:'ocean'}]});
export function normalize(value){
 if(value?.version!==1||!Array.isArray(value.profiles))throw Error('Formato de perfis inválido.');
 const seen=new Set();
 const profiles=value.profiles.slice(0,12).filter(p=>p&&typeof p.id==='string'&&p.id.length<100&&!seen.has(p.id)&&(seen.add(p.id),true)).map(p=>({
 id:p.id,name:typeof p.name==='string'&&p.name.trim()?p.name.trim().slice(0,24):'Jogador',
 avatar:AVATARS.includes(p.avatar)?p.avatar:AVATARS[0],theme:Object.hasOwn(THEMES,p.theme)?p.theme:'ocean'
 }));
 if(!profiles.length)throw Error('Nenhum perfil válido.');
 return {version:1,activeId:profiles.some(p=>p.id===value.activeId)?value.activeId:profiles[0].id,profiles};
}
export function readProfiles(storage){
 const raw=storage.getItem(PROFILE_KEY);
 return raw?normalize(JSON.parse(raw)):defaults();
}
export function writeProfiles(storage,value){
 const safe=normalize(value);storage.setItem(PROFILE_KEY,JSON.stringify(safe));return safe;
}
