// frontend/src/app/route/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Use real API + session
import { createCustomer, type Customer } from "../../../api/customers";
import { setCurrentCustomer } from "../../../lib/session";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [age, setAge] = useState<number | "">("");
  const [password, setPassword] = useState<string>("");

  // kept for UI parity; not sent to backend
  const [phone, setPhone] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function validate(): string {
    if (!name.trim()) return "Name is required.";
    if (!email.trim()) return "Email is required.";
    if (age === "" || Number.isNaN(Number(age)) || Number(age) <= 0) return "Valid age is required.";
    if (!password) return "Password is required.";
    return "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      // Real backend registration
      const created: Customer = await createCustomer({
        name: name.trim(),
        email: email.trim(),
        age: Number(age),
        password,
      });

      // Auto-login (frontend-only “session”)
      setCurrentCustomer(created);

      router.push("/route/rooms");
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10 text-gray-900">
      <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-gray-700">This is a demo. Accounts persist in the backend.</p>

      <form onSubmit={onSubmit} className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="john@example.com"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Age</label>
              <input
                type="number"
                min={1}
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="25"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Optional fields kept for UI parity; not sent to backend */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="081-234-5678"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nationality (optional)</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Thai"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create account"}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/route/login" className="underline">
              Log in
            </Link>
          </div>
        </div>
      </form>
    </main>
  );
}
