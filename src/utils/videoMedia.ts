function cleanYouTubeId(value: string | undefined) {
  const videoId = value?.trim();

  if (!videoId) {
    return null;
  }

  return /^[A-Za-z0-9_-]{6,}$/.test(videoId) ? videoId : null;
}

function isYouTubeHost(hostname: string) {
  const normalizedHostname = hostname.replace(/^www\./, "").toLowerCase();

  return (
    normalizedHostname === "youtube.com" ||
    normalizedHostname.endsWith(".youtube.com") ||
    normalizedHostname === "youtube-nocookie.com" ||
    normalizedHostname.endsWith(".youtube-nocookie.com")
  );
}

export function getYouTubeVideoId(videoSrc: string) {
  let url: URL;

  try {
    url = new URL(videoSrc);
  } catch {
    return null;
  }

  const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (hostname === "youtu.be") {
    return cleanYouTubeId(pathParts[0]);
  }

  if (!isYouTubeHost(hostname)) {
    return null;
  }

  if (pathParts[0] === "embed" || pathParts[0] === "shorts" || pathParts[0] === "live") {
    return cleanYouTubeId(pathParts[1]);
  }

  return cleanYouTubeId(url.searchParams.get("v") ?? undefined);
}

export function getYouTubeEmbedSrc(videoSrc: string) {
  const videoId = getYouTubeVideoId(videoSrc);

  if (!videoId) {
    return videoSrc;
  }

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function isYouTubeVideoSrc(videoSrc: string | undefined) {
  return Boolean(videoSrc && getYouTubeVideoId(videoSrc));
}

export function isYouTubeShortsSrc(videoSrc: string | undefined) {
  if (!videoSrc) {
    return false;
  }

  let url: URL;

  try {
    url = new URL(videoSrc);
  } catch {
    return false;
  }

  if (!isYouTubeHost(url.hostname)) {
    return false;
  }

  return url.pathname.split("/").filter(Boolean)[0] === "shorts";
}

export function shouldUsePortraitVideoFrame(videoSrc: string | undefined) {
  if (!videoSrc) {
    return false;
  }

  return isYouTubeShortsSrc(videoSrc) || !isYouTubeVideoSrc(videoSrc);
}

export function getVideoMimeType(videoSrc: string) {
  const path = videoSrc.split(/[?#]/)[0]?.toLowerCase() ?? "";

  if (path.endsWith(".webm")) {
    return "video/webm";
  }

  if (path.endsWith(".ogg") || path.endsWith(".ogv")) {
    return "video/ogg";
  }

  if (path.endsWith(".mov")) {
    return "video/quicktime";
  }

  return "video/mp4";
}
