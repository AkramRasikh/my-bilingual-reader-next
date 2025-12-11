export const isE2EMode = () => {
  return typeof window !== 'undefined' && window.localStorage.getItem('e2e-testing') === 'true';
};
