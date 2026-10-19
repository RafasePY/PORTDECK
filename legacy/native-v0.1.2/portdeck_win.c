/* PortDeck Native - lightweight Windows launcher; self contained, no CRT. */
typedef unsigned char BYTE;
typedef unsigned short WORD;
typedef unsigned int UINT;
typedef unsigned long DWORD;
typedef long LONG;
typedef long long INT64;
typedef unsigned long long UINT64;
typedef long long LONG_PTR;
typedef unsigned long long ULONG_PTR;
typedef ULONG_PTR WPARAM;
typedef LONG_PTR LPARAM;
typedef LONG_PTR LRESULT;
typedef int BOOL;
typedef unsigned short WCHAR;
typedef void* HANDLE;
typedef HANDLE HWND;
typedef HANDLE HINSTANCE;
typedef unsigned long long UINT_PTR;
typedef HANDLE HDC;
typedef HANDLE HBRUSH;
typedef HANDLE HFONT;
typedef HANDLE HGDIOBJ;
typedef HANDLE HICON;
typedef HANDLE HMODULE;
typedef const WCHAR* LPCWSTR;
typedef WCHAR* LPWSTR;
typedef const void* LPCVOID;
typedef void* LPVOID;
#define WIN __stdcall
#define DLL __declspec(dllimport)
#define CALLBACK __stdcall
#define TRUE 1
#define FALSE 0
#define NULL ((void*)0)
#define MAXPATH 1024
#define W(x) ((const WCHAR*)L##x)
#define WS_VISIBLE 0x10000000U
#define WS_CHILD 0x40000000U
#define WS_POPUP 0x80000000U
#define WS_CAPTION 0x00C00000U
#define WS_SYSMENU 0x00080000U
#define WS_MINIMIZEBOX 0x00020000U
#define WS_MAXIMIZEBOX 0x00010000U
#define WS_THICKFRAME 0x00040000U
#define WS_OVERLAPPEDWINDOW 0x00CF0000U
#define WS_TABSTOP 0x00010000U
#define WS_BORDER 0x00800000U
#define ES_AUTOHSCROLL 0x0080
#define BS_DEFPUSHBUTTON 1
#define CW_USEDEFAULT ((int)0x80000000)
#define SW_SHOW 5
#define SW_MAXIMIZE 3
#define SW_RESTORE 9
#define SW_HIDE 0
#define WM_CREATE 1
#define WM_DESTROY 2
#define WM_SIZE 5
#define WM_PAINT 15
#define WM_CLOSE 16
#define WM_KEYDOWN 0x100
#define WM_COMMAND 0x111
#define WM_TIMER 0x113
#define WM_LBUTTONDOWN 0x201
#define WM_LBUTTONDBLCLK 0x203
#define WM_ERASEBKGND 20
#define WM_NCCREATE 0x81
#define WM_SETFONT 0x30
#define WM_SETICON 0x80
#define VK_LEFT 0x25
#define VK_RIGHT 0x27
#define VK_RETURN 13
#define VK_ESCAPE 27
#define VK_F2 0x71
#define VK_F11 0x7A
#define VK_DELETE 0x2E
#define VK_CONTROL 0x11
#define CS_DBLCLKS 8
#define DT_LEFT 0
#define DT_CENTER 1
#define DT_RIGHT 2
#define DT_VCENTER 4
#define DT_SINGLELINE 32
#define DT_END_ELLIPSIS 0x8000
#define TRANSPARENT 1
#define GWLP_USERDATA -21
#define GWL_STYLE -16
#define OFN_FILEMUSTEXIST 0x1000
#define OFN_PATHMUSTEXIST 0x800
#define OFN_EXPLORER 0x80000
#define OPEN_EXISTING 3
#define CREATE_ALWAYS 2
#define OPEN_ALWAYS 4
#define FILE_APPEND_DATA 0x00000004U
#define FILE_READ_ATTRIBUTES 0x00000080U
#define FILE_ATTRIBUTE_NORMAL 0x80
#define FILE_ATTRIBUTE_DIRECTORY 0x10
#define INVALID_HANDLE_VALUE ((HANDLE)-1)
#define FILE_SHARE_READ 1
#define GENERIC_READ 0x80000000U
#define GENERIC_WRITE 0x40000000U
#define MB_OK 0
#define MB_ICONERROR 0x10
#define MB_ICONINFORMATION 0x40
#define MB_YESNO 4
#define MB_ICONQUESTION 0x20
#define IDYES 6
#define WM_USER 0x400
#define XINPUT_A 0x1000
#define XINPUT_B 0x2000
#define XINPUT_X 0x4000
#define XINPUT_Y 0x8000
#define XINPUT_START 0x0010
#define XINPUT_DPAD_LEFT 0x0004
#define XINPUT_DPAD_RIGHT 0x0008
#define BI_RGB 0
#define COLOR(r,g,b) ((DWORD)(((BYTE)(r))|((WORD)((BYTE)(g))<<8)|((DWORD)(BYTE)(b)<<16)))

