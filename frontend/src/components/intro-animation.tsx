"use client"

import { useEffect, useState } from "react"
import { Sprout } from "lucide-react"

export function IntroAnimation() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 flex items-center justify-center animate-fade-out">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping opacity-20">
            <Sprout className="w-32 h-32 text-green-300 mx-auto" />
          </div>
          <Sprout className="w-32 h-32 text-green-400 mx-auto animate-grow" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">FasalRakshak</h1>
        <p className="text-xl text-green-200 animate-fade-in animation-delay-200">फसल रक्षक - Crop Protector</p>
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce animation-delay-0"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce animation-delay-200"></div>
        </div>
      </div>
    </div>
  )
}
