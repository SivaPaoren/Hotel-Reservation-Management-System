// Client-only session helper for storing the "logged-in" customer.
// Uses localStorage when available, falls back to in-memory, and emits a change event.

import type { Customer } from "../api/customers";

const KEY = "currentCustomer";

let memoryCustomer: Customer | null = null;

// simple pub/sub so components can react to same-tab login/logout immediately
type Listener = () => void;
const listeners = new Set<Listener>();
function broadcast() {
  for (const fn of [...listeners]) {
    try { fn(); } catch { /* noop */ }
  }
}

function hasWindow() {
  return typeof window !== "undefined";
}

export function getCurrentCustomer(): Customer | null {
  if (!hasWindow()) return memoryCustomer;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Customer;
  } catch {
    return memoryCustomer;
  }
}

export function setCurrentCustomer(c: Customer | null) {
  memoryCustomer = c;
  if (hasWindow()) {
    try {
      if (c) window.localStorage.setItem(KEY, JSON.stringify(c));
      else window.localStorage.removeItem(KEY);
    } catch {
      // ignore storage errors; memory fallback still works
    }
  }
  broadcast(); // notify same-tab listeners
}

export function isLoggedIn(): boolean {
  return !!getCurrentCustomer();
}

export function logout() {
  setCurrentCustomer(null);
}

// Components can subscribe to session changes (login/logout)
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);

  // also mirror cross-tab updates into this tab
  if (hasWindow()) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) broadcast();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(fn);
      window.removeEventListener("storage", onStorage);
    };
  }

  return () => listeners.delete(fn);
}