typedef struct {LONG left,top,right,bottom;} RECT;
typedef struct {LONG x,y;} POINT;
typedef struct {UINT cbSize; UINT style; LONG_PTR lpfnWndProc; int cbClsExtra,cbWndExtra; HINSTANCE hInstance; HICON hIcon; HANDLE hCursor; HBRUSH hbrBackground; LPCWSTR lpszMenuName,lpszClassName; HICON hIconSm;} WNDCLASSEXW;
typedef struct {HWND hwnd;UINT message;WPARAM wParam;LPARAM lParam;DWORD time;POINT pt;DWORD lPrivate;} MSG;
typedef struct {HDC hdc;BOOL fErase;RECT rcPaint;BOOL fRestore;BOOL fIncUpdate;BYTE rgbReserved[32];} PAINTSTRUCT;
/* Win32 STARTUPINFOW: preserve every field and its documented x64 layout. */
typedef struct {
    DWORD cb;
    LPWSTR lpReserved;
    LPWSTR lpDesktop;
    LPWSTR lpTitle;
    DWORD dwX, dwY, dwXSize, dwYSize, dwXCountChars, dwYCountChars;
    DWORD dwFillAttribute;
    DWORD dwFlags;
    WORD wShowWindow, cbReserved2;
    BYTE *lpReserved2;
    HANDLE hStdInput, hStdOutput, hStdError;
} STARTUPINFOW;
_Static_assert(sizeof(STARTUPINFOW)==104, "STARTUPINFOW must be 104 bytes on Windows x64");
_Static_assert(__builtin_offsetof(STARTUPINFOW,dwFlags)==60, "STARTUPINFOW dwFlags offset mismatch");
typedef struct {HANDLE hProcess,hThread;DWORD dwProcessId,dwThreadId;} PROCESS_INFORMATION;
typedef struct {DWORD lStructSize;HWND hwndOwner;HINSTANCE hInstance;LPCWSTR lpstrFilter;LPWSTR lpstrCustomFilter;DWORD nMaxCustFilter;DWORD nFilterIndex;LPWSTR lpstrFile;DWORD nMaxFile;LPWSTR lpstrFileTitle;DWORD nMaxFileTitle;LPCWSTR lpstrInitialDir;LPCWSTR lpstrTitle;DWORD Flags;WORD nFileOffset;WORD nFileExtension;LPCWSTR lpstrDefExt;LPARAM lCustData;void* lpfnHook;LPCWSTR lpTemplateName;void* pvReserved;DWORD dwReserved;DWORD FlagsEx;} OPENFILENAMEW;
typedef struct {WORD wButtons;BYTE bLeftTrigger,bRightTrigger;short sThumbLX,sThumbLY,sThumbRX,sThumbRY;} XINPUT_GAMEPAD;
typedef struct {DWORD dwPacketNumber;XINPUT_GAMEPAD Gamepad;} XINPUT_STATE;

typedef LRESULT (CALLBACK *WNDPROC)(HWND,UINT,WPARAM,LPARAM);
DLL HWND WIN CreateWindowExW(DWORD,LPCWSTR,LPCWSTR,DWORD,int,int,int,int,HWND,HANDLE,HINSTANCE,LPVOID);
DLL unsigned short WIN RegisterClassExW(const WNDCLASSEXW*);
DLL LRESULT WIN DefWindowProcW(HWND,UINT,WPARAM,LPARAM);
DLL BOOL WIN DestroyWindow(HWND);
DLL BOOL WIN ShowWindow(HWND,int);
DLL BOOL WIN UpdateWindow(HWND);
DLL BOOL WIN GetMessageW(MSG*,HWND,UINT,UINT);
DLL BOOL WIN TranslateMessage(const MSG*);
DLL LRESULT WIN DispatchMessageW(const MSG*);
DLL void WIN PostQuitMessage(int);
DLL BOOL WIN InvalidateRect(HWND,const RECT*,BOOL);
DLL BOOL WIN GetClientRect(HWND,RECT*);
DLL BOOL WIN SetWindowTextW(HWND,LPCWSTR);
DLL int WIN GetWindowTextW(HWND,LPWSTR,int);
DLL int WIN MessageBoxW(HWND,LPCWSTR,LPCWSTR,UINT);
DLL HANDLE WIN LoadCursorW(HINSTANCE,LPCWSTR);
DLL HANDLE WIN LoadIconW(HINSTANCE,LPCWSTR);
DLL HDC WIN BeginPaint(HWND,PAINTSTRUCT*);
DLL BOOL WIN EndPaint(HWND,const PAINTSTRUCT*);
DLL BOOL WIN FillRect(HDC,const RECT*,HBRUSH);
DLL BOOL WIN RoundRect(HDC,int,int,int,int,int,int);
DLL BOOL WIN Rectangle(HDC,int,int,int,int);
DLL BOOL WIN DrawTextW(HDC,LPCWSTR,int,RECT*,UINT);
DLL int WIN SetBkMode(HDC,int);
DLL DWORD WIN SetTextColor(HDC,DWORD);
DLL HGDIOBJ WIN SelectObject(HDC,HGDIOBJ);
DLL BOOL WIN DeleteObject(HGDIOBJ);
DLL HBRUSH WIN CreateSolidBrush(DWORD);
DLL HFONT WIN CreateFontW(int,int,int,int,int,DWORD,DWORD,DWORD,DWORD,DWORD,DWORD,DWORD,DWORD,LPCWSTR);
DLL HWND WIN SetFocus(HWND);
DLL short WIN GetKeyState(int);
DLL UINT_PTR WIN SetTimer(HWND,UINT_PTR,UINT,void*);
DLL BOOL WIN KillTimer(HWND,UINT_PTR);
DLL LONG_PTR WIN SetWindowLongPtrW(HWND,int,LONG_PTR);
DLL BOOL WIN MoveWindow(HWND,int,int,int,int,BOOL);
DLL int WIN GetSystemMetrics(int);
DLL BOOL WIN GetWindowRect(HWND,RECT*);
DLL HICON WIN ExtractIconW(HINSTANCE,LPCWSTR,UINT);
DLL BOOL WIN DrawIconEx(HDC,int,int,HICON,int,int,UINT,HBRUSH,UINT);
DLL BOOL WIN DestroyIcon(HICON);
DLL BOOL WIN GetCursorPos(POINT*);
DLL DWORD WIN GetEnvironmentVariableW(LPCWSTR,LPWSTR,DWORD);
DLL BOOL WIN CreateDirectoryW(LPCWSTR,void*);
DLL HANDLE WIN CreateFileW(LPCWSTR,DWORD,DWORD,void*,DWORD,DWORD,HANDLE);
DLL BOOL WIN ReadFile(HANDLE,void*,DWORD,DWORD*,void*);
DLL BOOL WIN WriteFile(HANDLE,const void*,DWORD,DWORD*,void*);
DLL BOOL WIN CloseHandle(HANDLE);
DLL DWORD WIN GetFileSize(HANDLE,DWORD*);
DLL DWORD WIN GetFileAttributesW(LPCWSTR);
DLL BOOL WIN CreateProcessW(LPCWSTR,LPWSTR,void*,void*,BOOL,DWORD,void*,LPCWSTR,STARTUPINFOW*,PROCESS_INFORMATION*);
DLL DWORD WIN WaitForSingleObject(HANDLE,DWORD);
DLL UINT64 WIN GetTickCount64(void);
DLL HMODULE WIN LoadLibraryW(LPCWSTR);
DLL void* WIN GetProcAddress(HMODULE,const char*);
DLL HMODULE WIN GetModuleHandleW(LPCWSTR);
DLL BOOL WIN FreeLibrary(HMODULE);
DLL void WIN ExitProcess(UINT);
DLL HANDLE WIN GetProcessHeap(void);
DLL void* WIN HeapAlloc(HANDLE,DWORD,ULONG_PTR);
DLL BOOL WIN HeapFree(HANDLE,DWORD,void*);
DLL BOOL WIN GetModuleFileNameW(HMODULE,LPWSTR,DWORD);
DLL BOOL WIN DeleteFileW(LPCWSTR);
DLL BOOL WIN CopyFileW(LPCWSTR,LPCWSTR,BOOL);
DLL BOOL WIN RemoveDirectoryW(LPCWSTR);
DLL BOOL WIN SetCurrentDirectoryW(LPCWSTR);
DLL BOOL WIN GetExitCodeProcess(HANDLE,DWORD*);
DLL DWORD WIN GetLastError(void);
typedef struct {WORD year,month,dayOfWeek,day,hour,minute,second,milliseconds;} SYSTEMTIME;
DLL void WIN GetLocalTime(SYSTEMTIME*);
DLL int WIN GetWindowTextLengthW(HWND);
DLL BOOL WIN GetOpenFileNameW(OPENFILENAMEW*);
DLL void* WIN ShellExecuteW(HWND,LPCWSTR,LPCWSTR,LPCWSTR,LPCWSTR,int);
DLL HANDLE WIN CreateCompatibleDC(HDC);
DLL BOOL WIN DeleteDC(HDC);

