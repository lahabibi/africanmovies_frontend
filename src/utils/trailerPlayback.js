const DIRECT_PLAYBACK_KEYS = [
  "playbackUrl",
  "playbackURL",
  "iframeUrl",
  "iframeURL",
  "trailerUrl",
  "trailerURL",
  "streamUrl",
  "streamURL",
  "url",
  "src",
];

const CLOUDFLARE_IFRAME_BASE = "https://iframe.videodelivery.net";

export function resolveTrailerPlaybackSource(accessData, movie) {
  const directUrl = getDirectPlaybackUrl(accessData);

  if (directUrl) {
    return buildPlaybackSource(directUrl);
  }

  const signedCloudflareUrl = buildSignedCloudflareUrl(accessData);

  if (signedCloudflareUrl) {
    return {
      src: signedCloudflareUrl,
      type: "iframe",
    };
  }

  const fallbackUrl = movie?.trailerUrl || movie?.videoSrc || movie?.videoUrl;

  if (fallbackUrl && fallbackUrl !== "#") {
    return buildPlaybackSource(fallbackUrl);
  }

  return null;
}

function getDirectPlaybackUrl(accessData) {
  if (!accessData || typeof accessData !== "object") {
    return "";
  }

  return DIRECT_PLAYBACK_KEYS.map((key) => accessData[key]).find(Boolean) || "";
}

function buildSignedCloudflareUrl(accessData) {
  const token = accessData?.playbackToken || accessData?.token;

  if (!token) {
    return "";
  }

  const videoId =
    accessData.videoId ||
    accessData.videoUID ||
    accessData.uid ||
    accessData.streamId ||
    getJwtSubject(token);

  if (!videoId) {
    return "";
  }

  const url = new URL(`${CLOUDFLARE_IFRAME_BASE}/${videoId}`);
  url.searchParams.set("token", token);
  url.searchParams.set("autoplay", "true");

  return url.toString();
}

function buildPlaybackSource(url) {
  const normalizedUrl = withCloudflareIframeParams(url);

  return {
    src: normalizedUrl,
    type: isNativeVideoUrl(normalizedUrl) ? "video" : "iframe",
  };
}

function withCloudflareIframeParams(url) {
  if (!url.includes("iframe.videodelivery.net")) {
    return url;
  }

  try {
    const embedUrl = new URL(url);
    embedUrl.searchParams.set("autoplay", "true");
    return embedUrl.toString();
  } catch {
    return url;
  }
}

function isNativeVideoUrl(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function getJwtSubject(token) {
  const [, payload] = String(token).split(".");

  if (!payload) {
    return "";
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );
    const decodedPayload = JSON.parse(window.atob(paddedPayload));

    return decodedPayload.sub || "";
  } catch {
    return "";
  }
}
