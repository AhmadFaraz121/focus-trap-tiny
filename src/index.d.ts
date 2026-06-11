/**
 * Where to send focus: a CSS selector (resolved within the container),
 * an element, or a function returning an element.
 */
export type FocusTarget = string | HTMLElement | (() => HTMLElement | null);

export interface FocusTrapOptions {
  /**
   * Where to send focus on `activate()`.
   * - `true` (default): the first focusable element.
   * - `false`: focus nothing.
   * - {@link FocusTarget}: a selector, element, or function targeting a specific element.
   * @default true
   */
  initialFocus?: boolean | FocusTarget;
  /**
   * Where to send focus on `deactivate()`.
   * - `true` (default): restore the previously focused element.
   * - `false`: focus nothing.
   * - {@link FocusTarget}: a selector, element, or function targeting a specific element.
   * @default true
   */
  returnFocus?: boolean | FocusTarget;
  /**
   * Element to focus when the container has no focusable children.
   * Defaults to the container itself (made programmatically focusable via `tabindex="-1"`).
   */
  fallbackFocus?: FocusTarget;
  /**
   * Callback fired when the `Escape` key is pressed while the trap is active.
   * @default null
   */
  onEscape?: ((event: KeyboardEvent) => void) | null;
}

export interface FocusTrap {
  /** Starts the focus trap. */
  activate(): void;
  /** Stops the trap and optionally restores focus. */
  deactivate(): void;
  /** Re-scans focusable elements. Call after the container's DOM changes. */
  update(): void;
}

/**
 * Creates a focus trap on a given container element.
 *
 * @param container The element to trap focus within.
 * @param options Optional configuration.
 */
export function createFocusTrap(
  container: HTMLElement,
  options?: FocusTrapOptions
): FocusTrap;

export default createFocusTrap;
