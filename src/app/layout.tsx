import type { Metadata, Viewport } from "next"
import { Geist, Playfair_Display } from "next/font/google"
import { validateEnv } from "@/lib/env"
import "./globals.css"

validateEnv()

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] })
const playfair = Playfair_Display({ variable: "--font-serif", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Veldheer Europe 2026",
  description: "Paris, Saint-Raphael, Lisbon — April 3-15, 2026",
  openGraph: {
    title: "Veldheer Europe 2026",
    description: "Our family trip to Europe!",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e3a5f",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable} h-full`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
