import path from "node:path";
import { app, BrowserWindow, Menu, shell } from "electron";
import { initDatabase } from "./services/db";
import { initFolders } from "./services/file-manager";
import { registerIpc } from "./ipc";
import { SyncEngine } from "./services/sync-engine";

let mainWindow: BrowserWindow | null = null;
let syncEngine: SyncEngine | null = null;
let pendingProtocolUrl: string | null = null;

function protocolUrlFromArgs(args: string[]): string | null {
  return args.find((arg) => arg.startsWith("kaemform://")) ?? null;
}

async function handleProtocol(url: string): Promise<void> {
  if (!syncEngine) {
    pendingProtocolUrl = url;
    return;
  }
  try {
    await syncEngine.handleCallback(url);
    mainWindow?.show();
    mainWindow?.focus();
  } catch (error) {
    mainWindow?.webContents.send("sync:status", {
      isSyncing: false,
      lastSynced: null,
      error: error instanceof Error ? error.message : "Login gagal.",
    });
  }
}

function createWindow(): BrowserWindow {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "kaemform.png")
    : path.join(__dirname, "../../resources/icon.png");
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    title: "KaemForm Desktop",
    icon: iconPath,
    backgroundColor: "#F8FAFC",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.on("ready-to-show", () => window.show());
  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return window;
}

const hasLock = app.requestSingleInstanceLock();
if (!hasLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const url = protocolUrlFromArgs(argv);
    if (url) void handleProtocol(url);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.on("open-url", (event, url) => {
  event.preventDefault();
  void handleProtocol(url);
});

app.whenReady().then(async () => {
  app.setAppUserModelId("com.kaemnur.kaemform");
  Menu.setApplicationMenu(null);

  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("kaemform", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  } else {
    app.setAsDefaultProtocolClient("kaemform");
  }

  const folders = await initFolders(app.getPath("home"));
  initDatabase(path.join(app.getPath("userData"), "kaemform.db"), folders.output);
  syncEngine = new SyncEngine();
  mainWindow = createWindow();
  syncEngine.setWindow(mainWindow);
  registerIpc(mainWindow, syncEngine);
  syncEngine.startSchedule();

  const initialUrl = pendingProtocolUrl ?? protocolUrlFromArgs(process.argv);
  if (initialUrl) {
    pendingProtocolUrl = null;
    await handleProtocol(initialUrl);
  } else if (await syncEngine.restoreSession()) {
    void syncEngine.syncAll(true);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
      if (syncEngine) syncEngine.setWindow(mainWindow);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
