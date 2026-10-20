package com.portdeck.pulse.safe;

import android.app.ActivityOptions;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Pop-ups de notificações: só funciona depois que o usuário libera "Acesso a notificações" para o PortDeck. */
@CapacitorPlugin(name = "PortDeckNotifications")
public class PortDeckNotificationsPlugin extends Plugin {
  static volatile PortDeckNotificationsPlugin instance;

  @Override public void load() { instance = this; }
  @Override protected void handleOnDestroy() { if(instance == this) instance = null; }

  void deliver(JSObject data) { notifyListeners("notification", data); }

  @PluginMethod
  public void status(PluginCall call) {
    JSObject result = new JSObject();
    boolean available;
    try {
      getContext().getPackageManager().getServiceInfo(new ComponentName(getContext(), PortDeckNotificationService.class), 0);
      available = true;
    } catch(PackageManager.NameNotFoundException missing) { available = false; }
    // APK padrão não declara o serviço; a interface esconde o sininho.
    result.put("available", available);
    result.put("granted", available && NotificationManagerCompat.getEnabledListenerPackages(getContext()).contains(getContext().getPackageName()));
    call.resolve(result);
  }

  @PluginMethod
  public void openSettings(PluginCall call) {
    try {
      Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(intent);
      call.resolve();
    } catch(Exception error) { call.reject("Não foi possível abrir as configurações de notificações."); }
  }

  @PluginMethod
  public void open(PluginCall call) {
    String key = call.getString("key", "");
    PendingIntent action;
    synchronized(PortDeckNotificationService.actions) { action = PortDeckNotificationService.actions.remove(key); }
    if(action == null) { call.reject("Esta notificação não está mais disponível."); return; }
    try {
      if(Build.VERSION.SDK_INT >= 34) {
        // O PortDeck está em primeiro plano; o Android 14+ exige autorizar explicitamente a abertura do app de origem.
        ActivityOptions options = ActivityOptions.makeBasic();
        options.setPendingIntentBackgroundActivityStartMode(ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED);
        Bundle bundle = options.toBundle();
        action.send(getContext(), 0, null, null, null, null, bundle);
      } else action.send();
      call.resolve();
    } catch(Exception error) { call.reject("O aplicativo não permitiu abrir esta notificação."); }
  }
}
