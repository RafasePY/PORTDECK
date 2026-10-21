const fs=require('node:fs'),path=require('node:path');
const root=path.resolve('android'),base=path.join(root,'app/src/main');
const java=path.join(base,'java/com/portdeck/pulse/safe');fs.mkdirSync(java,{recursive:true});
for(const name of ['MainActivity.java','PortDeckNativePlugin.java','PortDeckPlatformPlugin.java','PortDeckNotificationsPlugin.java','PortDeckNotificationService.java','PortDeckGamepadService.java'])
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
// O Play Protect bloqueia instalação fora da loja de apps com leitor de notificações ou acessibilidade (proteção contra fraude);
// por isso os dois só entram no APK opcional "Completo", gerado com PORTDECK_NOTIFICATIONS=1.
const withNotifications=process.env.PORTDECK_NOTIFICATIONS==='1';
if(withNotifications&&!manifest.includes('PortDeckNotificationService')){
 // Leitor de notificações: inativo até o usuário liberar o acesso nas configurações do Android.
 const service='<service android:name="com.portdeck.pulse.safe.PortDeckNotificationService" android:label="PortDeck" android:exported="true" android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE">\n'+
 '      <intent-filter><action android:name="android.service.notification.NotificationListenerService"/></intent-filter>\n'+
 '    </service>';
 manifest=manifest.replace('</application>',service+'\n    </application>');
}
if(withNotifications&&!manifest.includes('PortDeckGamepadService')){
 // Start + Select dentro dos jogos: serviço de acessibilidade só com filtro de teclas do controle, inativo até o usuário ativar.
 const gamepad='<service android:name="com.portdeck.pulse.safe.PortDeckGamepadService" android:label="@string/portdeck_gamepad_label" android:exported="true" android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">\n'+
 '      <intent-filter><action android:name="android.accessibilityservice.AccessibilityService"/></intent-filter>\n'+
 '      <meta-data android:name="android.accessibilityservice" android:resource="@xml/portdeck_gamepad"/>\n'+
 '    </service>';
 manifest=manifest.replace('</application>',gamepad+'\n    </application>');
}
// Completo: pedir ao Android para não adormecer o PortDeck (senão o Start+Select para de responder depois de um tempo na Samsung).
if(withNotifications&&!manifest.includes('REQUEST_IGNORE_BATTERY_OPTIMIZATIONS'))manifest=manifest.replace('<application','<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"/>\n    <application');
// "Fechar jogo": permissão comum (não sensível) para encerrar o app aberto pelo PortDeck quando ele está em segundo plano.
if(!manifest.includes('android.permission.KILL_BACKGROUND_PROCESSES'))manifest=manifest.replace('<application','<uses-permission android:name="android.permission.KILL_BACKGROUND_PROCESSES"/>\n    <application');
fs.writeFileSync(manifestPath,manifest);
// Assinatura fixa: sem ela cada build do CI usa uma chave de debug nova e o Android recusa instalar por cima.
const gradlePath=path.join(root,'app/build.gradle');
if(!fs.existsSync(gradlePath))throw Error('android/app/build.gradle não encontrado; ajuste a assinatura manualmente.');
let gradle=fs.readFileSync(gradlePath,'utf8');
if(!gradle.includes('portdeck-signing.keystore')){
 const signing="\n    signingConfigs {\n        debug {\n            storeFile file('../../android-source/portdeck-signing.keystore')\n            storePassword 'portdeck'\n            keyAlias 'portdeck'\n            keyPassword 'portdeck'\n        }\n    }";
 if(!/^android\s*\{/m.test(gradle))throw Error('Bloco android { } não encontrado em app/build.gradle.');
 gradle=gradle.replace(/^android\s*\{/m,m=>m+signing);
 fs.writeFileSync(gradlePath,gradle);
}
// Versão monotônica e idempotente; a assinatura e o applicationId permanecem iguais.
const version=require('../package.json').version;
const [major,minor,patch]=version.split('.').map(Number);
gradle=gradle.replace(/versionCode\s+\d+/, 'versionCode '+(major*1000000+minor*1000+patch)).replace(/versionName\s+"[^"]+"/, 'versionName "'+version+'"');
fs.writeFileSync(gradlePath,gradle);
// Ícone PortDeck no lugar do ícone padrão do Capacitor.
fs.cpSync(path.join('android-source','res'),path.join(base,'res'),{recursive:true});
console.log('PortDeck Android: inicialização de jogos e ícone configurados'+(withNotifications?', com pop-ups de notificação e Start+Select nos jogos':', sem leitor de notificações')+'; sem acesso à tela inicial do Android.');
