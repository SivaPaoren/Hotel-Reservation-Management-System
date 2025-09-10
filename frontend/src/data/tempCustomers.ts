// src/data/tempCustomers.ts
// Ephemeral in-memory customer + admin store. Clears on full page reload.

// ---------- Customer types / state (UNCHANGED API) ----------
export type Customer = {
  customer_id: number;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  created_at: string; // ISO
};

let _customers: Customer[] = [];
let _creds: Record<string, string> = Object.create(null); // email -> password (demo-only)
let _current: Customer | null = null;                      // current CUSTOMER session
let _nextId = 1;

// ---------- Admin types / state (NEW, additive) ----------
export type Admin = {
  admin_id: number;
  name: string;
  email: string;
  created_at: string; // ISO
};

let _admins: Admin[] = [];
let _adminCreds: Record<string, string> = Object.create(null); // email -> password
let _currentAdmin: Admin | null = null;                        // current ADMIN session
let _nextAdminId = 1;

// ---------- Event bus (shared) ----------
const _listeners = new Set<() => void>();
function _emit() { for (const fn of _listeners) { try { fn(); } catch {} } }

// Optional: components can subscribe to auth changes (e.g., Navbar).
export function subscribe(fn: () => void) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

// ---------- Customer queries (UNCHANGED) ----------
export function listCustomers(): Customer[] { return [..._customers]; }
export function getCurrentUser(): Customer | null { return _current; }
export function getCustomerByEmail(email: string): Customer | null {
  return _customers.find(c => c.email === email) ?? null;
}

// ---------- Customer session actions (UNCHANGED) ----------
export function logout(): void {
  _current = null;
  _emit();
}

export function login({ email, password }: { email: string; password: string }): Customer {
  if (!email || !password) throw new Error("Email and password are required.");
  const user = getCustomerByEmail(email);
  if (!user || _creds[email] !== password) throw new Error("Invalid email or password.");
  _current = user;
  _emit();
  return user;
}

export function register(
  { name, email, password, phone = "", nationality = "" }:
  { name: string; email: string; password: string; phone?: string; nationality?: string }
): Customer {
  if (!name || !email || !password) throw new Error("Name, email, and password are required.");
  if (getCustomerByEmail(email)) throw new Error("That email is already registered.");

  const customer: Customer = {
    customer_id: _nextId++,
    name,
    email,
    phone,
    nationality,
    created_at: new Date().toISOString(),
  };
  _customers.push(customer);
  _creds[email] = password;

  // Auto-login on register (demo UX).
  _current = customer;
  _emit();
  return customer;
}

// ---------- Admin helpers (NEW) ----------
export function listAdmins(): Admin[] { return [..._admins]; }
export function getCurrentAdmin(): Admin | null { return _currentAdmin; }
export function isAdminLoggedIn(): boolean { return _currentAdmin != null; }

export function loginAdmin({ email, password }: { email: string; password: string }): Admin {
  if (!email || !password) throw new Error("Email and password are required.");
  const admin = _admins.find(a => a.email === email);
  if (!admin || _adminCreds[email] !== password) throw new Error("Invalid admin credentials.");
  _currentAdmin = admin;
  _emit();
  return admin;
}

export function logoutAdmin(): void {
  _currentAdmin = null;
  _emit();
}

// ---------- Seeds (customer + admin) ----------
(function seedOnce() {
  if (_customers.length === 0) {
    const demo: Customer = {
      customer_id: _nextId++,
      name: "Demo User",
      email: "demo@hotel.test",
      phone: "081-234-5678",
      nationality: "Demo",
      created_at: new Date().toISOString(),
    };
    _customers.push(demo);
    _creds[demo.email] = "demo123";
  }

  if (_admins.length === 0) {
    const root: Admin = {
      admin_id: _nextAdminId++,
      name: "Admin User",
      email: "admin@hotel.test",
      created_at: new Date().toISOString(),
    };
    _admins.push(root);
    _adminCreds[root.email] = "demo123";
  }
})();
