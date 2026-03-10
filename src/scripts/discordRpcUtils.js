const DiscordRPC = require('discord-rpc');
const { parseGameName } = require('./utils');

const CLIENT_ID = '1311371561416265738';
const DISCORD_STATE_MAX_LENGTH = 128; // Discord RPC state field limit
const client = new DiscordRPC.Client({ transport: 'ipc' });
let isReady = false;

async function connectDiscordRpc() {
  if (isReady) return;

  client.removeAllListeners('disconnected');
  client.on('disconnected', () => {
    isReady = false;
  });

  await client.login({ clientId: CLIENT_ID });
  isReady = true;
  console.log('Discord Rich Presence connected!');
}

async function updateRichPresence(webContents, currentURL) {
  if (!isReady) return;

  const gameName = parseGameName(currentURL);
  if (!gameName) return setBasicPresence();

  const { locationText } = await fetchLocationText(webContents);

  // Validate and truncate location text before sending to Discord API
  const safeState = typeof locationText === 'string'
    ? locationText.slice(0, DISCORD_STATE_MAX_LENGTH)
    : 'Going to bed…';

  try {
    await client.setActivity({
      // encodeURIComponent prevents malformed URLs from gameName containing special chars
      largeImageKey: `https://ynoproject.net/images/door_${encodeURIComponent(gameName)}.gif`,
      largeImageText: gameName,
      smallImageKey: 'yno-logo',
      smallImageText: 'YNOProject',
      details: `Dreaming on ${gameName}…`,
      state: safeState,
      instance: false,
    });
  } catch (err) {
    console.error('Failed to update rich presence:', err);
  }
}

async function setBasicPresence() {
  if (!isReady) return;
  try {
    await client.setActivity({
      largeImageKey: 'yno-logo',
      largeImageText: 'Yume Nikki Online Project',
      state: 'Choosing a door...',
      instance: false,
    });
  } catch (err) {
    console.error('Failed to set basic presence:', err);
  }
}

async function clearPresence() {
  if (!isReady) return;
  try {
    await client.clearActivity();
  } catch (err) {
    console.error('Failed to clear presence:', err);
  }
}

async function fetchLocationText(webContents) {
  try {
    return await webContents.executeJavaScript(`
      (() => {
        const el = document.querySelector('#locationText a');
        return el
          ? { locationText: el.innerText || null, locationUrl: el.href || null }
          : { locationText: null, locationUrl: null };
      })()
    `);
  } catch {
    return { locationText: null, locationUrl: null };
  }
}

module.exports = { connectDiscordRpc, updateRichPresence, clearPresence };
