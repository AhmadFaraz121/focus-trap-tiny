export interface FocusTrapOptions {
  /**
   * Auto-focus the first focusable element on `activate()`.
   * @default true
   */
  initialFocus?: boolean;
  /**
   * Return focus to the previously focused element on `deactivate()`.
   * @default true
   */
  returnFocus?: boolean;
  /**
   * Callback fired when the `Escape` key is pressed while the trap is active.
   * @default null
   */
  onEscape?: ((event: KeyboardEvent) => void) | null;
}

export interface FocusTrap {
  /** Starts the focus trap. */
  activate(): void;
  /** Stops the trap and optionally restores previously focused element. */
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
