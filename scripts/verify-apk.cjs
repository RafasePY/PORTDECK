const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const apk=process.argv[2],sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT;
if(!sdk||!apk)throw Error('Informe APK e ANDROID_HOME.');
const build=fs.readdirSync(path.join(sdk,'build-tools')).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}))[0],tool=n=>path.join(sdk,'build-tools',build,n);
const certificate=execFileSync(tool('apksigner'),['verify','--print-certs',apk],{encoding:'utf8'});
const expected='ed639d51da1a290f39483493397b0f3831ab8ab298c0a973475bd03bf26ec765';
if(!certificate.toLowerCase().includes(expected))throw Error('Assinatura incompatível com a 0.8.');
const metadata=execFileSync(tool('aapt'),['dump','badging',apk],{encoding:'utf8'});
// Versão esperada vem do package.json (mesma conta de prepare-android.cjs), para não precisar editar este arquivo a cada versão.
const version=require('../package.json').version,[major,minor,patch]=version.split('.').map(Number),code=String(major*1000000+minor*1000+patch);
if(!metadata.includes("package: name='com.portdeck.pulse.safe'")||!metadata.includes("versionCode='"+code+"'")||!metadata.includes("versionName='"+version+"'"))throw Error('Identidade ou versão do APK incorreta.');
const manifest=execFileSync(tool('aapt'),['dump','xmltree',apk,'AndroidManifest.xml'],{encoding:'utf8'});
const complete=process.env.PORTDECK_NOTIFICATIONS==='1';
if(manifest.includes('android.intent.category.HOME'))throw Error('APK não é Safe.');
// Leitor de notificações e acessibilidade (Start+Select nos jogos) só podem existir no APK opcional "Completo".
if(manifest.includes('BIND_NOTIFICATION_LISTENER_SERVICE')!==complete||manifest.includes('BIND_ACCESSIBILITY_SERVICE')!==complete)throw Error('Variante incorreta: recursos sensíveis fora do APK Completo ou ausentes nele.');
console.log('APK verificado: assinatura 0.8 preservada, com.portdeck.pulse.safe, versão '+version+' / '+code+', variante '+(complete?'Completo':'padrão')+' correta.');
