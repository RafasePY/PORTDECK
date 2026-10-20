package com.portdeck.pulse;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.provider.Settings;
import android.net.Uri;
import android.util.Base64;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.io.ByteArrayOutputStream;

@CapacitorPlugin(name = "PortDeckNative")
public class PortDeckNativePlugin extends Plugin {
    private boolean validPackage(String value) {
      return value != null && value.matches("[A-Za-z0-9_]+[.][A-Za-z0-9_.]+") && !value.contains("..");
    }
    private String iconToData(Drawable drawable) {
      try {
        final int s=108;
        Bitmap bmp=Bitmap.createBitmap(s,s,Bitmap.Config.ARGB_8888);
        Canvas canvas=new Canvas(bmp);
        drawable.setBounds(0,0,s,s);
        drawable.draw(canvas);
        ByteArrayOutputStream stream=new ByteArrayOutputStream();
        bmp.compress(Bitmap.CompressFormat.PNG,90,stream);
        String value="data:image/png;base64,"+Base64.encodeToString(stream.toByteArray(),Base64.NO_WRAP);
        stream.close();bmp.recycle();
        return value;
      } catch(Exception e) {return "";}
    }
    @PluginMethod
    public void listApps(PluginCall call) {
      try {
        PackageManager pm=getContext().getPackageManager();
        Intent intent=new Intent(Intent.ACTION_MAIN);
        intent.addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> launchers=pm.queryIntentActivities(intent,0);
        JSArray result=new JSArray();
        Set<String> seen=new HashSet<>();
        for(ResolveInfo info:launchers){
          ActivityInfo activity=info.activityInfo;
          if(activity==null||activity.packageName==null)continue;
          String pkg=activity.packageName;
          if(pkg.equals(getContext().getPackageName())||!seen.add(pkg))continue;
          JSObject item=new JSObject();
          item.put("packageName",pkg);
          CharSequence name=info.loadLabel(pm);
          item.put("name",name==null?pkg:name.toString());
          item.put("icon",iconToData(info.loadIcon(pm)));
          result.put(item);
        }
        JSObject output=new JSObject();
        output.put("apps",result);
        call.resolve(output);
      }catch(Exception error){call.reject("Não foi possível listar os aplicativos: "+error.getMessage());}
    }
    @PluginMethod
    public void launchApp(PluginCall call){
      String pkg=call.getString("packageName");
      if(!validPackage(pkg)){call.reject("Pacote Android inválido.");return;}
      try{
        Intent launch=getContext().getPackageManager().getLaunchIntentForPackage(pkg);
        if(launch==null){call.reject("Aplicativo não encontrado ou não pode ser iniciado.");return;}
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(launch);
        call.resolve();
      }catch(Exception e){call.reject("Falha ao abrir aplicativo: "+e.getMessage());}
    }
    @PluginMethod
    public void appSettings(PluginCall call){
      String pkg=call.getString("packageName");
      if(!validPackage(pkg)){call.reject("Pacote Android inválido.");return;}
      try{
        Intent intent=new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,Uri.parse("package:"+pkg));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
      }catch(Exception e){call.reject("Não foi possível abrir as configurações: "+e.getMessage());}
    }
}
