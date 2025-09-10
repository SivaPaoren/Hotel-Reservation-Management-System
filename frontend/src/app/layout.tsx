import "./globals.css"
import Navbar from "@/ui/Navbar";


export const metadata = {
  title: "Hotel RMS",
  description: "Hotel Reservation Management System frontend",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
