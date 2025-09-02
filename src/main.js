const {
  app,
  BrowserWindow,
  session,
  ipcMain,
  dialog,
  shell,
} = require("electron");
const contextMenu = require("electron-context-menu");
const Store = require("electron-store");
const promptInjection = require("./scripts/promptinjection");
const titlebar = require("./scripts/titlebar");
const { updateRichPresence, connectDiscordRpc } = require("./scripts/discordRpcUtils");
const path = require("path");
const { parseGameName, isDreamWorldMap } = require("./scripts/utils");

const store = new Store();

let mainWindow; // Reference to the main window

contextMenu({
  showSelectAll: false,
  showSearchWithGoogle: false,
  showInspectElement: false,
  append: () => [
    {
      label: "Force Reload",
      click: () => {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.reloadIgnoringCache();
        } else {
          console.error("Main window or webContents is not available.");
        }
      },
    },
    {
      label: "Clear IndexedDB",
      click: () => {
        if (mainWindow && mainWindow.webContents) {
          dialog
            .showMessageBox({
              type: "question",
              buttons: ["Yes", "No"],
              title: "Clear IndexedDB",
              message:
                "Are you sure you want to clear IndexedDB? This should only be used if something is broken as it will delete your local save file.\nThis will also clear the cache and Local Storage.",
            })
            .then((result) => {
              if (result.response == 0) {
                dialog
                  .showMessageBox({
                    type: "warning",
                    buttons: ["Yes", "No"],
                    title: "Clear IndexedDB",
                    message:
                      "ATTENTION: THIS WILL DELETE YOUR LOCAL SAVE FILE.\nAre you sure you want to continue?",
                  })
                  .then((result) => {
                    if (result.response == 0) {
                      session.defaultSession
                        .clearStorageData({
                          storages: ["indexdb", "cache", "localstorage"],
                        })
                        .then(() => {
                          mainWindow.webContents.reloadIgnoringCache();
                        });
                    }
                  });
              }
            });
        } else {
          console.error("Main window or webContents is not available.");
        }
      },
    },
    {
      label: "Open Developer Tools",
      click: () => {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.openDevTools();
        } else {
          console.error("Main window or webContents is not available.");
        }
      },
    },
    {
      label: "Zoom In",
      click: () => {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send("zoomin");
        } else {
          console.error("Main window or webContents is not available.");
        }
      },
    },
    {
      label: "Zoom Out",
      click: () => {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send("zoomout");
        } else {
          console.error("Main window or webContents is not available.");
        }
      },
    },
  ],
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1052,
    height: 798, // 30px for titlebar
    title: "Yume Nikki Online Project",
    icon: "assets/logo.png",
    resizable: true,
    frame: true,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
    },
  });

  mainWindow.setMenu(null);
  mainWindow.setTitle("Yume Nikki Online Project");

  mainWindow.webContents.setMaxListeners(13);

  mainWindow.on("closed", () => {
    saveSession();
    app.quit();
  });

  mainWindow.webContents.on("did-finish-load", () => {
    promptInjection(mainWindow); // Custom prompt hack
    mainWindow.webContents.executeJavaScript(`
      if (document.title != "Yume Nikki Online Project") {
        document.getElementById('content').style.overflow = 'hidden';
        document.querySelector('#content')?.scrollTo(0,0);
      }
    `); // Disable scroll ingame
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    let u;
    try { u = new URL(url); } catch { return { action: "deny" }; }

    const isMap = isDreamWorldMap(u.toString());
    const gameName = parseGameName(u.toString());
    const isGame = typeof gameName === "string" && gameName.trim().length > 0;

    // 1) If it’s a game link (not a map), load in-app
    if (isGame && !isMap) {
      mainWindow.loadURL(`https://ynoproject.net/${encodeURIComponent(gameName.trim())}`);
      return { action: "deny" };
    }

    // 2) Map links open in new Electron window
    if (isMap) return { action: "allow" };

    // 3) Everything else → system browser
    if (u.protocol === "https:") {
      shell.openExternal(u.toString());
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("did-start-loading", () => {
    titlebar(mainWindow); // Custom titlebar hack
  });

  // better way to do it than in updatePresence function
  // see: https://stackoverflow.com/a/62426970
  mainWindow.webContents.on("will-prevent-unload", (event) => {
    event.preventDefault();
  });
};

let isMax = false;

app.whenReady().then(async () => {
  // Example: Setting a cookie if it exists in the store
  if (store.has("ynoproject_sessionId")) {
    session.defaultSession.cookies.set({
      url: "https://ynoproject.net",
      name: "ynoproject_sessionId",
      value: store.get("ynoproject_sessionId"),
      sameSite: "strict",
    });
  }

  // IPC Handlers for minimize and maximize
  ipcMain.on("minimize", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.minimize();
    }
  });

  ipcMain.on("maximize", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      if (isMax) {
        focusedWindow.unmaximize();
      } else {
        focusedWindow.maximize();
      }
      isMax = !isMax;
    }
  });

  // Create the main application window
  createWindow();

  mainWindow.loadURL("https://ynoproject.net/");

  // Initialize Discord RPC
  try {
    await connectDiscordRpc(); // Connect the Discord RPC client

    // Start updating the rich presence with the current URL every 1500ms
    setInterval(() => {
      const currentURL = mainWindow.webContents.getURL();
      updateRichPresence(mainWindow.webContents, currentURL).catch(console.error);
    }, 1500);

  } catch (error) {
    console.error("Failed to connect Discord RPC:", error);
  }
});

function saveSession() {
  session.defaultSession.cookies
    .get({ url: "https://ynoproject.net" })
    .then((cookies) => {
      const sess = cookies.find(
        (cookie) => cookie.name === "ynoproject_sessionId"
      );
      if (sess) store.set("ynoproject_sessionId", sess.value);
    });
}