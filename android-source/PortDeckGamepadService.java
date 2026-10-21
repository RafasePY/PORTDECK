package com.portdeck.pulse.safe;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.provider.Settings;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.List;

/**
 * Só no APK opcional "Completo".
 * 1) Com um jogo na frente, Start + Select (ou o botão Home do controle) trazem o PortDeck de volta e abrem a central.
 * 2) "Fechar jogo": abre Informações do app do jogo e aperta "Forçar parada" + confirmação, depois volta ao PortDeck.
 * Só lê o conteúdo da tela de Configurações durante esses poucos segundos de "Fechar jogo"; não lê jogos, mensagens nem o que você digita.
 */
public class PortDeckGamepadService extends AccessibilityService {
  static volatile PortDeckGamepadService instance;
  static volatile String lastKey = "";
  static volatile long lastKeyAt;
  // Textos do botão "Forçar parada" e da confirmação em One UI (pt-BR) e Android puro (pt/en).
  private static final String[] STOP = {"Forçar parada", "Forçar fechamento", "Forçar encerramento", "Force stop"};
  private static final String[] CONFIRM = {"OK", "Forçar parada", "Forçar fechamento", "Forçar encerramento", "Force stop"};
  private final Handler main = new Handler(Looper.getMainLooper());
  private boolean start, select;
  private long last;
  // Estado do "Fechar jogo" automático.
  private String closing, closingLabel;
  private int step, token, firstWindow = -1;
  private long deadline, stepAt;
  // Resultado do último "Fechar jogo", mostrado no diagnóstico do sininho.
  static volatile String lastClose = "";

  @Override protected void onServiceConnected() { instance = this; }
  @Override public boolean onUnbind(Intent intent) { if(instance == this) instance = null; return super.onUnbind(intent); }
  @Override public void onDestroy() { if(instance == this) instance = null; super.onDestroy(); }
  @Override public void onInterrupt() {}

  @Override public void onAccessibilityEvent(AccessibilityEvent event) {
    if(closing == null || event == null) return;
    if(SystemClock.uptimeMillis() > deadline) { finishClose(false); return; }
    CharSequence pkg = event.getPackageName();
    if(pkg == null || !pkg.toString().contains("settings")) return;
    AccessibilityNodeInfo root = getRootInActiveWindow();
    if(root == null) return;
    if(step == 0) {
      // Só age na tela do jogo certo (o nome do app aparece em Informações do app).
      if(closingLabel != null && !hasText(root, closingLabel)) return;
      AccessibilityNodeInfo button = find(root, STOP, false);
      if(button == null) return;
      firstWindow = root.getWindowId();
      // Botão desativado (nele ou no item clicável que o contém) = o jogo já estava parado.
      if(click(button)) { step = 1; stepAt = SystemClock.uptimeMillis(); deadline = stepAt + 5000; } else finishClose(true, "já estava parado");
    } else {
      // A confirmação abre em outra janela (diálogo). Antes disso, o mesmo texto ainda é o botão da página: não confirmar cedo.
      if(root.getWindowId() == firstWindow && SystemClock.uptimeMillis() - stepAt < 2500) return;
      AccessibilityNodeInfo confirm = find(root, CONFIRM, true);
      if(confirm != null && click(confirm)) finishClose(true, "fechado");
    }
  }

  /** Chamado pelo plugin. Retorna false se o serviço não está ativo (a interface cai no modo manual). */
  static boolean requestClose(String pkg) {
    PortDeckGamepadService service = instance;
    if(service == null) return false;
    service.main.post(() -> service.beginClose(pkg));
    return true;
  }

