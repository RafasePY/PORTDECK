package com.portdeck.pulse.safe;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
  @Override public void onCreate(Bundle state) {
    registerPlugin(PortDeckNativePlugin.class);
    registerPlugin(PortDeckPlatformPlugin.class);
    registerPlugin(PortDeckNotificationsPlugin.class);
    super.onCreate(state);
    immersive();
  }
  // O Android devolve as barras ao voltar de um jogo, de um diálogo ou da tela de permissões.
  @Override public void onResume() {
    super.onResume();
    immersive();
  }
  @Override public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if(hasFocus) immersive();
  }
  // Tela cheia de console: status, navegação e barra de tarefas somem; um gesto da borda as mostra temporariamente.
  private void immersive() {
    Window window = getWindow();
    if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)
      window.getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
    WindowCompat.setDecorFitsSystemWindows(window, false);
    WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
    controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    controller.hide(WindowInsetsCompat.Type.systemBars());
  }
}
