// Entrada padronizada do navegador; não captura botões globais do Windows.
export function identifyController(id=''){
  const raw=String(id||'');
  const value=raw.toLowerCase();
  if(!value)return{kind:'keyboard',label:'Teclado e mouse',confirm:'Enter',back:'Esc',options:'F2'};
  if(/8bitdo|8 bitdo|8-bitdo|2dc8/i.test(value))return{kind:'8bitdo',label:readModel(raw,'8BitDo'),confirm:'A',back:'B',options:'Start'};
  if(/dualsense|dualshock|playstation|wireless controller|054c/i.test(value))return{kind:'playstation',label:/dualsense|0ce6|0df2/i.test(value)?'DualSense':/dualshock|09cc|05c4/i.test(value)?'DualShock 4':'Controle PlayStation',confirm:'✕',back:'○',options:'Options'};
  if(/xbox/i.test(value))return{kind:'xbox',label:/360/i.test(value)?'Xbox 360':'Controle Xbox',confirm:'A',back:'B',options:'Menu'};
  if(/xinput/i.test(value))return{kind:'xinput',label:'Controle XInput',confirm:'A',back:'B',options:'Start'};
  if(/nintendo|switch|pro controller/i.test(value))return{kind:'nintendo',label:'Controle Nintendo',confirm:'A',back:'B',options:'+'};
  return{kind:'generic',label:'Controle conectado',confirm:'A',back:'B',options:'Start'};
}
function readModel(raw,fallback){
  const t=raw.replace(/\(.*?\)|\bstandard gamepad\b/gi,'').trim();
  return t.length>40?fallback:t||fallback;
}
export function isStartSelectPressed(buttons){
  // Mapeamento Gamepad API: Select/Back = 8; Start/Menu = 9.
  return Boolean(buttons?.[8]?.pressed&&buttons?.[9]?.pressed);
}
export function comboCommand(buttons,axes=[]){
  if(isStartSelectPressed(buttons))return'home-combo'; // prioridade sobre Start isolado
  if(buttons?.[16]?.pressed)return'home';
  if(buttons?.[9]?.pressed)return'menu';
  const h=axes[0]||0,v=axes[1]||0;
  return buttons?.[12]?.pressed||v<-.65?'up':
    buttons?.[13]?.pressed||v>.65?'down':
    buttons?.[14]?.pressed||h<-.65?'left':
    buttons?.[15]?.pressed||h>.65?'right':
    buttons?.[0]?.pressed?'accept':
    buttons?.[1]?.pressed?'back':
    buttons?.[2]?.pressed?'edit':
    buttons?.[3]?.pressed?'options':
    buttons?.[4]?.pressed?'areaLeft':
    buttons?.[5]?.pressed?'areaRight':'';
}
