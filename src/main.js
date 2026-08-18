const { app, ipcMain } = require('electron');
const {
  initModules,
  setupContextMenu,
  createWindow,
  setupIpc,
  restoreSession,
  getMainWindow,
} = require('./createApp');
const { connectDiscordRpc, updateRichPresence, clearPresence } = require('./scripts/discordRpcUtils');
const { checkForUpdates } = require('./scripts/updateChecker');

// Linux fix: Electron 43 (Chromium) defaults to a Vulkan graphics backend
// that is incompatible with the Wayland ozone platform, and its GTK4 renderer
// paints white on many Arch-based distros (CachyOS in particular). Both fail
// modes cascade into the network service crashing and a permanent white
// screen. Let Ozone auto-pick the platform, disable the Vulkan backend, and
// force GTK3 so the renderer paints. Must run before app is ready. Sandbox
// stays enabled — no --no-sandbox needed.
// See: electron/electron#33690 (GTK4), electron/electron#43400 (net service).
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
  app.commandLine.appendSwitch('disable-features', 'Vulkan');
  app.commandLine.appendSwitch('gtk-version', '3');
}

let rpcInterval = null;

function startRpc() {
  if (rpcInterval) return;
  connectDiscordRpc().then(() => {
    rpcInterval = setInterval(() => {
      const win = getMainWindow();
      if (!win) return;
      updateRichPresence(win.webContents, win.webContents.getURL()).catch(console.error);
    }, 1500);
  }).catch((err) => {
    console.error('Failed to connect Discord RPC:', err);
  });
}

function stopRpc() {
  if (rpcInterval) {
    clearInterval(rpcInterval);
    rpcInterval = null;
  }
  clearPresence().catch(console.error);
}

app.whenReady().then(async () => {
  const store = await initModules();
  setupContextMenu();
  restoreSession();
  setupIpc();
  const win = createWindow();

  checkForUpdates(win);

  ipcMain.handle('getDiscordRpcEnabled', () => store.get('discordRpcEnabled', true));

  ipcMain.handle('toggleDiscordRpc', () => {
    const newState = !store.get('discordRpcEnabled', true);
    store.set('discordRpcEnabled', newState);
    console.log(`[Discord RPC] ${newState ? 'enabled' : 'disabled'} by user`);
    if (newState) startRpc();
    else stopRpc();
    return newState;
  });

  if (store.get('discordRpcEnabled', true)) {
    startRpc();
  }
});
