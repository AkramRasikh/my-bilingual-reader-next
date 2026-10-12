export type YoutubeFormatKind = 'audio' | 'video' | 'both';

export type YoutubeFormat = {
  id: string;
  ext: string;
  resolution: string | null;
  fps: number | null;
  filesize: number | null;
  vcodec: string | null;
  acodec: string | null;
  note: string | null;
  kind: YoutubeFormatKind;
};

const FORMAT_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,32}$/;

export const isYoutubeFormatId = (value: unknown): value is string =>
  typeof value === 'string' && FORMAT_ID.test(value);

type RawFormat = {
  format_id?: string;
  ext?: string;
  resolution?: string;
  fps?: number;
  filesize?: number;
  filesize_approx?: number;
  vcodec?: string;
  acodec?: string;
  format_note?: string;
};

const isStoryboard = (format: RawFormat) => {
  const id = format.format_id ?? '';
  return (
    format.vcodec === 'images' ||
    /^sb\d*$/i.test(id) ||
    format.ext === 'mhtml'
  );
};

const kindOf = (format: RawFormat): YoutubeFormatKind | null => {
  const hasVideo = !!format.vcodec && format.vcodec !== 'none';
  const hasAudio = !!format.acodec && format.acodec !== 'none';
  if (hasVideo && hasAudio) return 'both';
  if (hasVideo) return 'video';
  if (hasAudio) return 'audio';
  return null;
};

export const mapYoutubeFormats = (formats: RawFormat[]): YoutubeFormat[] =>
  formats.flatMap((format) => {
    if (isStoryboard(format) || !format.format_id) return [];
    const kind = kindOf(format);
    if (!kind) return [];

    return [
      {
        id: format.format_id,
        ext: format.ext ?? '',
        resolution: format.resolution ?? null,
        fps: format.fps ?? null,
        filesize: format.filesize ?? format.filesize_approx ?? null,
        vcodec: format.vcodec && format.vcodec !== 'none' ? format.vcodec : null,
        acodec: format.acodec && format.acodec !== 'none' ? format.acodec : null,
        note: format.format_note ?? null,
        kind,
      },
    ];
  });
