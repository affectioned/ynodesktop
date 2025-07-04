const { Client } = require("@xhayper/discord-rpc");
const { parseGameName } = require("./utils");

// Initialize the Discord RPC client
const client = new Client({
  clientId: "1311371561416265738",
});

async function updateRichPresence(webContents, currentURL) {
  if (!client) {
    console.warn('Discord RPC is not ready - skipping setActivity');
    return;
  }

  if (!client.user?.setActivity) {
    console.warn('RPC not ready - skipping update');
    return;
  }

  const gameName = parseGameName(currentURL);
  if (!gameName) {
    return setBasicPresence();
  }

  const location = await fetchLocationText(webContents);
  const stateText = location?.locationText ?? 'Going to bed…';

  const activity = {
    largeImageKey: `https://ynoproject.net/images/door_${gameName}.gif`,
    largeImageText: gameName,
    smallImageKey: 'yno-logo',
    smallImageText: 'YNOProject',
    details: `Dreaming on ${gameName}…`,
    state: stateText,
    instance: false
  };

  try {
    await client.user.setActivity(activity);
  } catch (err) {
    console.error('Failed to update rich presence:', err);
  }
}

// Connect and start the Discord RPC client
async function connectDiscordRpc() {
  if (!client.listenerCount("ready")) {
    client.on("ready", () => {
      console.log("Discord Rich Presence connected!");
    });
  }

  try {
    await client.login();
  } catch (error) {
    console.error("Failed to connect Discord RPC:", error);
  }
}

async function fetchLocationText(webContents) {
  try {
    const location = await webContents.executeJavaScript(`
      new Promise((resolve) => {
        const checkElement = () => {
          const locationElement = document.querySelector('#locationText a');
          if (locationElement) {
            const locationText = locationElement.innerText || null;
            const locationUrl = locationElement.href || null;
            resolve({ locationText, locationUrl });
          } else {
            resolve({ locationText: null, locationUrl: null }); // ✅ Proper null values
            setTimeout(checkElement, 500); // Retry every 500ms
          }
        };
        checkElement();
      });
    `);

    return location;
  } catch (error) {
    console.error("Error fetching location text:", error);
    return { locationText: null, locationUrl: null }; // Return a consistent object structure
  }
}

async function setBasicPresence() {
  const activity = {
    largeImageKey: "yno-logo",
    largeImageText: "Yume Nikki Online Project",
    state: "Choosing a door...",
    instance: false,
  };

  try {
    await client.user.setActivity(activity);
  } catch (err) {
    console.error('Failed to update rich presence:', err);
  }
}

// Export the functions and client
module.exports = { updateRichPresence, connectDiscordRpc, client };