static int wlen(const WCHAR*s){int i=0;if(s)while(s[i])i++;return i;}
static void wcpy(WCHAR*d,const WCHAR*s,int cap){int i=0;if(!cap)return;if(s)for(;i<cap-1&&s[i];i++)d[i]=s[i];d[i]=0;}
static void wcat(WCHAR*d,const WCHAR*s,int cap){int i=wlen(d),j=0;if(!s)return;while(i<cap-1&&s[j])d[i++]=s[j++];d[i]=0;}
static void wnum(WCHAR*d,UINT64 n){WCHAR tmp[32];int i=0,j=0;if(!n){d[0]='0';d[1]=0;return;}while(n){tmp[i++]=(WCHAR)('0'+n%10);n/=10;}while(i)d[j++]=tmp[--i];d[j]=0;}
static UINT64 watou(const WCHAR*s){UINT64 v=0;while(*s>='0'&&*s<='9'){v=v*10+(*s-'0');s++;}return v;}
static int weq(const WCHAR*a,const WCHAR*b){int i=0;while(a[i]&&a[i]==b[i])i++;return a[i]==b[i];}
static void wsanitize(WCHAR*s){for(int i=0;s[i];i++){if(s[i]=='\n'||s[i]=='\r'||s[i]=='\t')s[i]=' ';}}
static void wjoin(WCHAR*d,int n,const WCHAR*a,const WCHAR*b){wcpy(d,a,n);wcat(d,b,n);}
static void wdir(WCHAR*s){int i=wlen(s)-1;while(i>=0&&s[i]!='\\'&&s[i]!='/')i--;if(i>=0)s[i]=0;}
static void wbase(WCHAR*d,const WCHAR*p){int k=0;for(int i=0;p[i];i++)if(p[i]=='\\'||p[i]=='/')k=i+1;wcpy(d,p+k,160);int l=wlen(d);if(l>4 && d[l-4]=='.'&&(d[l-3]=='e'||d[l-3]=='E')&&(d[l-2]=='x'||d[l-2]=='X'))d[l-4]=0;}
static void fmtTime(WCHAR*out,UINT64 seconds){WCHAR a[40],b[40];wnum(a,seconds/3600);wnum(b,(seconds%3600)/60);wcpy(out,a,80);wcat(out,L"h ",80);wcat(out,b,80);wcat(out,L"min",80);}
static void drawText(HDC dc,LPCWSTR txt,int x,int y,int w,int h,int sz,int bold,DWORD col,UINT align);
static HFONT fonts[7];
#define MAXGAMES 128
#define STR 1024
typedef struct {WCHAR title[160],exe[STR],args[512],work[STR],config[STR],cover[STR],fps[24];UINT64 played;} Game;
static Game games[MAXGAMES];
static int ng=0,selected=0,fullscreen=1;
static WCHAR datapath[MAXPATH],libpath[MAXPATH],logpath[MAXPATH],ctlLabel[128];
static HWND mainWindow=NULL, editDialog=NULL;
static HINSTANCE inst;
static HANDLE process=NULL;
static int runningIndex=-1;
static UINT64 sessionTick=0,lastSaveTick=0;
static DWORD colors[6]={0x906c3e,0x697039,0x6c526a,0x87773f,0x4b6786,0x754f72};
static DWORD bg=0x17120f, panel=0x221b17, primary=0xe5b16b, white=0xf6f2ee, muted=0xb1a49a;
static int clientW=1280,clientH=720,cardLeft=58,cardTop=240,cardW=194,cardH=266,cardGap=22,visible=5,firstCard=0;
static HMODULE gdiplus=NULL,xmod=NULL;
typedef DWORD (WIN *GdiplusStartupFn)(UINT_PTR*,const void*,void*);
typedef DWORD (WIN *GdipCreateFromHDCFn)(HDC,void**);
typedef DWORD (WIN *GdipLoadImageFromFileFn)(LPCWSTR,void**);
typedef DWORD (WIN *GdipDrawImageRectIFn)(void*,void*,int,int,int,int);
typedef DWORD (WIN *GdipDisposeImageFn)(void*);
typedef DWORD (WIN *GdipDeleteGraphicsFn)(void*);
static GdipCreateFromHDCFn gdCreate;static GdipLoadImageFromFileFn gdLoad;static GdipDrawImageRectIFn gdDraw;static GdipDisposeImageFn gdDispose;static GdipDeleteGraphicsFn gdDelete;static UINT_PTR gdToken=0;
typedef DWORD (WIN*XInputGetStateFn)(DWORD,XINPUT_STATE*);
static XInputGetStateFn getPad=NULL;static WORD prevbuttons=0;
static void makePaths(void){WCHAR root[MAXPATH]={0};GetEnvironmentVariableW(L"APPDATA",root,MAXPATH);if(!root[0])wcpy(root,L".",MAXPATH);wjoin(datapath,MAXPATH,root,L"\\PortDeck");CreateDirectoryW(datapath,0);wjoin(libpath,MAXPATH,datapath,L"\\native_library.tsv");wjoin(logpath,MAXPATH,datapath,L"\\portdeck_debug.txt");}
/* Diagnostic trace; UTF-16 so Unicode game paths remain readable in Notepad. */
static void trace(LPCWSTR message) {
    HANDLE file=CreateFileW(logpath,FILE_APPEND_DATA|FILE_READ_ATTRIBUTES,FILE_SHARE_READ,0,OPEN_ALWAYS,FILE_ATTRIBUTE_NORMAL,0);
    if(file==INVALID_HANDLE_VALUE)return;
    DWORD done=0;
    if(GetFileSize(file,0)==0){WORD bom=0xfeff;WriteFile(file,&bom,sizeof(bom),&done,0);}
    SYSTEMTIME t={0};GetLocalTime(&t);
    WCHAR line[3500]={0},n[32];
    wcpy(line,L"[",3500);
    wnum(n,t.year);wcat(line,n,3500);wcat(line,L"-",3500);
    if(t.month<10)wcat(line,L"0",3500);wnum(n,t.month);wcat(line,n,3500);wcat(line,L"-",3500);
    if(t.day<10)wcat(line,L"0",3500);wnum(n,t.day);wcat(line,n,3500);wcat(line,L" ",3500);
    if(t.hour<10)wcat(line,L"0",3500);wnum(n,t.hour);wcat(line,n,3500);wcat(line,L":",3500);
    if(t.minute<10)wcat(line,L"0",3500);wnum(n,t.minute);wcat(line,n,3500);wcat(line,L":",3500);
    if(t.second<10)wcat(line,L"0",3500);wnum(n,t.second);wcat(line,n,3500);wcat(line,L"] ",3500);
    wcat(line,message,3500);wcat(line,L"\r\n",3500);
    WriteFile(file,line,wlen(line)*sizeof(WCHAR),&done,0);
    CloseHandle(file);
}
static void traceField(LPCWSTR field,LPCWSTR value) {
    WCHAR line[3200]={0};wcpy(line,field,3200);wcat(line,value?value:L"",3200);trace(line);
}
static void traceError(LPCWSTR text,DWORD error) {
    WCHAR msg[320]={0},code[32]={0};wcpy(msg,text,320);wcat(msg,L" (Win32: ",320);
    wnum(code,error);wcat(msg,code,320);wcat(msg,L")",320);trace(msg);
}
static void save(void){HANDLE file=CreateFileW(libpath,GENERIC_WRITE,0,0,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,0);if(file==INVALID_HANDLE_VALUE)return;WORD bom=0xfeff;DWORD done=0;WriteFile(file,&bom,2,&done,0);for(int i=0;i<ng;i++){Game*g=&games[i];WCHAR line[7600]={0},buf[64];wcpy(line,g->title,7600);wcat(line,L"\t",7600);wcat(line,g->exe,7600);wcat(line,L"\t",7600);wcat(line,g->args,7600);wcat(line,L"\t",7600);wcat(line,g->work,7600);wcat(line,L"\t",7600);wcat(line,g->config,7600);wcat(line,L"\t",7600);wcat(line,g->cover,7600);wcat(line,L"\t",7600);wcat(line,g->fps,7600);wcat(line,L"\t",7600);wnum(buf,g->played);wcat(line,buf,7600);wcat(line,L"\r\n",7600);WriteFile(file,line,wlen(line)*2,&done,0);}CloseHandle(file);}
static void load(void){HANDLE f=CreateFileW(libpath,GENERIC_READ,FILE_SHARE_READ,0,OPEN_EXISTING,FILE_ATTRIBUTE_NORMAL,0);if(f==INVALID_HANDLE_VALUE)return;DWORD bytes=GetFileSize(f,0);if(bytes>2097150||bytes<2){CloseHandle(f);return;}WCHAR *buf=(WCHAR*)HeapAlloc(GetProcessHeap(),8,(ULONG_PTR)bytes+4);if(!buf){CloseHandle(f);return;}DWORD done=0;ReadFile(f,buf,bytes,&done,0);CloseHandle(f);buf[done/2]=0;int start=buf[0]==0xfeff?1:0;while(buf[start]&&ng<MAXGAMES){WCHAR*line=buf+start;int columns=0;WCHAR*fields[8]={line};int i=start;while(buf[i]&&buf[i]!='\r'&&buf[i]!='\n'){if(buf[i]=='\t'&&columns<7){buf[i]=0;fields[++columns]=buf+i+1;}i++;}if(buf[i]){buf[i++]=0;while(buf[i]=='\r'||buf[i]=='\n')i++;}if(columns==7&&fields[0][0]&&fields[1][0]){Game*g=&games[ng++];wcpy(g->title,fields[0],160);wcpy(g->exe,fields[1],STR);wcpy(g->args,fields[2],512);wcpy(g->work,fields[3],STR);wcpy(g->config,fields[4],STR);wcpy(g->cover,fields[5],STR);wcpy(g->fps,fields[6],24);g->played=watou(fields[7]);}start=i;}HeapFree(GetProcessHeap(),0,buf);}
static void initGdi(void){gdiplus=LoadLibraryW(L"gdiplus.dll");if(gdiplus){GdiplusStartupFn fn=(GdiplusStartupFn)GetProcAddress(gdiplus,"GdiplusStartup");gdCreate=(GdipCreateFromHDCFn)GetProcAddress(gdiplus,"GdipCreateFromHDC");gdLoad=(GdipLoadImageFromFileFn)GetProcAddress(gdiplus,"GdipLoadImageFromFile");gdDraw=(GdipDrawImageRectIFn)GetProcAddress(gdiplus,"GdipDrawImageRectI");gdDispose=(GdipDisposeImageFn)GetProcAddress(gdiplus,"GdipDisposeImage");gdDelete=(GdipDeleteGraphicsFn)GetProcAddress(gdiplus,"GdipDeleteGraphics");struct {DWORD version;void* callback;BOOL a,b;} input={1,0,0,0};if(fn)fn(&gdToken,&input,0);}}
static void drawCover(HDC dc,const WCHAR*path,int x,int y,int w,int h){if(!path[0]||!gdCreate||!gdLoad||!gdDraw)return;void*graph=0,*img=0;if(gdCreate(dc,&graph)==0){if(gdLoad(path,&img)==0){gdDraw(graph,img,x,y,w,h);gdDispose(img);}gdDelete(graph);}}
static void initPad(void){const WCHAR* names[]={L"xinput1_4.dll",L"xinput1_3.dll",L"xinput9_1_0.dll"};for(int i=0;i<3;i++){xmod=LoadLibraryW(names[i]);if(xmod){getPad=(XInputGetStateFn)GetProcAddress(xmod,"XInputGetState");if(getPad)break;FreeLibrary(xmod);xmod=NULL;}}wcpy(ctlLabel,L"Teclado / mouse",128);}
static void launch(const WCHAR*exe,const WCHAR*args,const WCHAR*dir,int track) {
    if(!exe||!exe[0])return;
    trace(track?L"Botao JOGAR acionado":L"Abrir configurador externo acionado");
    traceField(L"Executavel: ",exe);
    traceField(L"Parametros: ",args);
    if(GetFileAttributesW(exe)==0xffffffffU){
        DWORD err=GetLastError();traceError(L"Executavel nao encontrado",err);
        MessageBoxW(mainWindow,L"O executavel nao foi encontrado. Abra CONFIGURAR e corrija o caminho.",L"PortDeck",MB_OK|MB_ICONERROR);return;
    }
    if(track&&process){
        trace(L"Nao abriu: ja ha uma sessao em execucao");
        MessageBoxW(mainWindow,L"Ja existe uma sessao em execucao. Feche o jogo antes de iniciar outro.",L"PortDeck",MB_OK|MB_ICONINFORMATION);return;
    }
    WCHAR cmd[2800]={0};wcpy(cmd,L"\"",2800);wcat(cmd,exe,2800);wcat(cmd,L"\"",2800);
    if(args&&args[0]){wcat(cmd,L" ",2800);wcat(cmd,args,2800);}
    STARTUPINFOW si={0}; PROCESS_INFORMATION pi={0};
    si.cb=sizeof(si); /* The old build supplied a truncated STARTUPINFOW and could crash at CreateProcessW. */
    WCHAR working[STR]={0};wcpy(working,dir,STR);
    if(!working[0]){wcpy(working,exe,STR);wdir(working);}
    traceField(L"Pasta de trabalho: ",working);
    BOOL success=CreateProcessW(exe,cmd,0,0,FALSE,0,0,working[0]?working:0,&si,&pi);
    if(!success){
        DWORD err=GetLastError();traceError(L"CreateProcessW falhou",err);
        WCHAR info[512]={0},num[32]={0};
        wcpy(info,L"Nao foi possivel iniciar este jogo. Erro do Windows: ",512);
        wnum(num,err);wcat(info,num,512);
        wcat(info,L".\n\nVeja o arquivo portdeck_debug.txt em %APPDATA%\\PortDeck para diagnosticar.",512);
        MessageBoxW(mainWindow,info,L"PortDeck - falha ao iniciar",MB_OK|MB_ICONERROR);
        return;
    }
    trace(L"CreateProcessW executado com sucesso");
    CloseHandle(pi.hThread);
    if(track){process=pi.hProcess;runningIndex=selected;sessionTick=GetTickCount64();lastSaveTick=sessionTick;}
    else CloseHandle(pi.hProcess);
    InvalidateRect(mainWindow,0,0);
}
static void play(void){if(ng&&selected<ng)launch(games[selected].exe,games[selected].args,games[selected].work,1);}
static void runConfigExe(void){if(ng&&games[selected].config[0])launch(games[selected].config,L"",games[selected].work,0);else MessageBoxW(mainWindow,L"Nao ha configurador externo cadastrado neste perfil.",L"PortDeck",MB_OK|MB_ICONINFORMATION);}
static void updateProcess(void){if(!process)return;UINT64 now=GetTickCount64(),passed=(now-sessionTick)/1000;if(runningIndex>=0&&runningIndex<ng){if(passed>0){games[runningIndex].played+=passed;sessionTick+=passed*1000;}}if(now-lastSaveTick>=15000){save();lastSaveTick=now;}if(WaitForSingleObject(process,0)==0){DWORD gameExit=0;GetExitCodeProcess(process,&gameExit);traceError(L"Processo do jogo encerrou com codigo",gameExit);CloseHandle(process);process=NULL;runningIndex=-1;save();}InvalidateRect(mainWindow,0,0);}
static DWORD cdark(int n){return colors[n%6];}
static void fill(HDC dc,int l,int t,int r,int b,DWORD col){RECT rr={l,t,r,b};HBRUSH br=CreateSolidBrush(col);FillRect(dc,&rr,br);DeleteObject(br);}
static void textDraw(HDC dc,LPCWSTR s,int x,int y,int w,int h,int font,DWORD col,UINT flags){RECT rr={x,y,x+w,y+h};SelectObject(dc,fonts[font]);SetTextColor(dc,col);SetBkMode(dc,TRANSPARENT);DrawTextW(dc,s,-1,&rr,flags|DT_END_ELLIPSIS);}
static void drawButton(HDC dc,int x,int y,int w,int h,LPCWSTR s,int accent){fill(dc,x,y,x+w,y+h,accent?primary:0x362c25);textDraw(dc,s,x+8,y+2,w-16,h-4,1,accent?0x21140d:white,DT_CENTER|DT_VCENTER|DT_SINGLELINE);}
static void repaint(HWND w,HDC dc){RECT rc;GetClientRect(w,&rc);clientW=rc.right;clientH=rc.bottom;fill(dc,0,0,clientW,clientH,bg);fill(dc,0,0,clientW,104,0x241b16);textDraw(dc,L"PORT",42,29,128,50,4,white,DT_LEFT|DT_SINGLELINE);textDraw(dc,L"DECK",168,29,150,50,4,primary,DT_LEFT|DT_SINGLELINE);textDraw(dc,L"BIBLIOTECA DE PORTS  /  WINDOWS  v0.1.2",43,82,430,20,0,muted,DT_LEFT|DT_SINGLELINE);textDraw(dc,ctlLabel,clientW-400,34,350,30,1,primary,DT_RIGHT|DT_SINGLELINE);fill(dc,40,124,clientW-40,126,0x372a20);
 int buttonsY=clientH-92;if(buttonsY<540)buttonsY=540;
 textDraw(dc,L"SUA BIBLIOTECA",58,156,450,48,3,white,DT_LEFT|DT_SINGLELINE);
 WCHAR total[48],inf[150];wnum(total,ng);wcpy(inf,total,150);wcat(inf,ng==1?L" PORT":L" PORTS",150);textDraw(dc,inf,clientW-240,170,190,24,1,muted,DT_RIGHT|DT_SINGLELINE);
 cardLeft=58;cardTop=232;cardGap=20;cardW=192;cardH=258;visible=(clientW-100+cardGap)/(cardW+cardGap);if(visible<1)visible=1;if(visible>8)visible=8;
 if(selected<firstCard)firstCard=selected;if(selected>=firstCard+visible)firstCard=selected-visible+1;
 if(!ng){fill(dc,58,231,clientW-58,482,panel);textDraw(dc,L"Sua colecao comeca aqui",96,290,clientW-190,60,3,white,DT_CENTER|DT_VCENTER|DT_SINGLELINE);textDraw(dc,L"Selecione ADICIONAR PORT para cadastrar o primeiro jogo .exe",96,357,clientW-190,40,1,muted,DT_CENTER|DT_VCENTER|DT_SINGLELINE);}
 for(int j=0;j<visible&&j+firstCard<ng;j++){int i=j+firstCard,x=cardLeft+j*(cardW+cardGap),y=cardTop;Game*g=&games[i];int sel=i==selected;fill(dc,x-4,y-4,x+cardW+4,y+cardH+52,sel?primary:0x362b26);fill(dc,x,y,x+cardW,y+cardH,cdark(i));drawCover(dc,g->cover,x+2,y+2,cardW-4,cardH-4);if(!g->cover[0]){WCHAR abbrev[3]={'P','D',0};if(g->title[0])abbrev[0]=g->title[0];if(g->title[1])abbrev[1]=g->title[1];textDraw(dc,abbrev,x+20,y+85,cardW-40,75,5,white,DT_CENTER|DT_VCENTER|DT_SINGLELINE);}fill(dc,x,y+cardH-40,x+cardW,y+cardH,0x281e1a);WCHAR dur[80];fmtTime(dur,g->played);textDraw(dc,dur,x+8,y+cardH-31,cardW-16,22,0,white,DT_CENTER|DT_SINGLELINE);fill(dc,x,y+cardH+3,x+cardW,y+cardH+47,sel?0x352518:panel);textDraw(dc,g->title,x+7,y+cardH+9,cardW-14,35,1,sel?primary:white,DT_CENTER|DT_VCENTER|DT_SINGLELINE);}
 if(ng){Game*g=&games[selected];WCHAR info[256]={0},dur[80]={0};fmtTime(dur,g->played);wcpy(info,L"TEMPO JOGADO: ",256);wcat(info,dur,256);if(g->fps[0]){wcat(info,L"     |     FPS REF.: ",256);wcat(info,g->fps,256);}textDraw(dc,info,58,cardTop+cardH+72,clientW-115,36,1,muted,DT_LEFT|DT_SINGLELINE);}
 drawButton(dc,58,buttonsY,232,54,L"+ ADICIONAR PORT",0);drawButton(dc,310,buttonsY,200,54,L"JOGAR",1);drawButton(dc,530,buttonsY,205,54,L"CONFIGURAR",0);drawButton(dc,755,buttonsY,184,54,L"REMOVER",0);if(process)textDraw(dc,L"EM JOGO",clientW-247,buttonsY+16,197,30,1,primary,DT_RIGHT|DT_SINGLELINE);textDraw(dc,L"A / ENTER  Jogar    X / F2  Configurar    Y / Ctrl+N  Adicionar    F11  Tela cheia",58,clientH-28,clientW-100,22,0,muted,DT_LEFT|DT_SINGLELINE);
}
static int filePicker(HWND owner,WCHAR*dst,LPCWSTR title,int covers){OPENFILENAMEW f={0};f.lStructSize=sizeof(f);f.hwndOwner=owner;f.lpstrFile=dst;f.nMaxFile=STR;f.lpstrTitle=title;f.lpstrFilter=covers?L"Capas (*.png;*.jpg;*.bmp)\0*.png;*.jpg;*.jpeg;*.bmp\0Todos os arquivos\0*.*\0\0":L"Executaveis (*.exe)\0*.exe\0Todos os arquivos\0*.*\0\0";f.Flags=OFN_FILEMUSTEXIST|OFN_PATHMUSTEXIST|OFN_EXPLORER;return GetOpenFileNameW(&f);}
static HWND ctrls[7];
#define CID_BASE 100
#define CID_SAVE 300
#define CID_CANCEL 301
#define CID_PICKEXE 302
#define CID_PICKCONFIG 303
#define CID_PICKCOVER 304
#define CID_RUNCONFIG 305
static Game draft;
static const WCHAR* labels[7]={L"Nome",L"Executavel do jogo (.exe)",L"Argumentos de inicializacao",L"Pasta de trabalho (opcional)",L"Configurador separado (.exe, opcional)",L"Imagem da capa (.png / .jpg / .bmp)",L"FPS de referencia (nao limita FPS)"};
static void getDraft(){GetWindowTextW(ctrls[0],draft.title,160);GetWindowTextW(ctrls[1],draft.exe,STR);GetWindowTextW(ctrls[2],draft.args,512);GetWindowTextW(ctrls[3],draft.work,STR);GetWindowTextW(ctrls[4],draft.config,STR);GetWindowTextW(ctrls[5],draft.cover,STR);GetWindowTextW(ctrls[6],draft.fps,24);wsanitize(draft.title);wsanitize(draft.exe);wsanitize(draft.args);wsanitize(draft.work);wsanitize(draft.config);wsanitize(draft.cover);wsanitize(draft.fps);}
DLL LRESULT WIN SendMessageW(HWND,UINT,WPARAM,LPARAM);
static void btnCreate(HWND w,int id,LPCWSTR s,int x,int y,int cw,int ch){HWND c=CreateWindowExW(0,L"BUTTON",s,WS_VISIBLE|WS_CHILD|WS_TABSTOP,x,y,cw,ch,w,(HANDLE)(ULONG_PTR)id,inst,0);if(c)SendMessageW(c,WM_SETFONT,(WPARAM)fonts[1],1);}
static LRESULT CALLBACK DialogProc(HWND w,UINT msg,WPARAM wp,LPARAM lp){if(msg==WM_CREATE){for(int i=0;i<7;i++){int y=24+i*75;CreateWindowExW(0,L"STATIC",labels[i],WS_CHILD|WS_VISIBLE,28,y,700,24,w,0,inst,0);ctrls[i]=CreateWindowExW(0,L"EDIT",L"",WS_CHILD|WS_VISIBLE|WS_BORDER|ES_AUTOHSCROLL|WS_TABSTOP,28,y+25,620,33,w,(HANDLE)(ULONG_PTR)(CID_BASE+i),inst,0);SendMessageW(ctrls[i],WM_SETFONT,(WPARAM)fonts[1],1);}SetWindowTextW(ctrls[0],draft.title);SetWindowTextW(ctrls[1],draft.exe);SetWindowTextW(ctrls[2],draft.args);SetWindowTextW(ctrls[3],draft.work);SetWindowTextW(ctrls[4],draft.config);SetWindowTextW(ctrls[5],draft.cover);SetWindowTextW(ctrls[6],draft.fps);btnCreate(w,CID_PICKEXE,L"...",663,49,60,33);btnCreate(w,CID_PICKCONFIG,L"...",663,349,60,33);btnCreate(w,CID_PICKCOVER,L"...",663,424,60,33);btnCreate(w,CID_SAVE,L"SALVAR",28,566,160,44);btnCreate(w,CID_CANCEL,L"CANCELAR",210,566,160,44);if(draft.config[0])btnCreate(w,CID_RUNCONFIG,L"ABRIR CONFIGURADOR",394,566,275,44);return 0;}
 if(msg==WM_COMMAND){int id=(int)(wp&0xffff);if(id==CID_CANCEL){DestroyWindow(w);return 0;}if(id==CID_SAVE){getDraft();if(!draft.exe[0]||!draft.title[0]){MessageBoxW(w,L"Informe o nome e o arquivo .exe do jogo.",L"PortDeck",MB_OK|MB_ICONERROR);return 0;}if(GetFileAttributesW(draft.exe)==0xffffffffU){MessageBoxW(w,L"Esse arquivo .exe nao existe. Confira o caminho.",L"PortDeck",MB_OK|MB_ICONERROR);return 0;}games[selected]=draft;save();DestroyWindow(w);InvalidateRect(mainWindow,0,0);return 0;}if(id==CID_PICKEXE||id==CID_PICKCONFIG||id==CID_PICKCOVER){int idx=id==CID_PICKEXE?1:id==CID_PICKCONFIG?4:5;WCHAR path[STR];GetWindowTextW(ctrls[idx],path,STR);if(filePicker(w,path,L"Selecione o arquivo",id==CID_PICKCOVER))SetWindowTextW(ctrls[idx],path);return 0;}if(id==CID_RUNCONFIG){getDraft();if(draft.config[0])launch(draft.config,L"",draft.work,0);return 0;}}
 if(msg==WM_CLOSE){DestroyWindow(w);return 0;}if(msg==WM_DESTROY){editDialog=NULL;return 0;}return DefWindowProcW(w,msg,wp,lp);}
