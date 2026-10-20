const fs=require('node:fs'),path=require('node:path');
const root=path.resolve('android'),base=path.join(root,'app/src/main');
const java=path.join(base,'java/com/portdeck/pulse/preview');fs.mkdirSync(java,{recursive:true});
for(const name of ['MainActivity.java','PortDeckNativePlugin.java','PortDeckPlatformPlugin.java'])
  fs.copyFileSync(path.join('android-source',name),path.join(java,name));
const manifestPath=path.join(base,'AndroidManifest.xml');
let manifest=fs.readFileSync(manifestPath,'utf8');
if(!manifest.includes('android.intent.action.CREATE_SHORTCUT')){
 const queries='<queries>\n'+
 '  <intent><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent>\n'+
 '  <intent><action android:name="android.intent.action.CREATE_SHORTCUT"/></intent>\n'+
 '</queries>';
 if(manifest.includes('<queries>'))throw Error('Atualize as queries do AndroidManifest.xml manualmente.');
 manifest=manifest.replace('<application',queries+'\n    <application');
}
// A declaração HOME torna o app elegível, mas NUNCA o configura como padrão.
if(!manifest.includes('android.intent.category.HOME')){
 const closing=manifest.indexOf('</activity>');
 if(closing<0)throw Error('MainActivity não foi encontrada no manifesto Capacitor.');
 const homeFilter='\n      <intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.HOME"/><category android:name="android.intent.category.DEFAULT"/></intent-filter>\n    ';
 manifest=manifest.slice(0,closing)+homeFilter+manifest.slice(closing);
}
fs.writeFileSync(manifestPath,manifest);
console.log('PortDeck Android: integração de atividades e criadores de atalhos configurada.');
