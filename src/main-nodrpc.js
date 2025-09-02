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
const path = require("path");
const { parseGameName, isDreamWorldMap } = require("./scripts/utils");

const store = new Store();

contextMenu({
  showSelectAll: false,
  showSearchWithGoogle: false,
  showInspectElement: false,
  append: (defaultActions, params, browserWindow) => [
    {
      label: "Force Reload",
      click: () => {
        browserWindow.webContents.reloadIgnoringCache();
      },
    },
    {
      label: "Clear IndexedDB",
      click: () => {
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
                        browserWindow.webContents.reloadIgnoringCache();
                      });
                  }
                });
            }
          });
      },
    },
    {
      label: "Open Developer Tools",
      click: () => {
        browserWindow.webContents.openDevTools();
      },
    },
    {
      label: "Zoom In",
      click: () => {
        browserWindow.webContents.send("zoomin");
      },
    },
    {
      label: "Zoom Out",
      click: () => {
        browserWindow.webContents.send("zoomout");
      },
    },
  ],
});

const createWindow = () => {
  const mainWindow = new BrowserWindow({
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

  mainWindow.on("close", () => {
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

  mainWindow.webContents.on("devtools-opened", () => {
    mainWindow.webContents.send("log-app-version", app.getVersion());
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

  mainWindow.loadURL("https://ynoproject.net/");
};

let isMax = false;

app.whenReady().then(() => {
  if (store.has("ynoproject_sessionId")) {
    session.defaultSession.cookies.set({
      url: "https://ynoproject.net",
      name: "ynoproject_sessionId",
      value: store.get("ynoproject_sessionId"),
      sameSite: "strict",
    });
  }
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
  createWindow();
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
