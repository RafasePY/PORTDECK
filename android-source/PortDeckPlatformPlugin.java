package com.portdeck.pulse.preview;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Tablet battery only. No launcher permissions, shortcuts or gamepad battery reads. */
@CapacitorPlugin(name = "PortDeckPlatform")
public class PortDeckPlatformPlugin extends Plugin {
  @PluginMethod
  public void getStatus(PluginCall call) {
    JSObject result = new JSObject();
    int level = -1;
    boolean charging = false;
    Intent battery = getContext().registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
    if(battery != null) {
      int current = battery.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
      int scale = battery.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
      if(current >= 0 && scale > 0) level = Math.round(current * 100f / scale);
      int status = battery.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
      charging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL;
    }
    result.put("tabletBattery", level >= 0 ? level : JSObject.NULL);
    result.put("charging", charging);
    call.resolve(result);
  }
}
