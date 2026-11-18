/**
 * jsdom has `<dialog>` and its `open` attribute but none of its behavior. This adds the
 * minimum the app relies on, as browsers do it: `showModal()`, `close()` with its `close`
 * event, and Escape firing a cancelable `cancel` and then closing the topmost modal dialog.
 * Focus trapping and the top layer are not emulated. Test-only: never import from app code.
 */
export function polyfillDialog() {
  // Node-environment test files share this setup and have no DOM.
  if (typeof HTMLDialogElement === "undefined") return;
  const proto = HTMLDialogElement.prototype;
  if (typeof proto.showModal === "function") return;

  const modals: HTMLDialogElement[] = [];

  proto.showModal = function showModal(this: HTMLDialogElement) {
    if (this.open) {
      if (modals.includes(this)) return;
      throw new DOMException("The dialog is already open as a non-modal dialog.", "InvalidStateError");
    }
    if (!this.isConnected) throw new DOMException("The dialog is not connected.", "InvalidStateError");
    this.setAttribute("open", "");
    modals.push(this);
  };

  proto.show = function show(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };

  proto.close = function close(this: HTMLDialogElement, returnValue?: string) {
    if (!this.open) return;
    this.removeAttribute("open");
    if (returnValue !== undefined) this.returnValue = returnValue;
    const index = modals.indexOf(this);
    if (index >= 0) modals.splice(index, 1);
    // Browsers queue this as a task; dispatching it synchronously is enough for the tests.
    this.dispatchEvent(new Event("close"));
  };

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    // Dialogs removed from the document (unmounted while open) no longer count.
    const top = modals.filter((dialog) => dialog.isConnected && dialog.open).at(-1);
    if (!top) return;
    const cancel = new Event("cancel", { cancelable: true });
    if (top.dispatchEvent(cancel)) top.close();
  });
}
