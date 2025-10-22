import { v4 as uuidv4 } from 'uuid';

const squashSubtitles = (subs, squash) => {
  const result = {};

  for (const sub of subs) {
    const [h, m, sMs] = sub.start.split(':');
    const seconds = Math.floor(
      parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(sMs.replace(',', '.')),
    );

    if (!result[seconds]) {
      result[seconds] = {
        targetLang: sub.targetLang,
        baseLang: sub.baseLang || '',
      };
    } else {
      result[seconds].targetLang += ' ' + sub.targetLang;
      result[seconds].baseLang += ' ' + (sub.baseLang || '');
    }
  }

  return Object.entries(result).map(([time, { targetLang, baseLang }]) => ({
    id: uuidv4(),
    time: Number(time),
    targetLang: squash ? targetLang.replace(/\s+/g, '') : targetLang,
    baseLang,
  }));
};

export default squashSubtitles;
