// Ephemeral in-memory customer/session store. Clears on full page reload.

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
let _current: Customer | null = null;
let _nextId = 1;

const _listeners = new Set<() => void>();
function _emit() { for (const fn of _listeners) { try { fn(); } catch {} } }

// Optional: components can subscribe to auth changes (e.g., Navbar).
export function subscribe(fn: () => void) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

// --- Queries ---
export function listCustomers(): Customer[] { return [..._customers]; }
export function getCurrentUser(): Customer | null { return _current; }
export function getCustomerByEmail(email: string): Customer | null {
  return _customers.find(c => c.email === email) ?? null;
}

// --- Session actions ---
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

// --- Seed one demo account (login: demo@hotel.test / demo123) ---
(function seedOnce() {
  if (_customers.length > 0) return;
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
})();
