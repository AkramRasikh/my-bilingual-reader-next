import '@testing-library/jest-dom';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
