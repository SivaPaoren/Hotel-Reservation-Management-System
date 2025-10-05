// frontend/src/app/layout.tsx
import "./globals.css";
import Navbar from "@/ui/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hotel RMS",
  description: "Hotel Reservation Management System frontend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
