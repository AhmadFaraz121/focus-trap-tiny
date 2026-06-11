/**
 * focus-trap-tiny
 * A lightweight, zero-dependency focus trap for modals and dialogs.
 * Uses native browser APIs — no polyfills needed.
 */

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
  'audio[controls]',
  'video[controls]',
].join(', ');

/**
 * Creates a focus trap on a given container element.
 *
 * @param {HTMLElement} container - The element to trap focus within.
 * @param {Object} [options]
 * @param {boolean} [options.initialFocus=true] - Auto-focus the first focusable element on activation.
 * @param {boolean} [options.returnFocus=true] - Return focus to the previously focused element on deactivation.
 * @param {Function} [options.onEscape] - Callback when Escape key is pressed.
 * @returns {{ activate: Function, deactivate: Function, update: Function }}
 */
function createFocusTrap(container, options = {}) {
  if (!container || typeof container.querySelectorAll !== 'function') {
    throw new TypeError('createFocusTrap: `container` must be an HTMLElement');
  }

  const {
    initialFocus = true,
    returnFocus = true,
    onEscape = null,
  } = options;

  let isActive = false;
  let previouslyFocused = null;
  let focusableElements = [];

  function isVisible(el) {
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function getFocusableElements() {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
      (el) => !el.closest('[inert]') && isVisible(el)
    );
  }

  function handleKeyDown(e) {
    if (!isActive) return;

    if (e.key === 'Escape' && typeof onEscape === 'function') {
      onEscape(e);
      return;
    }

    if (e.key !== 'Tab') return;

    focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      // Shift+Tab: going backwards
      if (active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: going forwards
      if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function activate() {
    if (isActive) return;
    isActive = true;

    previouslyFocused = document.activeElement;
    focusableElements = getFocusableElements();

    document.addEventListener('keydown', handleKeyDown);

    if (initialFocus && focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  function deactivate() {
    if (!isActive) return;
    isActive = false;

    document.removeEventListener('keydown', handleKeyDown);

    if (returnFocus && previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  }

  /** Call this if the container's contents change dynamically */
  function update() {
    focusableElements = getFocusableElements();
  }

  return { activate, deactivate, update };
}

export { createFocusTrap };
export default createFocusTrap;
