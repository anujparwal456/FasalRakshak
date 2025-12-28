import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import ClientProviders from "./client-providers"
import { AnimatedBackground } from "@/components/animated-background"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FasalRakshak - AI Plant Disease Detection",
  description:
    "Advanced AI-powered plant disease detection using deep learning technology.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased m-0 p-0 flex flex-col min-h-screen">
        <ClientProviders>
          {/* Background */}
          <AnimatedBackground />

          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <div className="relative z-10 flex-grow">
            {children}
          </div>

          {/* Footer */}
          <Footer />

          {/* Analytics */}
          <Analytics />
        </ClientProviders>
      </body>
    </html>
  )
}
