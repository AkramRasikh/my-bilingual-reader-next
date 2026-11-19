export type ContentOrigin = 'youtube' | 'netflix';

export const getContentOrigin = (origin?: string | null): ContentOrigin =>
  origin === 'netflix' ? 'netflix' : 'youtube';

const getYoutubeId = (url?: string | null) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1) || null;
    }
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
};

// Netflix has no public thumbnail derivable from a watch ID (artwork lives on
// hashed CDN paths), so only YouTube content gets a remote thumbnail.
export const getContentThumbnailUrl = ({
  origin,
  url,
}: {
  origin?: string | null;
  url?: string | null;
}): string | null => {
  if (getContentOrigin(origin) !== 'youtube') return null;
  const youtubeId = getYoutubeId(url);
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
};

const fallbackGradients = [
  'from-rose-400 to-orange-300',
  'from-sky-400 to-indigo-400',
  'from-emerald-400 to-teal-300',
  'from-violet-400 to-fuchsia-300',
  'from-amber-300 to-lime-300',
  'from-cyan-400 to-blue-300',
] as const;

// Stable per title so the fallback doesn't change between renders.
export const getFallbackThumbnailGradient = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return fallbackGradients[Math.abs(hash) % fallbackGradients.length];
};

// Netflix content stores https://www.netflix.com/watch/<id>; ids are namespaced netflix:<id>.
export const getNetflixWatchUrl = ({
  origin,
  url,
  id,
}: {
  origin?: string | null;
  url?: string | null;
  id?: string | null;
}): string | null => {
  if (getContentOrigin(origin) !== 'netflix') return null;
  const fromUrl = url?.match(/netflix\.com\/watch\/(\d+)/)?.[1];
  const fromId = id?.match(/^netflix:(\d+)$/)?.[1];
  const videoId = fromUrl ?? fromId;
  return videoId ? `https://www.netflix.com/watch/${videoId}` : null;
};
