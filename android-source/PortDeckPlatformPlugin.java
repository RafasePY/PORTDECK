package com.portdeck.pulse.preview;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.BatteryState;
import android.os.BatteryManager;
import android.os.Build;
import android.view.InputDevice;
import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Only battery telemetry. Never requests HOME role or reads shortcuts. */
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
    JSArray controllers = new JSArray();
    for(int id : InputDevice.getDeviceIds()) {
      InputDevice input = InputDevice.getDevice(id);
      if(input == null) continue;
      int sources = input.getSources();
      if((sources & InputDevice.SOURCE_GAMEPAD) != InputDevice.SOURCE_GAMEPAD &&
         (sources & InputDevice.SOURCE_JOYSTICK) != InputDevice.SOURCE_JOYSTICK) continue;
      JSObject controller = new JSObject();
      controller.put("name", input.getName());
      controller.put("vendor", input.getVendorId());
      controller.put("product", input.getProductId());
      Integer percentage = null;
      Boolean padCharging = null;
      if(Build.VERSION.SDK_INT >= 31) {
        try {
          BatteryState state = input.getBatteryState();
          if(state != null && state.isPresent()) {
            float capacity = state.getCapacity();
            if(!Float.isNaN(capacity) && capacity >= 0 && capacity <= 1)
              percentage = Math.round(capacity * 100f);
            padCharging = state.getStatus() == BatteryState.STATUS_CHARGING ||
                          state.getStatus() == BatteryState.STATUS_FULL;
          }
        } catch(Exception ignored) { }
      }
      controller.put("percent", percentage == null ? JSObject.NULL : percentage);
      controller.put("charging", padCharging == null ? JSObject.NULL : padCharging);
      controllers.put(controller);
    }
    result.put("controllers", controllers);
    call.resolve(result);
  }
}
