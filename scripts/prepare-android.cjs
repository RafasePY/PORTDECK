const fs=require('node:fs'),path=require('node:path');
const root=path.resolve('android'),base=path.join(root,'app/src/main');
const java=path.join(base,'java/com/portdeck/pulse/safe');fs.mkdirSync(java,{recursive:true});
for(const name of ['MainActivity.java','PortDeckNativePlugin.java','PortDeckPlatformPlugin.java','PortDeckNotificationsPlugin.java','PortDeckNotificationService.java'])
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
if(!manifest.includes('PortDeckNotificationService')){
 // Leitor de notificações: inativo até o usuário liberar o acesso nas configurações do Android.
 const service='<service android:name="com.portdeck.pulse.safe.PortDeckNotificationService" android:label="PortDeck" android:exported="true" android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE">\n'+
 '      <intent-filter><action android:name="android.service.notification.NotificationListenerService"/></intent-filter>\n'+
 '    </service>';
 manifest=manifest.replace('</application>',service+'\n    </application>');
}
fs.writeFileSync(manifestPath,manifest);
// Ícone PortDeck no lugar do ícone padrão do Capacitor.
fs.cpSync(path.join('android-source','res'),path.join(base,'res'),{recursive:true});
console.log('PortDeck Android: inicialização de jogos, ícone e pop-ups de notificação configurados, sem acesso à tela inicial do Android.');
