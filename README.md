# focus-trap-tiny

A lightweight, **zero-dependency** focus trap for modals and dialogs.  
Uses native browser APIs — no polyfills, no bloat.

[![npm](https://img.shields.io/npm/v/focus-trap-tiny)](https://www.npmjs.com/package/focus-trap-tiny)
[![license](https://img.shields.io/npm/l/focus-trap-tiny)](./LICENSE)
[![gzip size](https://img.shields.io/bundlephobia/minzip/focus-trap-tiny)](https://bundlephobia.com/package/focus-trap-tiny)

**[▶ Live Demo](https://ahmadfaraz121.github.io/focus-trap-tiny/)**

---

## Why?

Existing solutions like `focus-trap` are powerful but pull in dependencies and polyfills you probably don't need anymore. `focus-trap-tiny` does one thing well: traps keyboard focus inside a container using only what the browser already gives you.

- **< 1 KB** minified + gzipped
- **Zero dependencies**
- Works with any framework or vanilla JS
- Handles `Shift+Tab`, `inert`, hidden elements, and dynamic content
- Returns focus on deactivation (great for modals)

---

## Install

```bash
npm install focus-trap-tiny
```

---

## Usage

```js
import createFocusTrap from 'focus-trap-tiny';

const modal = document.getElementById('my-modal');
const trap = createFocusTrap(modal, {
  onEscape: () => closeModal(),
});

// When modal opens
trap.activate();

// When modal closes
trap.deactivate();
```

---

## API

### `createFocusTrap(container, options?)`

| Parameter   | Type          | Description                          |
|-------------|---------------|--------------------------------------|
| `container` | `HTMLElement` | The element to trap focus within.    |
| `options`   | `Object`      | Optional configuration (see below).  |

#### Options

| Option         | Type       | Default | Description                                                   |
|----------------|------------|---------|---------------------------------------------------------------|
| `initialFocus` | `boolean`  | `true`  | Auto-focus the first focusable element on `activate()`.       |
| `returnFocus`  | `boolean`  | `true`  | Return focus to the previously focused element on `deactivate()`. |
| `onEscape`     | `Function` | `null`  | Callback fired when the `Escape` key is pressed.              |

#### Returns

| Method       | Description                                               |
|--------------|-----------------------------------------------------------|
| `activate()` | Starts the focus trap.                                    |
| `deactivate()` | Stops the trap and optionally restores previous focus.  |
| `update()`   | Re-scans focusable elements (call after DOM changes).     |

---

## What counts as "focusable"?

- `<a href>`
- `<button>` (not disabled)
- `<input>`, `<select>`, `<textarea>` (not disabled)
- Elements with `tabindex` ≥ 0
- `<details> > <summary>`
- `<audio controls>`, `<video controls>`

Elements that are `display: none` or inside an `[inert]` container are automatically excluded.

---

## Framework Examples

### React

```jsx
import { useEffect, useRef } from 'react';
import createFocusTrap from 'focus-trap-tiny';

function Modal({ isOpen, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const trap = createFocusTrap(ref.current, { onEscape: onClose });
    trap.activate();
    return () => trap.deactivate();
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return <div ref={ref} role="dialog" aria-modal="true">{children}</div>;
}
```

### Vue

```vue
<script setup>
import { ref, watch } from 'vue';
import createFocusTrap from 'focus-trap-tiny';

const props = defineProps(['isOpen']);
const emit = defineEmits(['close']);
const dialogRef = ref(null);

watch(() => props.isOpen, (open) => {
  if (open && dialogRef.value) {
    const trap = createFocusTrap(dialogRef.value, { onEscape: () => emit('close') });
    trap.activate();
  }
});
</script>
```

---

## License

MIT
