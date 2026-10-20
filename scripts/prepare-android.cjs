const fs=require('node:fs'),path=require('node:path');
const root=path.resolve('android'),base=path.join(root,'app/src/main');
const java=path.join(base,'java/com/portdeck/pulse');fs.mkdirSync(java,{recursive:true});
for(const name of ['MainActivity.java','PortDeckNativePlugin.java']){
 fs.copyFileSync(path.join('android-source',name),path.join(java,name));
}
const manifestPath=path.join(base,'AndroidManifest.xml');
let manifest=fs.readFileSync(manifestPath,'utf8');
if(!manifest.includes('android.intent.category.LAUNCHER</category>')){
 const queries='<queries><intent><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent></queries>';
 manifest=manifest.replace('<application',queries+String.fromCharCode(10)+'    <application');
}
fs.writeFileSync(manifestPath,manifest);
console.log('PortDeck Android: plugin e visibilidade de apps launchables configurados.');
