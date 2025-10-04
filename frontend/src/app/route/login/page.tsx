// frontend/src/app/route/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Use real API + session (no tempCustomers)
import { listCustomers, type Customer } from "../../../api/customers";
import { setCurrentCustomer, getCurrentCustomer } from "../../../lib/session";

type Role = "customer" | "admin";

export default function LoginPage() {
  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState<string>("demo@hotel.test");
  const [password, setPassword] = useState<string>("demo123");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (typeof window !== "undefined") {
      localStorage.setItem("role", role);
    }

    if (role === "admin") {
      router.push("/route/admin");
      return;
    }

    // role === "customer"
    const existing = getCurrentCustomer();
    if (existing) {
      router.push("/route/rooms");
      return;
    }

    setLoading(true);
    try {
      const customers = await listCustomers(); // GET /api/customers
      const match: Customer | undefined = customers.find(
        (c) => c.email === email && c.password === password
      );
      if (!match) {
        setError("Invalid email or password.");
        return;
      }
      setCurrentCustomer(match);
      router.push("/route/rooms");
    } catch (err: unknown) {
      setError((err as Error)?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10 text-gray-900">
      <h1 className="text-3xl font-bold tracking-tight">Hotel Reservation Demo</h1>
      <p className="mt-2 text-gray-700">Please choose how you’d like to enter the system.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <label className="mb-3 block text-sm font-medium">Login as:</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="customer"
              checked={role === "customer"}
              onChange={(e) => setRole(e.target.value as Role)}
            />
            Customer
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={(e) => setRole(e.target.value as Role)}
            />
            Admin
          </label>
        </div>

        {role === "customer" && (
          <>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-3 text-xs text-gray-600">
              Demo: <code>demo@hotel.test</code> / <code>demo123</code>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-white hover:bg-black disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Continue"}
        </button>

        {role === "customer" && (
          <div className="mt-4 text-center">
            <Link
              href="/route/register"
              className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-800"
            >
              Need an account? Register
            </Link>
          </div>
        )}
      </form>
    </main>
  );
}
