require('@testing-library/jest-dom');

// jsdom doesn't implement the native <dialog> modal methods (jsdom#3294) — polyfill the
// minimal behavior our components rely on so tests can exercise real showModal()/close() calls.
if (typeof window !== 'undefined' && window.HTMLDialogElement && !window.HTMLDialogElement.prototype.showModal) {
  window.HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  window.HTMLDialogElement.prototype.close = function close(returnValue) {
    if (returnValue !== undefined) {
      this.returnValue = returnValue;
    }
    this.removeAttribute('open');
    this.dispatchEvent(new window.Event('close'));
  };
}
