"use client"

import { Globe } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-green-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
        aria-label="Select language"
        className="px-3 py-1.5 text-sm border-2 border-green-300 rounded-lg bg-white text-green-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
      </select>
    </div>
  )
}
