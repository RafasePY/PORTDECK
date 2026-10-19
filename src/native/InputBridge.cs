// PortDeckInputBridge: escuta exclusivamente Start+Select via XInput (Windows).
// Não instala hook de teclado, não injeta DLLs e não modifica jogos.
using System;
using System.Runtime.InteropServices;
using System.Threading;
class PortDeckInputBridge
{
  [StructLayout(LayoutKind.Sequential)]
  struct XINPUT_GAMEPAD {
    public ushort wButtons;
    public byte bLeftTrigger, bRightTrigger;
    public short sThumbLX, sThumbLY, sThumbRX, sThumbRY;
  }
  [StructLayout(LayoutKind.Sequential)]
  struct XINPUT_STATE {
    public uint dwPacketNumber;
    public XINPUT_GAMEPAD Gamepad;
  }
  [DllImport("xinput1_4.dll", EntryPoint="XInputGetState")]
  static extern uint XInputGetState(uint dwUserIndex, out XINPUT_STATE state);
  const ushort START = 0x0010, BACK = 0x0020;

  static void Main(){
    // Se o processo Electron fechar, stdin chega em EOF e este helper termina.
    Thread quitWhenParentCloses=new Thread(() => {
      try { while(Console.ReadLine()!=null) {} } catch {}
      Environment.Exit(0);
    });
    quitWhenParentCloses.IsBackground=true;
    quitWhenParentCloses.Start();
    bool[] held=new bool[4];
    while(true){
      try {
        for(uint slot=0;slot<4;slot++){
          XINPUT_STATE state;
          bool connected=XInputGetState(slot,out state)==0;
          bool combo=connected && (state.Gamepad.wButtons & (START|BACK))==(START|BACK);
          if(combo && !held[slot]){
            Console.Out.WriteLine("HOME "+slot);
            Console.Out.Flush();
          }
          held[slot]=combo;
        }
      } catch(DllNotFoundException){return;}
        catch(EntryPointNotFoundException){return;}
      Thread.Sleep(32); // <= 32 consultas/s, sem busy loop.
    }
  }
}