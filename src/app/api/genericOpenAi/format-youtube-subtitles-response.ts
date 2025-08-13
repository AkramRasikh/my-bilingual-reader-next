export interface YoutubeSubsRes {
  tStartMs: number;
  dDurationMs?: number;
  id?: number;
  wpWinPosId?: number;
  wsWinStyleId?: number;
  wWinId?: number;
  segs?: Seg[];
  aAppend?: number;
}

export interface Seg {
  utf8: string;
  acAsrConf?: number;
  tOffsetMs?: number;
}

export const formatRawTranscript = (responseDataObj) => {
  let wordCount = 0;
  const subs = [] as string[];

  responseDataObj.events.forEach((target) => {
    if (target?.segs) {
      const textChunk = target.segs.map((seg) => seg.utf8).join('');
      const isLineBreak = textChunk === '\n';

      if (!isLineBreak) {
        subs.push(textChunk);
      }
    }
  });

  const subtitleText = subs.join(' ');

  subs.map((item) => {
    const sentenceToArr = item.split(' ');
    wordCount = wordCount += sentenceToArr.length;
  });
  console.log('## wordCount', wordCount);

  return subtitleText;
};
