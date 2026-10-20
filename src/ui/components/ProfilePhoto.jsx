import React,{useEffect,useRef,useState} from 'react';
import {cropRect} from '../avatar.mjs';
export default function ProfilePhoto({onChange,onError,photo}){
 const [source,setSource]=useState(null),[crop,setCrop]=useState({zoom:1,x:50,y:50}),[busy,setBusy]=useState(false);
 const canvas=useRef(null),request=useRef(0),input=useRef(null);
 useEffect(()=>()=>{request.current++;},[]);
 useEffect(()=>{
 if(!source||!canvas.current)return;
 const ctx=canvas.current.getContext('2d'),r=cropRect(source.width,source.height,crop.zoom,crop.x,crop.y);
 ctx.fillStyle='#102a4a';ctx.fillRect(0,0,256,256);ctx.drawImage(source,r.sx,r.sy,r.side,r.side,0,0,256,256);
 },[source,crop]);
 const pick=async file=>{
 if(!file)return;
 const token=++request.current;setBusy(true);
 try{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Escolha uma foto JPG, PNG ou WebP.');
 if(file.size>12*1024*1024)throw Error('Escolha uma imagem de até 12 MB.');
 const url=URL.createObjectURL(file);
 try{
 const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Não foi possível abrir esta imagem.'));i.src=url;});
 if(token!==request.current)return;
 if(img.naturalWidth*img.naturalHeight>40000000)throw Error('A imagem é muito grande. Escolha uma versão menor.');
 setSource(img);setCrop({zoom:1,x:50,y:50});onError('');
 }finally{URL.revokeObjectURL(url);}
 }catch(e){if(token===request.current)onError(e.message);}
 finally{if(token===request.current)setBusy(false);}
 };
 const apply=()=>{
 try{const data=canvas.current.toDataURL('image/jpeg',.84);if(data.length>120000)throw Error('Não foi possível reduzir a foto. Tente outra imagem.');onChange(data);setSource(null);onError('');}catch(e){onError(e.message);}
 };
 return <div className="profile-photo-editor">
 <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{pick(e.target.files?.[0]);e.target.value='';}}/>
 <div className="photo-actions"><button type="button" disabled={busy} onClick={()=>input.current.click()}>{busy?'Abrindo foto…':photo?'Trocar foto':'Adicionar foto'}</button>{photo&&<button type="button" onClick={()=>{setSource(null);onChange('');}}>Remover foto</button>}</div>
 {source&&<div className="photo-crop"><canvas ref={canvas} width="256" height="256" aria-label="Prévia do enquadramento da foto"/>
 <div>{[['zoom','Zoom',1,3,.05],['x','Horizontal',0,100,1],['y','Vertical',0,100,1]].map(([id,label,min,max,step])=><label key={id}>{label}<input type="range" min={min} max={max} step={step} value={crop[id]} onChange={e=>setCrop({...crop,[id]:Number(e.target.value)})}/></label>)}
 <div className="photo-actions"><button type="button" onClick={()=>setSource(null)}>Cancelar corte</button><button type="button" onClick={apply}>Usar foto</button></div><small>Depois, salve o perfil para guardar a alteração.</small></div></div>}
 </div>;
}
