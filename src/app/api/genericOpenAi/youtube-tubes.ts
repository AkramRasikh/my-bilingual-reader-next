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
