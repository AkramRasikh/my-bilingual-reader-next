import { v4 as uuidv4 } from 'uuid';

const squashSubtitles = (subs) => {
  const result = {};

  for (const sub of subs) {
    const [h, m, sMs] = sub.start.split(':');
    const seconds = Math.floor(
      parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(sMs.replace(',', '.')),
    );

    if (!result[seconds]) {
      result[seconds] = sub.text;
    } else {
      result[seconds] += ' ' + sub.text;
    }
  }

  return Object.entries(result).map(([time, text]) => ({
    id: uuidv4(),
    time: Number(time),
    targetLang: text.replace(/\s+/g, ''),
  }));
};

export default squashSubtitles;
