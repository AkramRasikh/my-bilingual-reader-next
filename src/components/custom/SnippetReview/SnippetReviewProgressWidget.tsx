export function getSnippetBoundaryFillStyle(
  progress: number,
  direction: 'ltr' | 'rtl',
): React.CSSProperties {
  const amount = Math.min(1, Math.max(0, progress)) * 100;
  const played = '#cde2fe';
  const rest = '#f6f7f8';
  const to = direction === 'rtl' ? 'to left' : 'to right';

  return {
    backgroundImage: `linear-gradient(${to}, ${played} ${amount}%, ${rest} ${amount}%)`,
    boxDecorationBreak: 'slice',
    WebkitBoxDecorationBreak: 'slice',
  };
}
