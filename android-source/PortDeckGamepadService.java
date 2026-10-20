package com.portdeck.pulse.safe;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.os.SystemClock;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.accessibility.AccessibilityEvent;

/**
 * Só no APK opcional "Completo". Com o PortDeck em segundo plano (dentro de um jogo), Start + Select
 * ou o botão Home do controle trazem o PortDeck de volta e abrem a central. Demais teclas passam direto para o jogo.
 * Não lê texto da tela nem guarda nada: só observa qual app está na frente e as teclas do controle.
 */
public class PortDeckGamepadService extends AccessibilityService {
  static volatile String foreground = "";
  private boolean start, select;
  private long last;

  @Override public void onAccessibilityEvent(AccessibilityEvent event) {
    if(event != null && event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED && event.getPackageName() != null)
      foreground = event.getPackageName().toString();
  }

  @Override public void onInterrupt() {}

  @Override protected boolean onKeyEvent(KeyEvent event) {
    int code = event.getKeyCode();
    // Alguns controles (ex.: 8BitDo) mandam Select como "Voltar"; só vale quando vem do controle, não da tela.
    if(code == KeyEvent.KEYCODE_BACK && (event.getSource() & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD) code = KeyEvent.KEYCODE_BUTTON_SELECT;
    if(code != KeyEvent.KEYCODE_BUTTON_START && code != KeyEvent.KEYCODE_BUTTON_SELECT && code != KeyEvent.KEYCODE_BUTTON_MODE) return false;
    boolean down = event.getAction() == KeyEvent.ACTION_DOWN;
    if(code == KeyEvent.KEYCODE_BUTTON_START) start = down;
    else if(code == KeyEvent.KEYCODE_BUTTON_SELECT) select = down;
    // Com o PortDeck na frente, ele mesmo trata os botões (a WebView recebe o controle).
    if(getPackageName().equals(foreground)) return false;
    boolean combo = down && ((start && select) || code == KeyEvent.KEYCODE_BUTTON_MODE);
    if(!combo || SystemClock.uptimeMillis() - last < 800) return false;
    last = SystemClock.uptimeMillis();
    Intent intent = new Intent(this, MainActivity.class);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    intent.putExtra("portdeck.home", true);
    startActivity(intent);
    return true;
  }
}
