"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/data/tempCustomers";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [error, setError] = useState<string>("");

  function validate(): string {
    if (!name.trim()) return "Name is required.";
    if (!email.trim()) return "Email is required.";
    if (!password) return "Password is required.";
    return "";
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      // tempCustomers auto-logs in on successful register
      register({ name, email, password, phone, nationality });
      router.push("/route/rooms"); // start booking right away
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Registration failed.";
      setError(msg);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-white">Create your account</h1>
      <p className="mt-2 text-white">This is a demo. Accounts exist only until you refresh the page.</p>

      <form onSubmit={onSubmit} className="mt-8 rounded-xl border bg-white p-6 shadow-sm text-black">
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
            className="mt-2 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black"
          >
            Create account
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/route" className="underline">
              Log in
            </Link>
          </div>
        </div>
      </form>
    </main>
  );
}
