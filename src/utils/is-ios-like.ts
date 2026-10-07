export const isIosLike = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  // iPadOS “desktop” / “request desktop site”: Mac UA + touch
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
};
