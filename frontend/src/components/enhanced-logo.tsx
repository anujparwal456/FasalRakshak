"use client"

import { Shield, Sparkles } from "lucide-react"

export function EnhancedLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: { container: "w-12 h-12", text: "text-base", subtext: "text-[10px]" },
    md: { container: "w-14 h-14", text: "text-xl md:text-2xl", subtext: "text-xs" },
    lg: { container: "w-20 h-20", text: "text-3xl md:text-4xl", subtext: "text-sm" },
  }

  const d = dimensions[size]

  return (
    <div className="flex items-center gap-3 group">
      <div className={`relative ${d.container}`}>
        {/* Wheat stalks on left side */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex gap-1 z-10">
          <div className="relative">
            <div className="w-1 h-12 bg-gradient-to-t from-amber-700 via-amber-600 to-amber-500 rounded-full transform -rotate-12" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex flex-col gap-0.5">
              <div className="w-3 h-1 bg-amber-600 rounded-full transform -rotate-45" />
              <div className="w-3 h-1 bg-amber-600 rounded-full transform rotate-45" />
              <div className="w-2.5 h-1 bg-amber-500 rounded-full transform -rotate-45" />
              <div className="w-2.5 h-1 bg-amber-500 rounded-full transform rotate-45" />
            </div>
          </div>
          <div className="relative">
            <div className="w-1 h-14 bg-gradient-to-t from-amber-700 via-amber-600 to-amber-400 rounded-full" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex flex-col gap-0.5">
              <div className="w-3 h-1 bg-amber-600 rounded-full transform -rotate-45" />
              <div className="w-3 h-1 bg-amber-600 rounded-full transform rotate-45" />
              <div className="w-3 h-1 bg-amber-500 rounded-full transform -rotate-45" />
              <div className="w-3 h-1 bg-amber-500 rounded-full transform rotate-45" />
            </div>
          </div>
          <div className="relative">
            <div className="w-1 h-11 bg-gradient-to-t from-amber-700 via-amber-600 to-amber-500 rounded-full transform rotate-12" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex flex-col gap-0.5">
              <div className="w-2.5 h-1 bg-amber-600 rounded-full transform -rotate-45" />
              <div className="w-2.5 h-1 bg-amber-600 rounded-full transform rotate-45" />
              <div className="w-2 h-1 bg-amber-500 rounded-full transform -rotate-45" />
            </div>
          </div>
        </div>

        {/* Large decorative leaf backdrop */}
        <svg
          className="absolute -left-4 -top-2 w-20 h-20 text-green-400 opacity-30 group-hover:opacity-40 transition-opacity"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.67-2C8.59 16.81 10.84 11.5 17 10V8z" />
        </svg>

        {/* Pulsing glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-full transform rotate-45 blur-md opacity-30 animate-pulse" />

        {/* Main shield with gradient and AI circuit */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl shadow-xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-tr from-green-600 to-emerald-400 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/20 group-hover:scale-105 transition-transform">
          {/* AI Circuit Pattern */}
          <div className="absolute inset-3 opacity-25">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <path
                d="M20 5 L20 15 M20 25 L20 35 M5 20 L15 20 M25 20 L35 20"
                stroke="white"
                strokeWidth="1.5"
                className="text-white"
              />
              <circle cx="20" cy="20" r="3" fill="white" className="text-cyan-300" />
              <circle cx="20" cy="10" r="2" fill="white" className="text-cyan-400 animate-pulse" />
              <circle cx="20" cy="30" r="2" fill="white" className="text-cyan-400 animate-pulse" />
              <circle cx="10" cy="20" r="2" fill="white" className="text-cyan-400 animate-pulse" />
              <circle cx="30" cy="20" r="2" fill="white" className="text-cyan-400 animate-pulse" />
            </svg>
          </div>
          <Shield className="w-1/2 h-1/2 text-white drop-shadow-2xl z-10" strokeWidth={2.5} />
          <Sparkles className="w-1/4 h-1/4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Rice/paddy plants on right side */}
        <div className="absolute -right-2 bottom-0 flex gap-1 z-10">
          <div className="relative">
            <div className="w-0.5 h-6 bg-green-700 rounded-full" />
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 flex flex-col gap-0.5">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            </div>
          </div>
          <div className="relative">
            <div className="w-0.5 h-7 bg-green-700 rounded-full" />
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 flex flex-col gap-0.5">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            </div>
          </div>
          <div className="relative">
            <div className="w-0.5 h-5 bg-green-700 rounded-full" />
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 flex flex-col gap-0.5">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              <div className="w-1 h-1 bg-green-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Small leaves at bottom */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          <svg className="w-4 h-4 text-green-600 opacity-70" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.67-2C8.59 16.81 10.84 11.5 17 10V8z" />
          </svg>
          <svg
            className="w-4 h-4 text-green-600 opacity-70 transform scale-x-[-1]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.67-2C8.59 16.81 10.84 11.5 17 10V8z" />
          </svg>
        </div>
      </div>

      <div>
        <h1
          className={`${d.text} font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 bg-clip-text text-transparent drop-shadow-sm`}
        >
          FasalRakshak
        </h1>
        <p className={`${d.subtext} text-green-600 font-semibold tracking-wide`}>फसल रक्षक - Crop Protector</p>
      </div>
    </div>
  )
}
