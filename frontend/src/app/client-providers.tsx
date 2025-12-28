"use client"

import dynamic from "next/dynamic"
import { LanguageProvider } from "@/contexts/LanguageContext"

const FloatingChatbot = dynamic(
  () =>
    import("@/components/floating-chatbot").then(
      (m) => m.FloatingChatbot
    ),
  { ssr: false }
)

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      {children}
      <FloatingChatbot />
    </LanguageProvider>
  )
}
