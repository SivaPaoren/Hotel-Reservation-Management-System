"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [role, setRole] = useState("customer");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("role", role);
    }

    if (role === "customer") {
      router.push("/rooms");
    } else {
      router.push("/admin");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10 text-black">
      <h1 className="text-3xl font-bold tracking-tight text-white">Hotel Reservation Demo</h1>
      <p className="mt-2 text-white">
        Please choose how you’d like to enter the system.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl border bg-white p-6 shadow-sm"
      >
        <label className="mb-3 block text-sm font-medium">Login as:</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="customer"
              checked={role === "customer"}
              onChange={(e) => setRole(e.target.value)}
            />
            Customer
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={(e) => setRole(e.target.value)}
            />
            Admin
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-white hover:bg-black"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
