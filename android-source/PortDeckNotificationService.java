package com.portdeck.pulse.safe;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Base64;
import com.getcapacitor.JSObject;
import java.io.ByteArrayOutputStream;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Repassa notificações do tablet para a interface do PortDeck enquanto ela está aberta.
 * Nada é salvo em disco nem enviado à rede; só o título, o texto e o ícone do app chegam à WebView.
 */
public class PortDeckNotificationService extends NotificationListenerService {
  private static final int MAX_PENDING = 30;
  // Ação de abrir cada notificação recente, para o toque no pop-up levar ao app de origem.
  static final Map<String, PendingIntent> actions = new LinkedHashMap<String, PendingIntent>(16, .75f, false) {
    @Override protected boolean removeEldestEntry(Map.Entry<String, PendingIntent> eldest) { return size() > MAX_PENDING; }
  };
  private static final Map<String, String> icons = new LinkedHashMap<String, String>(16, .75f, true) {
    @Override protected boolean removeEldestEntry(Map.Entry<String, String> eldest) { return size() > 24; }
  };

  @Override public void onNotificationPosted(StatusBarNotification sbn) {
    PortDeckNotificationsPlugin target = PortDeckNotificationsPlugin.instance;
    if(target == null || sbn == null) return;
    Notification n = sbn.getNotification();
    if(n == null || sbn.getPackageName().equals(getPackageName())) return;
    if(!sbn.isClearable() || (n.flags & Notification.FLAG_GROUP_SUMMARY) != 0) return;
    Bundle extras = n.extras;
    String title = text(extras, Notification.EXTRA_TITLE);
    String body = text(extras, Notification.EXTRA_BIG_TEXT);
    if(body.isEmpty()) body = text(extras, Notification.EXTRA_TEXT);
    if(title.isEmpty() && body.isEmpty()) return;
    synchronized(actions) { if(n.contentIntent != null) actions.put(sbn.getKey(), n.contentIntent); }
    JSObject data = new JSObject();
    data.put("key", sbn.getKey());
    data.put("packageName", sbn.getPackageName());
    data.put("app", label(sbn.getPackageName()));
    data.put("icon", icon(sbn.getPackageName()));
    data.put("title", clip(title, 120));
    data.put("text", clip(body, 280));
    data.put("category", n.category == null ? "" : n.category);
    data.put("time", sbn.getPostTime());
    target.deliver(data);
  }

  private static String text(Bundle extras, String key) {
    if(extras == null) return "";
    CharSequence value = extras.getCharSequence(key);
    return value == null ? "" : value.toString().trim();
  }
  private static String clip(String value, int max) { return value.length() > max ? value.substring(0, max - 1) + "…" : value; }

  private String label(String pkg) {
    try {
      PackageManager pm = getPackageManager();
      ApplicationInfo info = pm.getApplicationInfo(pkg, 0);
      return pm.getApplicationLabel(info).toString();
    } catch(Exception error) { return pkg; }
  }

  private String icon(String pkg) {
    synchronized(icons) { String cached = icons.get(pkg); if(cached != null) return cached; }
    String data = "";
    try {
      Drawable drawable = getPackageManager().getApplicationIcon(pkg);
      final int size = 72;
      Bitmap bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
      Canvas canvas = new Canvas(bmp); drawable.setBounds(0, 0, size, size); drawable.draw(canvas);
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      bmp.compress(Bitmap.CompressFormat.PNG, 90, out);
      data = "data:image/png;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP);
      out.close(); bmp.recycle();
    } catch(Exception error) { data = ""; }
    synchronized(icons) { icons.put(pkg, data); }
    return data;
  }
}
