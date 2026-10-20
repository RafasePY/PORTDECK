package com.portdeck.pulse.beta;

import android.app.Activity;
import android.app.role.RoleManager;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ComponentName;
import android.content.BroadcastReceiver;
import android.content.pm.LauncherApps;
import android.content.pm.ShortcutInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.hardware.BatteryState;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Process;
import android.os.UserHandle;
import android.provider.Settings;
import android.view.InputDevice;
import android.util.Base64;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import androidx.activity.result.ActivityResult;
import java.io.ByteArrayOutputStream;
import java.util.List;

@CapacitorPlugin(name = "PortDeckPlatform")
public class PortDeckPlatformPlugin extends Plugin {
  private boolean validPackage(String pkg) {
    return pkg!=null && pkg.matches("[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)+");
  }
  private LauncherApps launchers(){
    return (LauncherApps)getContext().getSystemService(Context.LAUNCHER_APPS_SERVICE);
  }
  private boolean isHome(){
    try {
      if(Build.VERSION.SDK_INT>=29) {
        RoleManager roles=(RoleManager)getContext().getSystemService(Context.ROLE_SERVICE);
        return roles!=null && roles.isRoleHeld(RoleManager.ROLE_HOME);
      }
      return launchers()!=null && launchers().hasShortcutHostPermission();
    } catch(Exception ignored){return false;}
  }
  private String smallIcon(Drawable drawable){
    if(drawable==null)return "";
    Bitmap bitmap=null;
    try {
      bitmap=Bitmap.createBitmap(84,84,Bitmap.Config.ARGB_8888);
      Canvas canvas=new Canvas(bitmap);
      drawable.setBounds(0,0,84,84);drawable.draw(canvas);
      ByteArrayOutputStream out=new ByteArrayOutputStream();
      bitmap.compress(Bitmap.CompressFormat.PNG,90,out);
      String encoded="data:image/png;base64,"+Base64.encodeToString(out.toByteArray(),Base64.NO_WRAP);
      out.close();return encoded;
    }catch(Exception ignored){return "";}
    finally{if(bitmap!=null)bitmap.recycle();}
  }
  @PluginMethod
  public void getStatus(PluginCall call){
    JSObject result=new JSObject();
    result.put("isHome",isHome());
    LauncherApps launcher=launchers();
    result.put("hasShortcutAccess",launcher!=null && launcher.hasShortcutHostPermission());
    int level=-1;boolean charging=false;
    Intent battery=getContext().registerReceiver(null,new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
    if(battery!=null){
      int charge=battery.getIntExtra(BatteryManager.EXTRA_LEVEL,-1);
      int scale=battery.getIntExtra(BatteryManager.EXTRA_SCALE,-1);
      if(charge>=0&&scale>0)level=Math.round(charge*100f/scale);
      int state=battery.getIntExtra(BatteryManager.EXTRA_STATUS,-1);
      charging=state==BatteryManager.BATTERY_STATUS_CHARGING||state==BatteryManager.BATTERY_STATUS_FULL;
    }
    result.put("tabletBattery",level>=0?level:JSObject.NULL);
    result.put("charging",charging);
    JSArray controllers=new JSArray();
    for(int id:InputDevice.getDeviceIds()){
      InputDevice input=InputDevice.getDevice(id);
      if(input==null)continue;
      int sources=input.getSources();
      if((sources&InputDevice.SOURCE_GAMEPAD)!=InputDevice.SOURCE_GAMEPAD &&
         (sources&InputDevice.SOURCE_JOYSTICK)!=InputDevice.SOURCE_JOYSTICK)continue;
      JSObject pad=new JSObject();
      pad.put("name",input.getName());
      pad.put("vendor",input.getVendorId());pad.put("product",input.getProductId());
      Integer percent=null;
      Boolean padCharging=null;
      if(Build.VERSION.SDK_INT>=31){
        try{
          BatteryState state=input.getBatteryState();
          if(state!=null && state.isPresent()){
            float capacity=state.getCapacity();
            if(!Float.isNaN(capacity)&&capacity>=0f&&capacity<=1f)
              percent=Math.round(capacity*100f);
            padCharging=state.getStatus()==BatteryState.STATUS_CHARGING ||
                        state.getStatus()==BatteryState.STATUS_FULL;
          }
        }catch(Exception ignored){}
      }
      pad.put("percent",percent==null?JSObject.NULL:percent);
      pad.put("charging",padCharging==null?JSObject.NULL:padCharging);
      controllers.put(pad);
    }
    result.put("controllers",controllers);
    call.resolve(result);
  }
  @PluginMethod
  public void openDefaultHomeSettings(PluginCall call){
    try{
      Intent i=new Intent(Settings.ACTION_HOME_SETTINGS);
      i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(i);
      call.resolve();
    }catch(Exception e){call.reject("Não foi possível abrir a seleção de tela inicial: "+e.getMessage());}
  }
  @PluginMethod
  public void requestHomeRole(PluginCall call){
    if(Build.VERSION.SDK_INT<29){call.reject("Use as Configurações do Android para escolher o launcher.");return;}
    try{
      RoleManager manager=(RoleManager)getContext().getSystemService(Context.ROLE_SERVICE);
      if(manager==null||!manager.isRoleAvailable(RoleManager.ROLE_HOME)){
        call.reject("Seu Android não permite trocar a tela inicial por este método.");return;
      }
      if(manager.isRoleHeld(RoleManager.ROLE_HOME)){
        JSObject r=new JSObject();r.put("isHome",true);call.resolve(r);return;
      }
      // Dispara a caixa oficial do Android, nunca troca a Home sem consentimento.
      startActivityForResult(call,manager.createRequestRoleIntent(RoleManager.ROLE_HOME),"onHomeResult");
    }catch(Exception e){call.reject("Não foi possível pedir a função de launcher: "+e.getMessage());}
  }
  @ActivityCallback
  private void onHomeResult(PluginCall call,ActivityResult result){
    if(call==null)return;
    JSObject out=new JSObject();out.put("isHome",isHome());
    call.resolve(out);
  }
  @PluginMethod
  public void listShortcuts(PluginCall call){
    String pkg=call.getString("packageName");
    if(!validPackage(pkg)){call.reject("Pacote de jogo inválido.");return;}
    LauncherApps manager=launchers();
    if(manager==null||!manager.hasShortcutHostPermission()){
      call.reject("Acesso indisponível: PortDeck Beta precisa ser escolhido como launcher padrão pelo usuário.");return;
    }
    try{
      UserHandle user=Process.myUserHandle();
      LauncherApps.ShortcutQuery query=new LauncherApps.ShortcutQuery();
      query.setPackage(pkg);
      query.setQueryFlags(LauncherApps.ShortcutQuery.FLAG_MATCH_PINNED |
                          LauncherApps.ShortcutQuery.FLAG_MATCH_DYNAMIC |
                          LauncherApps.ShortcutQuery.FLAG_MATCH_MANIFEST);
      List<ShortcutInfo> shortcuts=manager.getShortcuts(query,user);
      JSArray list=new JSArray();
      if(shortcuts!=null){
        for(ShortcutInfo s:shortcuts){
          if(!pkg.equals(s.getPackage()))continue;
          JSObject item=new JSObject();
          item.put("shortcutId",s.getId());
          item.put("name",s.getShortLabel()!=null?s.getShortLabel().toString():s.getId());
          item.put("enabled",s.isEnabled());
          item.put("icon",smallIcon(manager.getShortcutIconDrawable(s,0)));
          list.put(item);
        }
      }
      JSObject result=new JSObject();result.put("shortcuts",list);call.resolve(result);
    }catch(Exception e){call.reject("Não foi possível consultar os atalhos deste port: "+e.getMessage());}
  }
  @PluginMethod
  public void launchShortcut(PluginCall call){
    String pkg=call.getString("packageName");
    String id=call.getString("shortcutId");
    if(!validPackage(pkg)||id==null||id.length()==0||id.length()>255){
      call.reject("Atalho Android inválido.");return;
    }
    LauncherApps manager=launchers();
    if(manager==null||!manager.hasShortcutHostPermission()){
      call.reject("Selecione PortDeck Beta como launcher padrão para abrir esse atalho.");return;
    }
    try{
      // Somente shortcuts visíveis e reconhecidos pelo Android são iniciados.
      LauncherApps.ShortcutQuery q=new LauncherApps.ShortcutQuery();
      q.setPackage(pkg);
      q.setQueryFlags(LauncherApps.ShortcutQuery.FLAG_MATCH_PINNED|
                      LauncherApps.ShortcutQuery.FLAG_MATCH_DYNAMIC|
                      LauncherApps.ShortcutQuery.FLAG_MATCH_MANIFEST);
      List<ShortcutInfo> list=manager.getShortcuts(q,Process.myUserHandle());
      boolean found=false;
      if(list!=null)for(ShortcutInfo s:list){
        if(pkg.equals(s.getPackage())&&id.equals(s.getId())&&s.isEnabled()){found=true;break;}
      }
      if(!found){call.reject("O atalho não está mais disponível ou foi desativado.");return;}
      manager.startShortcut(pkg,id,null,null,Process.myUserHandle());
      call.resolve();
    }catch(Exception e){call.reject("Falha ao abrir o atalho: "+e.getMessage());}
  }
}