  private void beginClose(String pkg) {
    final int mine = ++token;
    closing = pkg; step = 0; firstWindow = -1; deadline = SystemClock.uptimeMillis() + 7000;
    try { closingLabel = getPackageManager().getApplicationLabel(getPackageManager().getApplicationInfo(pkg, 0)).toString(); }
    catch(Exception error) { closingLabel = null; }
    Intent info = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + pkg));
    // CLEAR_TASK: sempre uma tela nova das Configurações. Sem isso, uma tentativa anterior deixava a tela de outro app aberta
    // e o Android a reaproveitava (era por isso que parava de fechar depois de algumas vezes).
    info.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
    startActivity(info);
    // O tempo esgotado só vale para esta tentativa, nunca para uma mais nova.
    main.postDelayed(() -> { if(mine == token && closing != null) finishClose(false, "tempo esgotado no passo " + (step + 1)); }, 7500);
  }

  private static boolean hasText(AccessibilityNodeInfo root, String text) {
    List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByText(text);
    return nodes != null && !nodes.isEmpty();
  }

  private void finishClose(boolean ok) { finishClose(ok, ok ? "fechado" : "falhou"); }

  private void finishClose(boolean ok, String detail) {
    if(closing == null) return;
    String pkg = closing;
    closing = null;
    lastClose = (closingLabel != null ? closingLabel : pkg) + ": " + detail;
    if(ok) { performGlobalAction(GLOBAL_ACTION_BACK); main.postDelayed(() -> openPortDeck(false), 350); }
    PortDeckNotificationsPlugin.closeResult(pkg, ok);
  }

  private static AccessibilityNodeInfo find(AccessibilityNodeInfo root, String[] labels, boolean buttonsOnly) {
    for(String label : labels) {
      List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByText(label);
      if(nodes == null) continue;
      for(AccessibilityNodeInfo node : nodes) {
        CharSequence text = node.getText();
        if(text == null || !text.toString().trim().equalsIgnoreCase(label)) continue;
        if(buttonsOnly && node.getClassName() != null && !node.getClassName().toString().contains("Button")) continue;
        return node;
      }
    }
    return null;
  }

  private static boolean click(AccessibilityNodeInfo node) {
    for(AccessibilityNodeInfo n = node; n != null; n = n.getParent())
      if(n.isClickable() && n.isEnabled()) return n.performAction(AccessibilityNodeInfo.ACTION_CLICK);
    return false;
  }

  @Override protected boolean onKeyEvent(KeyEvent event) {
    int code = event.getKeyCode();
    // Alguns controles (ex.: 8BitDo) mandam Select como "Voltar"; só vale quando vem do controle, não da tela.
    if(code == KeyEvent.KEYCODE_BACK && (event.getSource() & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD) code = KeyEvent.KEYCODE_BUTTON_SELECT;
    if(code != KeyEvent.KEYCODE_BUTTON_START && code != KeyEvent.KEYCODE_BUTTON_SELECT && code != KeyEvent.KEYCODE_BUTTON_MODE) return false;
    boolean down = event.getAction() == KeyEvent.ACTION_DOWN;
    if(down) { lastKey = KeyEvent.keyCodeToString(code).replace("KEYCODE_BUTTON_", ""); lastKeyAt = System.currentTimeMillis(); }
    if(code == KeyEvent.KEYCODE_BUTTON_START) start = down;
    else if(code == KeyEvent.KEYCODE_BUTTON_SELECT) select = down;
    // Com o PortDeck na frente, ele mesmo trata os botões. Usa o estado real da tela do PortDeck,
    // não eventos de janela (que sobreposições da Samsung e do jogo bagunçavam depois de um tempo).
    if(MainActivity.resumed) return false;
    boolean combo = down && ((start && select) || code == KeyEvent.KEYCODE_BUTTON_MODE);
    if(!combo || SystemClock.uptimeMillis() - last < 800) return false;
    last = SystemClock.uptimeMillis();
    start = select = false; // evita combo "preso" se o jogo engolir o soltar do botão
    openPortDeck(true);
    return true;
  }

  private void openPortDeck(boolean home) {
    Intent intent = new Intent(this, MainActivity.class);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    if(home) intent.putExtra("portdeck.home", true);
    startActivity(intent);
  }
}
