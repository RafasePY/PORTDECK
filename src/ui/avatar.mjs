export function cropRect(width,height,zoom=1,x=50,y=50){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('Imagem inválida.');
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||a));
 const side=Math.min(width,height)/clamp(zoom,1,3);
 return {sx:(width-side)*clamp(x,0,100)/100,sy:(height-side)*clamp(y,0,100)/100,side};
}
export const validPhoto=value=>typeof value==='string'&&value.length<=120000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
