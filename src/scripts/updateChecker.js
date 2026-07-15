const { app, dialog, shell } = require('electron');

const REPO = 'affectioned/ynodesktop';
const LATEST_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
const REQUEST_TIMEOUT_MS = 8000;

// Compare "x.y.z" version strings. Returns 1 if a > b, -1 if a < b, 0 if equal.
function compareVersions(a, b) {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
  }
  return 0;
}

async function fetchLatestRelease() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(LATEST_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function checkForUpdates(parentWindow) {
  if (!app.isPackaged) return;

  const release = await fetchLatestRelease();
  if (!release || release.prerelease || release.draft) return;

  const latest = String(release.tag_name || '').replace(/^v/, '');
  if (!/^\d+\.\d+\.\d+$/.test(latest)) return;

  const current = app.getVersion();
  if (compareVersions(latest, current) <= 0) return;

  // Escape / window close (cancelId) also quits — no way to dismiss and keep using the app.
  const { response } = await dialog.showMessageBox(parentWindow, {
    type: 'info',
    title: 'Update required',
    message: 'A new version of YNOdesktop is available.',
    detail: `Current: v${current}\nLatest:  v${latest}\n\nYou must update to continue using the app.`,
    buttons: ['Download update', 'Quit'],
    defaultId: 0,
    cancelId: 1,
    noLink: true,
    modal: true,
  });

  if (response === 0) {
    shell.openExternal(release.html_url);
  }
  app.quit();
}

module.exports = { checkForUpdates };
