/* PortDeck Setup 0.1.2 - Windows x64 per-user installer, no external dependencies */
typedef unsigned char BYTE;typedef unsigned short WCHAR;typedef unsigned int UINT;typedef unsigned long DWORD;typedef long LONG;typedef unsigned long long UINT64;typedef void* HANDLE;typedef HANDLE HINSTANCE;typedef HANDLE HMODULE;typedef void* LPVOID;typedef WCHAR* LPWSTR;typedef const WCHAR* LPCWSTR;typedef int BOOL;
#define WIN __stdcall
#define DLL __declspec(dllimport)
#define NULL ((void*)0)
#define GENERIC_WRITE 0x40000000U
#define CREATE_ALWAYS 2
#define FILE_ATTRIBUTE_NORMAL 0x80
#define INVALID_HANDLE_VALUE ((HANDLE)-1)
#define MB_OK 0
#define MB_ICONERROR 16
#define MB_YESNO 4
#define MB_ICONINFORMATION 64
#define MB_ICONQUESTION 32
#define IDYES 6
#define SW_SHOWNORMAL 1
#define HKEY_CURRENT_USER ((HANDLE)(UINT64)0x80000001U)
#define REG_OPTION_NON_VOLATILE 0
#define KEY_ALL_ACCESS 0x000F003FU
#define REG_SZ 1
#define REG_DWORD 4
#define CLSCTX_INPROC_SERVER 1
#define MOVEFILE_DELAY_UNTIL_REBOOT 4
#define KEY_SET_VALUE 0x0002
#define W(x) ((const WCHAR*)L##x)
DLL DWORD WIN GetEnvironmentVariableW(LPCWSTR,LPWSTR,DWORD);
DLL BOOL WIN CreateDirectoryW(LPCWSTR,void*);
DLL HANDLE WIN CreateFileW(LPCWSTR,DWORD,DWORD,void*,DWORD,DWORD,HANDLE);
DLL BOOL WIN WriteFile(HANDLE,const void*,DWORD,DWORD*,void*);
DLL BOOL WIN CloseHandle(HANDLE);
DLL DWORD WIN GetModuleFileNameW(HMODULE,LPWSTR,DWORD);
DLL BOOL WIN CopyFileW(LPCWSTR,LPCWSTR,BOOL);
DLL BOOL WIN DeleteFileW(LPCWSTR);
DLL BOOL WIN RemoveDirectoryW(LPCWSTR);
DLL BOOL WIN MoveFileExW(LPCWSTR,LPCWSTR,DWORD);
DLL void WIN ExitProcess(DWORD);
DLL int WIN MessageBoxW(void*,LPCWSTR,LPCWSTR,UINT);
DLL HMODULE WIN GetModuleHandleW(LPCWSTR);
DLL void* WIN ShellExecuteW(void*,LPCWSTR,LPCWSTR,LPCWSTR,LPCWSTR,int);
DLL LPCWSTR WIN GetCommandLineW(void);
DLL LONG WIN RegCreateKeyExW(HANDLE,LPCWSTR,DWORD,LPWSTR,DWORD,DWORD,void*,HANDLE*,DWORD*);
DLL LONG WIN RegSetValueExW(HANDLE,LPCWSTR,DWORD,DWORD,const BYTE*,DWORD);
DLL LONG WIN RegCloseKey(HANDLE);
DLL LONG WIN RegDeleteTreeW(HANDLE,LPCWSTR);
DLL LONG WIN CoInitialize(LPVOID);
DLL LONG WIN CoCreateInstance(const void*,void*,DWORD,const void*,void**);
DLL void WIN CoUninitialize(void);
#include "payload.h"
static int wlen(const WCHAR*s){int i=0;if(s)while(s[i])i++;return i;}
static void wcpy(WCHAR*d,const WCHAR*s,int n){int i=0;if(!n)return;for(;i<n-1&&s&&s[i];i++)d[i]=s[i];d[i]=0;}
static void wcat(WCHAR*d,const WCHAR*s,int n){int i=wlen(d),j=0;while(s&&s[j]&&i<n-1)d[i++]=s[j++];d[i]=0;}
static void wjoin(WCHAR*d,int n,const WCHAR*a,const WCHAR*b){wcpy(d,a,n);wcat(d,b,n);}
static int contains(LPCWSTR s,LPCWSTR pattern){for(int i=0;s[i];i++){int j=0;while(pattern[j]&&s[i+j]==pattern[j])j++;if(!pattern[j])return 1;}return 0;}
typedef struct {unsigned long Data1; unsigned short Data2,Data3; unsigned char Data4[8];} GUID;
static const GUID CLSID_ShellLink={0x00021401,0,0,{0xc0,0,0,0,0,0,0,0x46}};
static const GUID IID_IShellLinkW={0x000214f9,0,0,{0xc0,0,0,0,0,0,0,0x46}};
static const GUID IID_IPersistFile={0x0000010b,0,0,{0xc0,0,0,0,0,0,0,0x46}};
typedef LONG(WIN*SL_SetPath)(void*,LPCWSTR);
typedef LONG(WIN*SL_QueryInterface)(void*,const GUID*,void**);
typedef unsigned long(WIN*SL_Release)(void*);
typedef LONG(WIN*SL_Save)(void*,LPCWSTR,BOOL);
static int makeShortcut(LPCWSTR shortcut,LPCWSTR exe,LPCWSTR dir){void**sl=0,**persist=0;int ok=0;if(CoInitialize(0)<0)return 0;if(CoCreateInstance(&CLSID_ShellLink,0,CLSCTX_INPROC_SERVER,&IID_IShellLinkW,(void**)&sl)==0){void**vt=(void**)*sl;((SL_SetPath)vt[20])(sl,exe);((SL_SetPath)vt[9])(sl,dir);((SL_SetPath)vt[7])(sl,L"PortDeck - Biblioteca de jogos");if(((SL_QueryInterface)vt[0])(sl,&IID_IPersistFile,(void**)&persist)==0){void**pvt=(void**)*persist;ok=((SL_Save)pvt[6])(persist,shortcut,1)==0;((SL_Release)pvt[2])(persist);}((SL_Release)vt[2])(sl);}CoUninitialize();return ok;}
static void regString(HANDLE key,LPCWSTR name,LPCWSTR data){RegSetValueExW(key,name,0,REG_SZ,(const BYTE*)data,(wlen(data)+1)*2);}
static void regDWORD(HANDLE key,LPCWSTR name,DWORD value){RegSetValueExW(key,name,0,REG_DWORD,(const BYTE*)&value,4);}
void WIN Main(void){WCHAR local[1024]={0},roaming[1024]={0},programs[1024]={0},folder[1024]={0},app[1024]={0},thisfile[1024]={0},uninst[1024]={0},startmenu[1024]={0},link[1024]={0},uninstCmd[2048]={0};GetEnvironmentVariableW(L"LOCALAPPDATA",local,1024);GetEnvironmentVariableW(L"APPDATA",roaming,1024);if(!local[0]||!roaming[0]){MessageBoxW(0,L"Nao foi possivel encontrar as pastas de usuario do Windows.",L"PortDeck Setup",MB_OK|MB_ICONERROR);ExitProcess(1);}wjoin(programs,1024,local,L"\\Programs");wjoin(folder,1024,programs,L"\\PortDeck");wjoin(app,1024,folder,L"\\PortDeck.exe");wjoin(uninst,1024,folder,L"\\Desinstalar PortDeck.exe");wjoin(startmenu,1024,roaming,L"\\Microsoft\\Windows\\Start Menu\\Programs");wjoin(link,1024,startmenu,L"\\PortDeck.lnk");GetModuleFileNameW(GetModuleHandleW(0),thisfile,1024);
 if(contains(GetCommandLineW(),L"/uninstall")){if(MessageBoxW(0,L"Remover o PortDeck deste computador? Os jogos nao serao apagados, e sua biblioteca salva em AppData sera preservada.",L"Desinstalar PortDeck",MB_YESNO|MB_ICONQUESTION)!=IDYES)ExitProcess(0);DeleteFileW(app);DeleteFileW(link);RegDeleteTreeW(HKEY_CURRENT_USER,L"Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PortDeck");MoveFileExW(uninst,0,MOVEFILE_DELAY_UNTIL_REBOOT);MessageBoxW(0,L"PortDeck desinstalado. Os jogos e a biblioteca pessoal foram preservados.",L"PortDeck",MB_OK|MB_ICONINFORMATION);ExitProcess(0);}
 if(MessageBoxW(0,L"Instalar o PortDeck 0.1.2 para este usuario?\n\n- Nao precisa de Python\n- Instalacao em AppData\\Local\\Programs\\PortDeck\n- Cria atalho no menu Iniciar\n- Biblioteca e jogos pessoais nao sao apagados\n\nDeseja continuar?",L"PortDeck Setup | Windows 64 bits",MB_YESNO|MB_ICONQUESTION)!=IDYES)ExitProcess(0);
 CreateDirectoryW(programs,0);CreateDirectoryW(folder,0);
 HANDLE out=CreateFileW(app,GENERIC_WRITE,0,0,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,0);if(out==INVALID_HANDLE_VALUE){MessageBoxW(0,L"Nao consegui criar PortDeck.exe. Feche o aplicativo e tente novamente.",L"PortDeck Setup",MB_ICONERROR);ExitProcess(1);}DWORD wrote=0;BOOL ok=WriteFile(out,embeddedExe,embeddedExeSize,&wrote,0);CloseHandle(out);if(!ok||wrote!=embeddedExeSize){MessageBoxW(0,L"Falha ao gravar o aplicativo.",L"PortDeck Setup",MB_ICONERROR);ExitProcess(2);}CopyFileW(thisfile,uninst,0);makeShortcut(link,app,folder);
 HANDLE key=0;DWORD disp=0;if(RegCreateKeyExW(HKEY_CURRENT_USER,L"Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PortDeck",0,0,REG_OPTION_NON_VOLATILE,KEY_ALL_ACCESS,0,&key,&disp)==0){regString(key,L"DisplayName",L"PortDeck");regString(key,L"DisplayVersion",L"0.1.2");regString(key,L"Publisher",L"PortDeck (projeto independente)");regString(key,L"InstallLocation",folder);regString(key,L"DisplayIcon",app);wcpy(uninstCmd,L"\"",2048);wcat(uninstCmd,uninst,2048);wcat(uninstCmd,L"\" /uninstall",2048);regString(key,L"UninstallString",uninstCmd);regDWORD(key,L"NoModify",1);regDWORD(key,L"NoRepair",1);RegCloseKey(key);}
 MessageBoxW(0,L"PortDeck instalado!\n\nAbra pelo menu Iniciar ou clique OK para abrir agora.\n\nPara desinstalar: Configuracoes > Aplicativos > PortDeck.",L"PortDeck Setup",MB_OK|MB_ICONINFORMATION);ShellExecuteW(0,L"open",app,0,folder,SW_SHOWNORMAL);ExitProcess(0);
}
