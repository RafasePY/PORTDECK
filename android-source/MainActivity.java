package com.portdeck.pulse;
import android.os.Bundle;
import android.view.View;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
  @Override public void onCreate(Bundle state) {
    registerPlugin(PortDeckNativePlugin.class);
    super.onCreate(state);
    // Interface em tela cheia; a barra do sistema reaparece com um gesto.
    getWindow().getDecorView().setSystemUiVisibility(
      View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
      View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
      View.SYSTEM_UI_FLAG_FULLSCREEN |
      View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
      View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
      View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
  }
}
