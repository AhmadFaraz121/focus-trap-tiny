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
 * @typedef {string | HTMLElement | (() => (HTMLElement | null))} FocusTarget
 */

/**
 * Creates a focus trap on a given container element.
 *
 * @param {HTMLElement} container - The element to trap focus within.
 * @param {Object} [options]
 * @param {boolean | FocusTarget} [options.initialFocus=true] - Where to send focus on activation.
 *   `true` focuses the first focusable element, `false` focuses nothing, or pass a
 *   selector / element / function to target a specific element.
 * @param {boolean | FocusTarget} [options.returnFocus=true] - Where to send focus on deactivation.
 *   `true` restores the previously focused element, `false` does nothing, or pass a
 *   selector / element / function to target a specific element.
 * @param {FocusTarget} [options.fallbackFocus] - Element to focus when the container has no
 *   focusable children. Defaults to the container itself (made programmatically focusable).
 * @param {Function} [options.onEscape] - Callback when the Escape key is pressed.
 * @returns {{ activate: Function, deactivate: Function, update: Function }}
 */
function createFocusTrap(container, options = {}) {
  if (!container || typeof container.querySelectorAll !== 'function') {
    throw new TypeError('createFocusTrap: `container` must be an HTMLElement');
  }

  const {
    initialFocus = true,
    returnFocus = true,
    fallbackFocus = null,
    onEscape = null,
  } = options;

  let isActive = false;
  let previouslyFocused = null;
  let focusableElements = [];
  let addedTabindex = false;

  function isVisible(el) {
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function getFocusableElements() {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
      (el) => !el.closest('[inert]') && isVisible(el)
    );
  }

  /**
   * Resolve a FocusTarget (selector | element | function) to an element, or null.
   * Selectors resolve within `root` (the container for initial/fallback focus, the
   * document for return focus, which usually targets the trigger outside the modal).
   */
  function resolveTarget(target, root = container) {
    if (typeof target === 'function') target = target();
    if (typeof target === 'string') return root.querySelector(target);
    if (target && typeof target.focus === 'function') return target;
    return null;
  }

  /** The element to fall back to when nothing focusable exists: option, else the container. */
  function getFallbackTarget() {
    const resolved = resolveTarget(fallbackFocus);
    if (resolved) return resolved;
    if (!container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '-1');
      addedTabindex = true;
    }
    return container;
  }

  function getInitialFocusTarget() {
    if (initialFocus === false) return null;
    if (initialFocus === true) return focusableElements[0] || getFallbackTarget();
    return resolveTarget(initialFocus) || focusableElements[0] || getFallbackTarget();
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

  /** Pull focus back inside if it escapes via mouse click or a programmatic focus(). */
  function handleFocusIn(e) {
    if (!isActive || container.contains(e.target)) return;
    e.stopImmediatePropagation();
    focusableElements = getFocusableElements();
    const target = focusableElements[0] || getFallbackTarget();
    if (target && typeof target.focus === 'function') target.focus();
  }

  function activate() {
    if (isActive) return;
    isActive = true;

    previouslyFocused = document.activeElement;
    focusableElements = getFocusableElements();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    const target = getInitialFocusTarget();
    if (target && typeof target.focus === 'function') target.focus();
  }

  function deactivate() {
    if (!isActive) return;
    isActive = false;

    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('focusin', handleFocusIn);

    if (addedTabindex) {
      container.removeAttribute('tabindex');
      addedTabindex = false;
    }

    let returnTarget = null;
    if (returnFocus === true) returnTarget = previouslyFocused;
    else if (returnFocus !== false) returnTarget = resolveTarget(returnFocus, document);

    if (returnTarget && typeof returnTarget.focus === 'function') {
      returnTarget.focus();
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
