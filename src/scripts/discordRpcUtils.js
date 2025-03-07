const { Client } = require("@xhayper/discord-rpc");
const { parseGameName } = require("./utils");

// Initialize the Discord RPC client
const client = new Client({
  clientId: "1311371561416265738",
});

async function updateRichPresence(webContents, currentURL) {
  let gameName = parseGameName(currentURL);
  if (!gameName) {
    try {
      await client.user?.setActivity({
        largeImageKey: "yno-logo",
        largeImageText: "Yume Nikki Online Project",
        state: "Choosing a door...",
        instance: false,
      });
    } catch (error) {
      console.error("Failed to update rich presence:", error);
    }
    return;
  }

  let location = await fetchLocationText(webContents);

  if (!location || !location.locationText) {
    try {
      await client.user?.setActivity({
        largeImageKey: `https://ynoproject.net/images/door_${gameName}.gif`,
        largeImageText: gameName,
        smallImageKey: "yno-logo",
        smallImageText: "YNOProject",
        details: `Dreaming on ${gameName}...`,
        instance: false,
        state: "Going to bed...",
      });
    } catch (error) {
      console.error("Failed to update rich presence:", error);
    }
    return;
  }

  try {
    await client.user?.setActivity({
      largeImageKey: `https://ynoproject.net/images/door_${gameName}.gif`,
      largeImageText: gameName,
      smallImageKey: "yno-logo",
      smallImageText: "YNOProject",
      details: `Dreaming on ${gameName}...`,
      instance: false,
      state: location.locationText,
    });
  } catch (error) {
    console.error("Failed to update rich presence:", error);
  }
}

// Connect and start the Discord RPC client
async function connectDiscordRpc() {
  client.on("ready", () => {
    console.log("Discord Rich Presence connected!");
  });

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


// Export the functions and client
module.exports = { updateRichPresence, connectDiscordRpc, client };
