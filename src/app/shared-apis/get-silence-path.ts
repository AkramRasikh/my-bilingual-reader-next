import path from 'path';

export const getSilencePath = () =>
  path.join(process.cwd(), 'public', 'audio', 'silence.wav');