static void openEdit(void){if(editDialog){ShowWindow(editDialog,SW_SHOW);return;}if(!ng)return;draft=games[selected];editDialog=CreateWindowExW(0,L"PortDeckEditor",L"PortDeck | Configurar jogo",WS_OVERLAPPEDWINDOW|WS_VISIBLE,155,95,765,675,mainWindow,0,inst,0);ShowWindow(editDialog,SW_SHOW);}
static void addPort(void){if(ng>=MAXGAMES){MessageBoxW(mainWindow,L"Biblioteca cheia (128 jogos).",L"PortDeck",MB_OK|MB_ICONINFORMATION);return;}WCHAR path[STR]={0};if(!filePicker(mainWindow,path,L"Adicionar port - selecione o .exe",0))return;Game*g=&games[ng];for(unsigned i=0;i<sizeof(Game);i++)((BYTE*)g)[i]=0;wcpy(g->exe,path,STR);wbase(g->title,path);wcpy(g->work,path,STR);wdir(g->work);selected=ng++;save();openEdit();InvalidateRect(mainWindow,0,0);}
static void removePort(void){if(!ng)return;if(process&&runningIndex==selected){MessageBoxW(mainWindow,L"Feche o jogo em execucao antes de remover esse perfil.",L"PortDeck",MB_OK|MB_ICONINFORMATION);return;}if(MessageBoxW(mainWindow,L"Remover este jogo da biblioteca? O arquivo do jogo nao sera apagado.",L"PortDeck",MB_YESNO|MB_ICONQUESTION)!=IDYES)return;for(int i=selected;i<ng-1;i++)games[i]=games[i+1];ng--;if(selected>=ng)selected=ng-1;if(selected<0)selected=0;if(process&&runningIndex>selected)runningIndex--;save();InvalidateRect(mainWindow,0,0);}
static void selectDelta(int d){if(!ng)return;selected+=d;if(selected<0)selected=ng-1;if(selected>=ng)selected=0;InvalidateRect(mainWindow,0,0);}
static void gamepadPoll(void){if(!getPad)return;XINPUT_STATE state={0};int found=-1;for(int i=0;i<4;i++)if(getPad(i,&state)==0){found=i;break;}if(found<0){if(!weq(ctlLabel,L"Teclado / mouse")){wcpy(ctlLabel,L"Teclado / mouse",128);InvalidateRect(mainWindow,0,0);}prevbuttons=0;return;}if(!weq(ctlLabel,L"Controle Xbox / XInput conectado")){wcpy(ctlLabel,L"Controle Xbox / XInput conectado",128);InvalidateRect(mainWindow,0,0);}WORD buttons=state.Gamepad.wButtons;if(state.Gamepad.sThumbLX>16000)buttons|=XINPUT_DPAD_RIGHT;if(state.Gamepad.sThumbLX< -16000)buttons|=XINPUT_DPAD_LEFT;WORD fresh=buttons&~prevbuttons;if(!editDialog){if(fresh&XINPUT_DPAD_LEFT)selectDelta(-1);if(fresh&XINPUT_DPAD_RIGHT)selectDelta(1);if(fresh&(XINPUT_A|XINPUT_START))play();if(fresh&XINPUT_X)openEdit();if(fresh&XINPUT_Y)addPort();}prevbuttons=buttons;}
static LRESULT CALLBACK MainProc(HWND w,UINT msg,WPARAM wp,LPARAM lp){if(msg==WM_CREATE){SetTimer(w,1,110,0);return 0;}if(msg==WM_SIZE){InvalidateRect(w,0,0);return 0;}if(msg==WM_ERASEBKGND)return 1;if(msg==WM_PAINT){PAINTSTRUCT ps;HDC dc=BeginPaint(w,&ps);repaint(w,dc);EndPaint(w,&ps);return 0;}if(msg==WM_TIMER){gamepadPoll();updateProcess();return 0;}if(msg==WM_LBUTTONDBLCLK||msg==WM_LBUTTONDOWN){int x=(short)(lp&0xffff),y=(short)((lp>>16)&0xffff);for(int j=0;j<visible&&j+firstCard<ng;j++){int l=cardLeft+j*(cardW+cardGap);if(x>=l&&x<l+cardW&&y>=cardTop&&y<=cardTop+cardH+50){selected=j+firstCard;InvalidateRect(w,0,0);if(msg==WM_LBUTTONDBLCLK)play();return 0;}}int by=clientH-92;if(by<540)by=540;if(y>=by&&y<=by+54){if(x>=58&&x<=290)addPort();else if(x>=310&&x<=510)play();else if(x>=530&&x<=735)openEdit();else if(x>=755&&x<=939)removePort();return 0;}}if(msg==WM_KEYDOWN){if(editDialog)return DefWindowProcW(w,msg,wp,lp);if(wp==VK_LEFT){selectDelta(-1);return 0;}if(wp==VK_RIGHT){selectDelta(1);return 0;}if(wp==VK_RETURN){play();return 0;}if(wp==VK_F2){openEdit();return 0;}if(wp==VK_DELETE){removePort();return 0;}if(wp=='N'&&(GetKeyState(VK_CONTROL)&0x8000)){addPort();return 0;}if(wp==VK_F11||wp==VK_ESCAPE&&fullscreen){fullscreen=!fullscreen;if(fullscreen){SetWindowLongPtrW(w,GWL_STYLE,WS_POPUP|WS_VISIBLE);MoveWindow(w,0,0,GetSystemMetrics(0),GetSystemMetrics(1),TRUE);}else{SetWindowLongPtrW(w,GWL_STYLE,WS_OVERLAPPEDWINDOW|WS_VISIBLE);MoveWindow(w,110,100,1280,760,TRUE);}InvalidateRect(w,0,0);return 0;}}if(msg==WM_CLOSE){DestroyWindow(w);return 0;}if(msg==WM_DESTROY){trace(L"Janela principal foi fechada");updateProcess();save();if(process)CloseHandle(process);KillTimer(w,1);PostQuitMessage(0);return 0;}return DefWindowProcW(w,msg,wp,lp);}
void WIN Main(void){inst=GetModuleHandleW(0);makePaths();trace(L"PortDeck v0.1.2 iniciado");load();initGdi();initPad();fonts[0]=CreateFontW(17,0,0,0,400,0,0,0,1,0,0,0,0,L"Segoe UI");fonts[1]=CreateFontW(20,0,0,0,600,0,0,0,1,0,0,0,0,L"Segoe UI");fonts[2]=CreateFontW(24,0,0,0,650,0,0,0,1,0,0,0,0,L"Segoe UI");fonts[3]=CreateFontW(34,0,0,0,700,0,0,0,1,0,0,0,0,L"Segoe UI");fonts[4]=CreateFontW(44,0,0,0,800,0,0,0,1,0,0,0,0,L"Segoe UI");fonts[5]=CreateFontW(68,0,0,0,800,0,0,0,1,0,0,0,0,L"Segoe UI");WNDCLASSEXW wc={0};wc.cbSize=sizeof(wc);wc.style=CS_DBLCLKS;wc.lpfnWndProc=(LONG_PTR)MainProc;wc.hInstance=inst;wc.lpszClassName=L"PortDeckNative";wc.hCursor=LoadCursorW(0,(LPCWSTR)32512);wc.hIcon=LoadIconW(inst,(LPCWSTR)1);wc.hIconSm=wc.hIcon;RegisterClassExW(&wc);wc.lpfnWndProc=(LONG_PTR)DialogProc;wc.lpszClassName=L"PortDeckEditor";wc.style=0;RegisterClassExW(&wc);mainWindow=CreateWindowExW(0,L"PortDeckNative",L"PortDeck | Biblioteca",WS_POPUP|WS_VISIBLE,0,0,GetSystemMetrics(0),GetSystemMetrics(1),0,0,inst,0);if(!mainWindow){MessageBoxW(0,L"Falha ao iniciar janela principal do PortDeck.",L"PortDeck",MB_ICONERROR);ExitProcess(1);}ShowWindow(mainWindow,SW_SHOW);UpdateWindow(mainWindow);MSG msg;while(GetMessageW(&msg,0,0,0)>0){TranslateMessage(&msg);DispatchMessageW(&msg);}ExitProcess(0);}
