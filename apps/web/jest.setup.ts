import "@testing-library/jest-dom";

// jsdom doesn't implement Pointer Events pointer capture methods used by Radix UI.
// Provide no-op implementations so tests that simulate pointer interactions don't throw.
if (typeof (HTMLElement.prototype as any).hasPointerCapture !== "function") {
  (HTMLElement.prototype as any).hasPointerCapture = () => false;
  (HTMLElement.prototype as any).setPointerCapture = () => {};
  (HTMLElement.prototype as any).releasePointerCapture = () => {};
}

if (typeof (Element.prototype as any).scrollIntoView !== "function") {
  (Element.prototype as any).scrollIntoView = () => {};
}
