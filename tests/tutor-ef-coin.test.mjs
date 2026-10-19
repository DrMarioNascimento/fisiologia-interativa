import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../tutor-ef-coin.js', import.meta.url), 'utf8');

function setup(path = '/tutor-ef.html', stored = {}) {
  class Element {
    events = {}; style = {}; attributes = {}; dataset = {}; classes = new Set(); captured = new Set();
    classList = { add: x => this.classes.add(x), remove: x => this.classes.delete(x) };
    addEventListener(type, fn) { (this.events[type] ||= []).push(fn); }
    emit(type, data = {}) { for (const fn of this.events[type] || []) fn({ pointerId: 1, isPrimary: true, button: 0, clientX: 700, clientY: 500, detail: 1, ...data }); }
    setAttribute(k, v) { this.attributes[k] = v; }
    setPointerCapture(id) { this.captured.add(id); }
    hasPointerCapture(id) { return this.captured.has(id); }
    releasePointerCapture(id) { this.captured.delete(id); }
    get offsetLeft() { return parseFloat(this.style.left ?? 700); }
    get offsetTop() { return parseFloat(this.style.top ?? 500); }
    offsetWidth = 78; offsetHeight = 78;
  }
  const btn = new Element(), portrait = new Element(), badge = new Element(), sound = new Element();
  btn.querySelector = selector => selector === '.tutor-portrait' ? portrait : badge;
  const storage = new Map(Object.entries(stored)), resize = [];
  const context = { URL, location: { pathname: path }, performance: { now: () => 1000 },
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
    innerWidth: 1000, innerHeight: 700,
    document: { currentScript: { src: 'https://example.com/tutor-ef-coin.js' }, createElement: () => sound,
      querySelector: () => ({ insertBefore() {} }), addEventListener() {} },
    MutationObserver: class { observe() {} }, matchMedia: () => ({ matches: false }) };
  context.window = { addEventListener: (type, fn) => { if (type === 'resize') resize.push(fn); } };
  vm.runInNewContext(source, context);
  let toggles = 0;
  context.window.tutorEFCoin?.attach(btn, () => toggles++, () => {});
  return { btn, storage, sound, context, resize: () => resize.forEach(fn => fn()), toggles: () => toggles };
}

test('Drag moves and saves the coin without opening the tutor; a subsequent click works', () => {
  const s = setup();
  s.btn.emit('pointerdown'); s.btn.emit('pointermove', { clientX: 520, clientY: 340 });
  s.btn.emit('pointerup'); s.btn.emit('click');
  assert.equal(s.toggles(), 0);
  assert.deepEqual(JSON.parse(s.storage.get('tutorEFPosition')), { left: 520, top: 340 });
  s.btn.emit('pointerdown'); s.btn.emit('pointerup'); s.btn.emit('click');
  assert.equal(s.toggles(), 1);
});
test('Touch cancellation never opens the tutor; keyboard click still works', () => {
  const s = setup(); s.btn.emit('pointerdown'); s.btn.emit('pointercancel'); s.btn.emit('click');
  assert.equal(s.toggles(), 0); assert.equal(s.btn.captured.size, 0);
  s.btn.emit('click', { detail: 0 }); assert.equal(s.toggles(), 1);
});
test('Saved position and resized viewport keep the coin reachable; Alt+arrows move it', () => {
  const s = setup('/tutor-ef.html', { tutorEFPosition: '{"left":5000,"top":-20}' });
  assert.equal(s.btn.offsetLeft, 916); assert.equal(s.btn.offsetTop, 6);
  s.context.innerWidth = 390; s.context.innerHeight = 640; s.resize();
  assert.equal(s.btn.offsetLeft, 306);
  s.btn.emit('keydown', { altKey: true, key: 'ArrowLeft', preventDefault() {} });
  assert.equal(s.btn.offsetLeft, 286);
});
test('Sound is off initially, opt-in persists, and other tutors are untouched', () => {
  const s = setup(); assert.equal(s.sound.attributes['aria-pressed'], 'false');
  s.sound.emit('click'); assert.equal(s.storage.get('tutorEFCoinSound'), 'on');
  assert.equal(setup('/tutor-fisio.html').context.window.tutorEFCoin, undefined);
});
