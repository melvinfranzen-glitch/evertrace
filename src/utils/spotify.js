/**
 * Parst eine Spotify-URL in embed-fähige Bestandteile.
 * Unterstützt: open.spotify.com URLs (mit/ohne intl-Prefix, mit/ohne Query),
 * sowie spotify: URIs.
 *
 * Gibt { type, id, embedUrl } zurück oder null bei ungültiger URL.
 */
export function parseSpotifyUrl(url) {
  if (!url || typeof url !== 'string') return null;

  // spotify:type:id URI format
  const uriMatch = url.match(/^spotify:(playlist|album|track|episode|show):([a-zA-Z0-9]+)/);
  if (uriMatch) {
    const [, type, id] = uriMatch;
    return { type, id, embedUrl: `https://open.spotify.com/embed/${type}/${id}` };
  }

  // open.spotify.com URL (with optional intl-XX prefix, query params, etc.)
  const urlMatch = url.match(/spotify\.com\/(?:intl-[a-z]{2}\/)?(playlist|album|track|episode|show)\/([a-zA-Z0-9]+)/);
  if (urlMatch) {
    const [, type, id] = urlMatch;
    return { type, id, embedUrl: `https://open.spotify.com/embed/${type}/${id}` };
  }

  return null;
}