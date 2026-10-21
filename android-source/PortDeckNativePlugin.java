package com.portdeck.pulse.safe;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.provider.Settings;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CapacitorPlugin(name = "PortDeckNative")
public class PortDeckNativePlugin extends Plugin {
  private boolean validPackage(String pkg) {
    return pkg!=null && pkg.matches("[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)+");
  }

  private String iconToData(Drawable drawable) {
    if(drawable==null)return "";
    try{
      final int size=108;
      Bitmap bmp=Bitmap.createBitmap(size,size,Bitmap.Config.ARGB_8888);
      Canvas canvas=new Canvas(bmp);drawable.setBounds(0,0,size,size);drawable.draw(canvas);
      ByteArrayOutputStream out=new ByteArrayOutputStream();
      bmp.compress(Bitmap.CompressFormat.PNG,90,out);
      String data="data:image/png;base64,"+Base64.encodeToString(out.toByteArray(),Base64.NO_WRAP);
      out.close();bmp.recycle();return data;
    }catch(Exception error){return "";}
  }
  private Intent launcherQuery(){
    Intent i=new Intent(Intent.ACTION_MAIN);
    i.addCategory(Intent.CATEGORY_LAUNCHER);
    return i;
  }
  // Enumera atividades, não só pacotes: um único port pode expor launcher e jogo direto.
  @PluginMethod
  public void listApps(PluginCall call){
    try{
      PackageManager pm=getContext().getPackageManager();
      List<ResolveInfo> list=pm.queryIntentActivities(launcherQuery(),0);
      JSArray apps=new JSArray();Set<String> seen=new HashSet<>();
      for(ResolveInfo info:list){
        ActivityInfo a=info.activityInfo;
        if(a==null||!a.exported||a.packageName.equals(getContext().getPackageName()))continue;
        String component=new ComponentName(a.packageName,a.name).flattenToString();
        if(!seen.add(component))continue;
        JSObject item=new JSObject();
        item.put("packageName",a.packageName);
        item.put("componentName",component);
        item.put("id",component);
        CharSequence name=info.loadLabel(pm);
        item.put("name",name!=null?name.toString():a.name);
        item.put("icon",iconToData(info.loadIcon(pm)));
        apps.put(item);
      }
      JSObject out=new JSObject();out.put("apps",apps);call.resolve(out);
    }catch(Exception error){call.reject("Não foi possível consultar os aplicativos: "+error.getMessage());}
  }
  @PluginMethod
  public void launchOptions(PluginCall call){
    String pkg=call.getString("packageName");
    if(!validPackage(pkg)){call.reject("Pacote Android inválido.");return;}
    try{
      PackageManager pm=getContext().getPackageManager();
      Intent q=launcherQuery();q.setPackage(pkg);
      List<ResolveInfo> entries=pm.queryIntentActivities(q,0);
      JSArray activities=new JSArray();
      for(ResolveInfo info:entries){
        ActivityInfo a=info.activityInfo;
        if(a==null||!a.exported||!pkg.equals(a.packageName))continue;
        JSObject item=new JSObject();
        item.put("componentName",new ComponentName(a.packageName,a.name).flattenToString());
        CharSequence label=info.loadLabel(pm);
        item.put("name",label!=null?label.toString():a.name);
        activities.put(item);
      }
      Intent create=new Intent(Intent.ACTION_CREATE_SHORTCUT);
      create.setPackage(pkg);
      List<ResolveInfo> factories=pm.queryIntentActivities(create,0);
      boolean supportsShortcut=false;
      for(ResolveInfo factory:factories)if(factory.activityInfo!=null&&factory.activityInfo.exported&&pkg.equals(factory.activityInfo.packageName)){supportsShortcut=true;break;}
      JSObject out=new JSObject();out.put("activities",activities);out.put("canCreateShortcut",supportsShortcut);call.resolve(out);
    }catch(Exception e){call.reject("Não foi possível consultar os modos de inicialização: "+e.getMessage());}
  }
  private Intent validatedShortcut(String pkg,String serialized) throws Exception {
    if(serialized==null||serialized.isEmpty()||serialized.length()>32768)throw new SecurityException("Atalho ausente ou inválido.");
    Intent launch=Intent.parseUri(serialized,Intent.URI_INTENT_SCHEME);
    ComponentName component=launch.getComponent();
    if(component!=null){
      if(!pkg.equals(component.getPackageName()))throw new SecurityException("O atalho aponta para outro aplicativo.");
    }else{
      if(launch.getPackage()!=null&&!pkg.equals(launch.getPackage()))throw new SecurityException("Pacote inesperado no atalho.");
      launch.setPackage(pkg);
    }
    launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    return launch;
  }
  @PluginMethod
  public void launchApp(PluginCall call){
    String pkg=call.getString("packageName");
    if(!validPackage(pkg)){call.reject("Pacote Android inválido.");return;}
    try{
      String shortcut=call.getString("shortcutUri");
      String comp=call.getString("componentName");
      Intent launch;
      if(shortcut!=null&&!shortcut.isEmpty()){
        launch=validatedShortcut(pkg,shortcut);
      }else if(comp!=null&&!comp.isEmpty()){
        ComponentName name=ComponentName.unflattenFromString(comp);
        if(name==null||!pkg.equals(name.getPackageName()))throw new SecurityException("A atividade não pertence ao aplicativo.");
        ActivityInfo info=getContext().getPackageManager().getActivityInfo(name,0);
        if(!info.exported)throw new SecurityException("Atividade não exportada.");
        launch=new Intent(Intent.ACTION_MAIN);
        launch.addCategory(Intent.CATEGORY_LAUNCHER);
        launch.setComponent(name);
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      }else{
        launch=getContext().getPackageManager().getLaunchIntentForPackage(pkg);
        if(launch==null)throw new IllegalArgumentException("Não foi encontrado um inicializador.");
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      }
      getContext().startActivity(launch);call.resolve();
    }catch(Exception e){call.reject("Não foi possível abrir o port: "+e.getMessage());}
  }

