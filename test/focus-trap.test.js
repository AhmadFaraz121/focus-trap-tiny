import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import createFocusTrap from '../src/index.js';

// Wire up a fresh DOM before each test and expose the globals the library uses.
beforeEach(() => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    pretendToBeVisual: true,
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.getComputedStyle = dom.window.getComputedStyle;
  global.HTMLElement = dom.window.HTMLElement;
  global.KeyboardEvent = dom.window.KeyboardEvent;
});

function buildModal(html) {
  document.body.innerHTML = `<button id="outside">outside</button><div id="modal">${html}</div>`;
  return document.getElementById('modal');
}

function pressTab({ shift = false } = {}) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true })
  );
}

test('throws when container is not an element', () => {
  assert.throws(() => createFocusTrap(null), TypeError);
});

test('activate() focuses the first focusable element by default', () => {
  const modal = buildModal('<button id="a">a</button><button id="b">b</button>');
  const trap = createFocusTrap(modal);
  trap.activate();
  assert.equal(document.activeElement.id, 'a');
});

test('initialFocus: false leaves focus untouched', () => {
  const modal = buildModal('<button id="a">a</button>');
  document.getElementById('outside').focus();
  const trap = createFocusTrap(modal, { initialFocus: false });
  trap.activate();
  assert.equal(document.activeElement.id, 'outside');
});

test('Tab from the last element wraps to the first', () => {
  const modal = buildModal('<button id="a">a</button><button id="b">b</button>');
  const trap = createFocusTrap(modal);
  trap.activate();
  document.getElementById('b').focus();
  pressTab();
  assert.equal(document.activeElement.id, 'a');
});

test('Shift+Tab from the first element wraps to the last', () => {
  const modal = buildModal('<button id="a">a</button><button id="b">b</button>');
  const trap = createFocusTrap(modal);
  trap.activate();
  document.getElementById('a').focus();
  pressTab({ shift: true });
  assert.equal(document.activeElement.id, 'b');
});

test('onEscape fires on the Escape key', () => {
  const modal = buildModal('<button id="a">a</button>');
  let called = 0;
  const trap = createFocusTrap(modal, { onEscape: () => { called += 1; } });
  trap.activate();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(called, 1);
});

test('deactivate() restores focus to the previously focused element', () => {
  const modal = buildModal('<button id="a">a</button>');
  document.getElementById('outside').focus();
  const trap = createFocusTrap(modal);
  trap.activate();
  assert.equal(document.activeElement.id, 'a');
  trap.deactivate();
  assert.equal(document.activeElement.id, 'outside');
});

test('deactivate() stops trapping further Tab presses', () => {
  const modal = buildModal('<button id="a">a</button><button id="b">b</button>');
  const trap = createFocusTrap(modal);
  trap.activate();
  trap.deactivate();
  document.getElementById('b').focus();
  pressTab();
  // No longer trapped, so focus should remain where the browser left it.
  assert.equal(document.activeElement.id, 'b');
});

test('disabled and hidden elements are skipped', () => {
  const modal = buildModal(
    '<button id="a">a</button>' +
    '<button id="disabled" disabled>nope</button>' +
    '<button id="hidden" style="display:none">nope</button>' +
    '<button id="z">z</button>'
  );
  const trap = createFocusTrap(modal);
  trap.activate();
  document.getElementById('z').focus();
  pressTab();
  assert.equal(document.activeElement.id, 'a');
});
