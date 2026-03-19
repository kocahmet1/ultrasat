// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const originalConsoleError = console.error.bind(console);

console.error = (...args) => {
  const [firstArg] = args;
  const message = typeof firstArg === 'string' ? firstArg : '';

  if (message.includes('Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`')) {
    return;
  }

  originalConsoleError(...args);
};

Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

if (typeof global.setImmediate !== 'function') {
  global.setImmediate = (callback, ...args) => setTimeout(callback, 0, ...args);
}

if (typeof global.clearImmediate !== 'function') {
  global.clearImmediate = (handle) => clearTimeout(handle);
}

window.alert = jest.fn();
