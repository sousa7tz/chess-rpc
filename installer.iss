#define MyAppName "Chess.com Discord RPC"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "sousa7tz"
#define MyAppURL "https://github.com/sousa7tz/chess-rpc"
#define MyAppExeName "chess-rpc.exe"
#define MyLauncherName "start-hidden.vbs"

[Setup]
AppId={{D3A15C8F-71B2-4A2E-9C8F-B219E1528A73}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir=build-installer
OutputBaseFilename=ChessRPC-Setup-{#MyAppVersion}
SetupIconFile=assets\icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "startup"; Description: "Start automatically with Windows (silently)"; GroupDescription: "Windows Integration:"

[Files]
Source: "dist\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist\{#MyLauncherName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist\config.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist\locales\*"; DestDir: "{app}\locales"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\{#MyLauncherName}"""; IconFilename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"

[Registry]
; Inicia silenciosamente com o Windows via VBS se a task estiver marcada
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "ChessRPC"; ValueData: """wscript.exe"" ""{app}\{#MyLauncherName}"""; Flags: uninsdeletevalue; Tasks: startup

[Run]
; Roda em background logo apos a instalacao
Filename: "wscript.exe"; Parameters: """{app}\{#MyLauncherName}"""; Description: "Launch Chess.com RPC now"; Flags: nowait postinstall