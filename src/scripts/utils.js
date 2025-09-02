const parseGameName = (url) => {
  // Adjusted regex to correctly capture the game name part of the URL
  const match = url.match(/ynoproject\.net\/([^/]+)/);
  return match ? match[1] : null;
};

const isDreamWorldMap = (url) => {
  try {
    const u = new URL(url);

    // force HTTPS + hostname
    if (u.protocol !== "https:") return false;
    if (u.hostname !== "yume.wiki") return false;

    // normalize extension check
    const imageExtensions = [".png", ".jpg", ".jpeg"];
    return imageExtensions.some(ext =>
      u.pathname.toLowerCase().endsWith(ext)
    );
  } catch {
    return false; // invalid URL
  }
};


module.exports = {
  parseGameName,
  isDreamWorldMap,
};
