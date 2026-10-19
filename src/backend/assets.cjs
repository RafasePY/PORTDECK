'use strict';
// Importação local de arte dos jogos. Não altera nem apaga a imagem original.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const MAX_IMAGE_BYTES=12*1024*1024;
const validKinds=new Set(['cover','banner','logo']);
function imageType(buffer) {
  if(buffer.length>=8&&buffer.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')))return {ext:'png',mime:'image/png'};
  if(buffer.length>=3&&buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff)return {ext:'jpg',mime:'image/jpeg'};
  if(buffer.length>=12&&buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP')return {ext:'webp',mime:'image/webp'};
  throw new Error('Imagem inválida. Selecione um PNG, JPG ou WebP verdadeiro.');
}
function safeBuffer(file) {
  if(typeof file!=='string'||!file.trim())throw new Error('Caminho da imagem não informado.');
  let stat;
  try{stat=fs.statSync(file);}catch{throw new Error('A imagem não foi encontrada. Escolha o arquivo novamente.');}
  if(!stat.isFile())throw new Error('O caminho selecionado não é um arquivo.');
  if(stat.size===0)throw new Error('A imagem selecionada está vazia.');
  if(stat.size>MAX_IMAGE_BYTES)throw new Error('Imagem muito grande. Limite: 12 MB.');
  const bytes=fs.readFileSync(file);
  const kind=imageType(bytes);
  return{bytes,...kind};
}
class AssetStore {
  constructor(root){this.root=path.join(root,'assets');fs.mkdirSync(this.root,{recursive:true});}
  import(gameId,kind,source) {
    if(typeof gameId!=='string'||!/^[\w-]{1,70}$/.test(gameId))throw new Error('Identificador de jogo inválido.');
    if(!validKinds.has(kind))throw new Error('Tipo de arte inválido.');
    const {bytes,ext}=safeBuffer(source);
    const digest=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16);
    const folder=path.join(this.root,gameId);
    fs.mkdirSync(folder,{recursive:true});
    const target=path.join(folder,kind+'-'+digest+'.'+ext);
    if(!fs.existsSync(target)){
      const temp=path.join(folder,'.import-'+crypto.randomUUID()+'.tmp');
      try{fs.writeFileSync(temp,bytes,{flag:'wx'});fs.renameSync(temp,target);}
      finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
    }
    return target;
  }
  read(file){const {bytes,mime}=safeBuffer(file);return 'data:'+mime+';base64,'+bytes.toString('base64');}
}
module.exports={AssetStore,imageType,safeBuffer,MAX_IMAGE_BYTES};
