// Sons de navegação próprios (sintetizados, nada copiado da Sony), estilo console: tick ao mover,
// tom subindo ao confirmar, descendo ao voltar e acorde curto ao abrir a central. Respeita "portdeck-sound".
let ctx;
export const soundEnabled=()=>{try{return localStorage.getItem('portdeck-sound')!=='off';}catch{return true;}};
const VOICES={
 move:[[1180,980,.018,0,.05,'sine']],
 select:[[520,780,.04,0,.16,'sine'],[780,1040,.022,.07,.18,'sine']],
 back:[[700,420,.032,0,.16,'sine']],
 open:[[392,392,.028,0,.42,'triangle'],[523,523,.022,.05,.42,'triangle'],[784,784,.016,.1,.45,'sine']],
 start:[[130,430,.085,0,.23,'triangle'],[260,600,.055,.13,.23,'triangle'],[525,840,.035,.24,.23,'triangle']]
};
export function playSound(kind,enabled=soundEnabled()){
 if(!enabled)return;
 try{
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  ctx||=new C();if(ctx.state==='suspended')ctx.resume();
  for(const [from,to,vol,delay,len,type] of VOICES[kind]||VOICES.select){
   const t=ctx.currentTime+delay,osc=ctx.createOscillator(),amp=ctx.createGain();
   osc.type=type;osc.frequency.setValueAtTime(from,t);if(to!==from)osc.frequency.exponentialRampToValueAtTime(to,t+len*.6);
   amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(vol,t+.012);amp.gain.exponentialRampToValueAtTime(.0001,t+len);
   osc.connect(amp).connect(ctx.destination);osc.start(t);osc.stop(t+len+.02);
  }
 }catch{}
}
