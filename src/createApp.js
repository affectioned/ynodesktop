const {
  app,
  BrowserWindow,
  session,
  ipcMain,
  dialog,
  shell,
  safeStorage,
} = require('electron');
const contextMenu = require('electron-context-menu');
const Store = require('electron-store');
const promptInjection = require('./scripts/promptinjection');
const titlebar = require('./scripts/titlebar');
const path = require('path');
const { parseGameName, isDreamWorldMap } = require('./scripts/utils');

const store = new Store();

let mainWindow = null;

// --- Session helpers (safeStorage with plaintext fallback + migration) ---

function restoreSession() {
  let value;

  if (store.has('ynoproject_sessionId_enc') && safeStorage.isEncryptionAvailable()) {
    try {
      value = safeStorage.decryptString(
        Buffer.from(store.get('ynoproject_sessionId_enc'), 'base64')
      );
    } catch {
      store.delete('ynoproject_sessionId_enc');
      return;
    }
  } else if (store.has('ynoproject_sessionId')) {
    // Legacy plaintext — will be encrypted on next save
    value = store.get('ynoproject_sessionId');
  }

  if (!value) return;
  session.defaultSession.cookies.set({
    url: 'https://ynoproject.net',
    name: 'ynoproject_sessionId',
    value,
    sameSite: 'strict',
  });
}

function saveSession() {
  session.defaultSession.cookies
    .get({ url: 'https://ynoproject.net' })
    .then((cookies) => {
      const sess = cookies.find((c) => c.name === 'ynoproject_sessionId');
      if (!sess) return;

      if (safeStorage.isEncryptionAvailable()) {
        store.set(
          'ynoproject_sessionId_enc',
          safeStorage.encryptString(sess.value).toString('base64')
        );
        store.delete('ynoproject_sessionId'); // remove legacy plaintext
      } else {
        store.set('ynoproject_sessionId', sess.value); // platform fallback
      }
    });
}

// --- Context menu ---

function confirmClearIndexedDB() {
  if (!mainWindow?.webContents) return;
  dialog.showMessageBox({
    type: 'question',
    buttons: ['Yes', 'No'],
    title: 'Clear IndexedDB',
    message:
      'Are you sure you want to clear IndexedDB? This should only be used if something is broken as it will delete your local save file.\nThis will also clear the cache and Local Storage.',
  }).then(({ response }) => {
    if (response !== 0) return;
    dialog.showMessageBox({
      type: 'warning',
      buttons: ['Yes', 'No'],
      title: 'Clear IndexedDB',
      message: 'ATTENTION: THIS WILL DELETE YOUR LOCAL SAVE FILE.\nAre you sure you want to continue?',
    }).then(({ response }) => {
      if (response !== 0) return;
      session.defaultSession
        .clearStorageData({ storages: ['indexdb', 'cache', 'localstorage'] })
        .then(() => mainWindow?.webContents.reloadIgnoringCache());
    });
  });
}

function setupContextMenu() {
  contextMenu({
    showSelectAll: false,
    showSearchWithGoogle: false,
    showInspectElement: false,
    append: () => [
      {
        label: 'Force Reload',
        click: () => mainWindow?.webContents.reloadIgnoringCache(),
      },
      {
        label: 'Clear IndexedDB',
        click: () => confirmClearIndexedDB(),
      },
      {
        label: 'Open Developer Tools',
        click: () => mainWindow?.webContents.openDevTools(),
      },
      {
        label: 'Zoom In',
        click: () => mainWindow?.webContents.send('zoomin'),
      },
      {
        label: 'Zoom Out',
        click: () => mainWindow?.webContents.send('zoomout'),
      },
    ],
  });
}

// --- Window ---

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1052,
    height: 798, // 30px for titlebar
    title: 'Yume Nikki Online Project',
    icon: path.join(__dirname, '..', 'assets', 'logo.png'),
    resizable: true,
    frame: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
      contextIsolation: true,  // explicit — renderer JS cannot access Node APIs
      sandbox: true,            // renderer process is OS-sandboxed
      nodeIntegration: false,   // explicit — never allow Node in renderer
    },
  });

  mainWindow.setMenu(null);
  mainWindow.setTitle('Yume Nikki Online Project');
  mainWindow.webContents.setMaxListeners(13);

  mainWindow.on('closed', () => {
    saveSession();
    app.quit();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    titlebar(mainWindow);
    promptInjection(mainWindow);
    mainWindow.webContents.executeJavaScript(`
      if (document.title !== "Yume Nikki Online Project") {
        document.getElementById('content').style.overflow = 'hidden';
        document.querySelector('#content')?.scrollTo(0, 0);
      }
    `);
  });

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.send('log-app-version', app.getVersion());
  });

  // Guard top-level navigations — only ynoproject.net is allowed in the main frame
  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      const u = new URL(url);
      if (u.hostname !== 'ynoproject.net') {
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    let u;
    try { u = new URL(url); } catch { return { action: 'deny' }; }

    const isMap = isDreamWorldMap(u.href);
    const gameName = parseGameName(u.href);
    const isGame = typeof gameName === 'string' && gameName.trim().length > 0;

    // Game link — load in-app
    if (isGame && !isMap) {
      mainWindow.loadURL(`https://ynoproject.net/${encodeURIComponent(gameName.trim())}`);
      return { action: 'deny' };
    }

    // Dream-world map image — open in a new hardened window
    if (isMap) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            contextIsolation: true,
            sandbox: true,
            nodeIntegration: false,
          },
        },
      };
    }

    // Everything else — open in the system browser (HTTPS only, no credentials)
    if (u.protocol === 'https:' && !u.username && !u.password) {
      shell.openExternal(u.href);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-prevent-unload', (event) => {
    event.preventDefault();
  });

  mainWindow.loadURL('https://ynoproject.net/');
  return mainWindow;
}

// --- IPC ---

function setupIpc() {
  // Use the trusted mainWindow reference, not getFocusedWindow()
  ipcMain.on('minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('maximize', () => {
    if (!mainWindow) return;
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });
}

function getMainWindow() {
  return mainWindow;
}

module.exports = { setupContextMenu, createWindow, setupIpc, restoreSession, getMainWindow, store };