  // Só funciona quando o próprio port expõe um criador de atalhos ACTION_CREATE_SHORTCUT.
  // Atalhos fixados na One UI não são acessíveis a um launcher que não seja o padrão.
  @PluginMethod
  public void createPortShortcut(PluginCall call){
    String pkg=call.getString("packageName");
    if(!validPackage(pkg)){call.reject("Pacote Android inválido.");return;}
    Intent q=new Intent(Intent.ACTION_CREATE_SHORTCUT);q.setPackage(pkg);
    List<ResolveInfo> factories=getContext().getPackageManager().queryIntentActivities(q,0);
    ResolveInfo chosen=null;
    for(ResolveInfo info:factories){
      if(info.activityInfo!=null&&info.activityInfo.exported&&pkg.equals(info.activityInfo.packageName)){chosen=info;break;}
    }
    if(chosen==null){call.reject("Este aplicativo não oferece importação de atalho direto por este método.");return;}
    ActivityInfo a=chosen.activityInfo;
    Intent chooser=new Intent(Intent.ACTION_CREATE_SHORTCUT);
    chooser.setComponent(new ComponentName(a.packageName,a.name));
    startActivityForResult(call,chooser,"shortcutResult");
  }
  @ActivityCallback
  private void shortcutResult(PluginCall call,ActivityResult result){
    if(call==null)return;
    if(result.getResultCode()!=Activity.RESULT_OK||result.getData()==null){call.resolve(new JSObject());return;}
    Intent data=result.getData();
    Intent shortcut=(Intent)data.getParcelableExtra(Intent.EXTRA_SHORTCUT_INTENT);
    if(shortcut==null){call.reject("O port não retornou um atalho compatível com o PortDeck.");return;}
    try{
      String pkg=call.getString("packageName");
      Intent safe=validatedShortcut(pkg,shortcut.toUri(Intent.URI_INTENT_SCHEME));
      String uri=safe.toUri(Intent.URI_INTENT_SCHEME);
      CharSequence label=data.getStringExtra(Intent.EXTRA_SHORTCUT_NAME);
      JSObject out=new JSObject();out.put("shortcutUri",uri);out.put("name",label==null?"Jogo direto":label.toString());call.resolve(out);
    }catch(Exception e){call.reject("O atalho fornecido não pode ser usado com segurança: "+e.getMessage());}
  }
  @PluginMethod
  public void appSettings(PluginCall call){
    String pkg=call.getString("packageName");
    if(!validPackage(pkg)){call.reject("Pacote Android inválido.");return;}
    try{
      Intent intent=new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,Uri.parse("package:"+pkg));
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(intent);call.resolve();
    }catch(Exception e){call.reject("Não foi possível abrir as configurações: "+e.getMessage());}
  }
  // Fecha o jogo que o PortDeck abriu: Forçar parada automático (APK Completo) ou a tela de Informações do app.
  @PluginMethod
  public void closeApp(PluginCall call){
    String pkg=call.getString("packageName");
    if(!validPackage(pkg)||pkg.equals(getContext().getPackageName())){call.reject("Pacote Android inválido.");return;}
    try{
      ActivityManager am=(ActivityManager)getContext().getSystemService(Context.ACTIVITY_SERVICE);
      am.killBackgroundProcesses(pkg);
      JSObject out=new JSObject();
      // O Android não deixa um app comum encerrar outro. Com o serviço do APK Completo ativo, ele aperta "Forçar parada";
      // senão abrimos Informações do app para o jogador tocar em "Forçar parada".
      if(PortDeckGamepadService.requestClose(pkg))out.put("mode","auto");
      else{
        Intent info=new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,Uri.parse("package:"+pkg));
        info.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(info);out.put("mode","manual");
      }
      call.resolve(out);
    }catch(Exception e){call.reject("O Android não permitiu fechar este app: "+e.getMessage());}
  }
  // Backup da biblioteca: grava o JSON em Downloads/PortDeck (fica no tablet mesmo se o PortDeck for desinstalado).
  @PluginMethod
  public void saveBackup(PluginCall call){
    String name=call.getString("name","PortDeck-backup.json"),data=call.getString("data","");
    if(!name.matches("[A-Za-z0-9._-]{1,80}\\.json")||data.isEmpty()){call.reject("Backup inválido.");return;}
    try{
      byte[] bytes=data.getBytes(java.nio.charset.StandardCharsets.UTF_8);
      if(android.os.Build.VERSION.SDK_INT>=29){
        android.content.ContentValues values=new android.content.ContentValues();
        values.put(android.provider.MediaStore.Downloads.DISPLAY_NAME,name);
        values.put(android.provider.MediaStore.Downloads.MIME_TYPE,"application/json");
        values.put(android.provider.MediaStore.Downloads.RELATIVE_PATH,android.os.Environment.DIRECTORY_DOWNLOADS+"/PortDeck");
        android.net.Uri uri=getContext().getContentResolver().insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI,values);
        if(uri==null)throw new Exception("sem acesso a Downloads");
        try(java.io.OutputStream out=getContext().getContentResolver().openOutputStream(uri)){out.write(bytes);}
        JSObject res=new JSObject();res.put("path","Download/PortDeck/"+name);call.resolve(res);
      }else{
        java.io.File dir=new java.io.File(getContext().getExternalFilesDir(null),"backup");dir.mkdirs();
        java.io.File file=new java.io.File(dir,name);
        try(java.io.FileOutputStream out=new java.io.FileOutputStream(file)){out.write(bytes);}
        JSObject res=new JSObject();res.put("path",file.getAbsolutePath());call.resolve(res);
      }
    }catch(Exception e){call.reject("Não foi possível salvar o backup: "+e.getMessage());}
  }
}
