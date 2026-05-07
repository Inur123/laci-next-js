/**
 * Polyfills untuk browser lama (Safari 15 / iPhone 7+)
 * Harus diimport PERTAMA sebelum semua kode lain yang berjalan di browser.
 *
 * Safari 15.x tidak mendukung:
 * - structuredClone (tersedia di 15.4+)
 * - Object.hasOwn (tersedia di 15.4+)
 * - String.prototype.replaceAll (tersedia di 13.1+ — seharusnya aman, tapi dicek)
 * - Array.prototype.findLast / findLastIndex (tersedia di 15.4+)
 * - Array.prototype.at (tersedia di 15.4+)
 */

// ─── structuredClone ─────────────────────────────────────────────────────────
if (typeof globalThis !== "undefined" && typeof globalThis.structuredClone !== "function") {
  (globalThis as any).structuredClone = function structuredClone(obj: unknown) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// ─── Object.hasOwn ───────────────────────────────────────────────────────────
if (typeof Object.hasOwn !== "function") {
  Object.defineProperty(Object, "hasOwn", {
    value: function hasOwn(obj: object, key: PropertyKey) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

// ─── String.prototype.replaceAll ─────────────────────────────────────────────
if (typeof String.prototype.replaceAll !== "function") {
  Object.defineProperty(String.prototype, "replaceAll", {
    value: function replaceAll(this: string, search: string | RegExp, replacement: string | ((substring: string, ...args: unknown[]) => string)) {
      if (search instanceof RegExp) {
        if (!search.flags.includes("g")) {
          throw new TypeError("String.prototype.replaceAll called with a non-global RegExp argument");
        }
        return this.replace(search, replacement as any);
      }
      return this.split(String(search)).join(typeof replacement === "function" ? undefined as any : String(replacement));
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

// ─── Array.prototype.at ──────────────────────────────────────────────────────
if (typeof Array.prototype.at !== "function") {
  Object.defineProperty(Array.prototype, "at", {
    value: function at(this: unknown[], index: number) {
      const len = this.length;
      const relativeIndex = Math.trunc(index) || 0;
      const k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
      if (k < 0 || k >= len) return undefined;
      return this[k];
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

// ─── Array.prototype.findLast ─────────────────────────────────────────────────
if (typeof Array.prototype.findLast !== "function") {
  Object.defineProperty(Array.prototype, "findLast", {
    value: function findLast<T>(this: T[], predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: unknown): T | undefined {
      for (let i = this.length - 1; i >= 0; i--) {
        if (predicate.call(thisArg, this[i], i, this)) {
          return this[i];
        }
      }
      return undefined;
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

// ─── Array.prototype.findLastIndex ───────────────────────────────────────────
if (typeof Array.prototype.findLastIndex !== "function") {
  Object.defineProperty(Array.prototype, "findLastIndex", {
    value: function findLastIndex<T>(this: T[], predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: unknown): number {
      for (let i = this.length - 1; i >= 0; i--) {
        if (predicate.call(thisArg, this[i], i, this)) {
          return i;
        }
      }
      return -1;
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

// ─── queueMicrotask ──────────────────────────────────────────────────────────
if (typeof globalThis.queueMicrotask !== "function") {
  (globalThis as any).queueMicrotask = function queueMicrotask(callback: () => void) {
    Promise.resolve().then(callback);
  };
}

// ─── crypto.randomUUID ──────────────────────────────────────────────────────
if (typeof crypto !== "undefined" && typeof crypto.randomUUID !== "function") {
  (crypto as any).randomUUID = function randomUUID() {
    return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c: any) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16),
    );
  };
}

// ─── AbortSignal.timeout ─────────────────────────────────────────────────────
if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout !== "function") {
  (AbortSignal as any).timeout = function timeout(ms: number) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}

export {};
