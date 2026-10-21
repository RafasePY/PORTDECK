package com.portdeck.pulse.safe;

import android.app.ActivityOptions;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;
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

  // Resultado do "Fechar jogo" automático (o serviço roda fora do fluxo de chamadas do plugin).
  static void closeResult(String pkg, boolean ok) {
    PortDeckNotificationsPlugin target = instance;
    if(target == null) return;
    JSObject data = new JSObject(); data.put("packageName", pkg); data.put("ok", ok);
    target.notifyListeners("closeResult", data);
  }

  // Abertura a frio por Start + Select: a MainActivity guardou o pedido antes da interface existir.
  @PluginMethod
  public void consumeHome(PluginCall call) {
    JSObject result = new JSObject(); result.put("home", MainActivity.pendingHome); MainActivity.pendingHome = false;
    call.resolve(result);
  }

  // Start + Select dentro do jogo (serviço de acessibilidade do APK Completo) reabre o PortDeck com este extra.
  @Override protected void handleOnNewIntent(Intent intent) {
    super.handleOnNewIntent(intent);
    if(intent != null && intent.getBooleanExtra("portdeck.home", false)) notifyListeners("homeButton", new JSObject());
  }

  @PluginMethod
  public void gamepadStatus(PluginCall call) {
    JSObject result = new JSObject();
    ComponentName service = new ComponentName(getContext(), PortDeckGamepadService.class);
    boolean available;
    try { getContext().getPackageManager().getServiceInfo(service, 0); available = true; }
    catch(PackageManager.NameNotFoundException missing) { available = false; }
    String enabled = Settings.Secure.getString(getContext().getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
    result.put("available", available);
    result.put("enabled", available && enabled != null && enabled.toLowerCase().contains(service.flattenToString().toLowerCase()));
    // Diagnóstico: serviço vivo agora e último botão do controle que ele recebeu (ajuda a achar quando a Samsung o adormece).
    result.put("connected", PortDeckGamepadService.instance != null);
    result.put("lastKey", PortDeckGamepadService.lastKey);
    result.put("lastKeyAt", PortDeckGamepadService.lastKeyAt);
    android.os.PowerManager power = (android.os.PowerManager) getContext().getSystemService(android.content.Context.POWER_SERVICE);
    result.put("batteryFree", power != null && power.isIgnoringBatteryOptimizations(getContext().getPackageName()));
    call.resolve(result);
  }

  // Samsung adormece apps em segundo plano e o serviço do controle para de responder depois de um tempo.
  @PluginMethod
  public void openBatterySettings(PluginCall call) {
    try {
      Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getContext().getPackageName()));
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(intent);
      call.resolve();
    } catch(Exception error) {
      try {
        Intent fallback = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getContext().getPackageName()));
        fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(fallback);
        call.resolve();
      } catch(Exception again) { call.reject("Não foi possível abrir as configurações de bateria."); }
    }
  }

  @PluginMethod
  public void openGamepadSettings(PluginCall call) {
    try {
      Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(intent);
      call.resolve();
    } catch(Exception error) { call.reject("Não foi possível abrir as configurações de acessibilidade."); }
  }

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
