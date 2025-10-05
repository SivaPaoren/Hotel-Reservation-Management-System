// frontend/src/lib/adminSession.ts
// Simple local flag for admin mode (no authentication).

const KEY = "isAdmin";

function hasWindow() {
  return typeof window !== "undefined";
}

// ✅ Get whether the current session is admin
export function isAdmin(): boolean {
  if (!hasWindow()) return false;
  try {
    return window.localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

// ✅ Set or clear admin mode
export function setAdminFlag(value: boolean) {
  if (!hasWindow()) return;
  try {
    if (value) window.localStorage.setItem(KEY, "true");
    else window.localStorage.removeItem(KEY);
  } catch {
    // ignore storage errors
  }
}

// ✅ Clear flag explicitly (for logout)
export function logoutAdmin() {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
