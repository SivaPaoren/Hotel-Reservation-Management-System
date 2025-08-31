"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// relative import (no "@/...")
import { login, getCurrentUser } from "../lib/tempCustomers";

export default function LandingPage() {
  const [role, setRole] = useState<"customer" | "admin">("customer");
  const [email, setEmail] = useState("demo@hotel.test");   // seeded demo
  const [password, setPassword] = useState("demo123");      // seeded demo
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (typeof window !== "undefined") {
      localStorage.setItem("role", role);
    }

    if (role === "customer") {
      // If not already logged in, try to log in with provided creds
      const current = getCurrentUser();
      if (!current) {
        try {
          login({ email, password } as any);
        } catch (err: any) {
          setError(err?.message || "Login failed.");
          return; // stop here if login failed
        }
      }
      router.push("/rooms");
    } else {
      // admin path (not implemented yet)
      router.push("/admin");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Hotel Reservation Demo
      </h1>
      <p className="mt-2 text-white">
        Please choose how you’d like to enter the system.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl border border-gray-700 bg-white/5 p-6 shadow-sm"
      >
        <label className="mb-3 block text-sm font-medium text-white">Login as:</label>
        <div className="flex items-center gap-4 text-white">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="customer"
              checked={role === "customer"}
              onChange={(e) => setRole(e.target.value as any)}
            />
            Customer
          </label>
          <label className="flex items-center gap-2 opacity-70">
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={(e) => setRole(e.target.value as any)}
            />
            Admin (not implemented)
          </label>
        </div>

        {/* Show login fields only when Customer is selected */}
        {role === "customer" && (
          <>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-600 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-600 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-400">{error}</p>
            )}

            <div className="mt-3 text-xs text-gray-400">
              Demo: <code>demo@hotel.test</code> / <code>demo123</code>
            </div>
          </>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-white hover:bg-black"
        >
          Continue
        </button>

        {role === "customer" && (
          <div className="mt-4 text-center">
            <Link href="/register" className="text-sm text-white underline underline-offset-2 hover:opacity-90">
              Need an account? Register
            </Link>
          </div>
        )}
      </form>
    </main>
  );
}
