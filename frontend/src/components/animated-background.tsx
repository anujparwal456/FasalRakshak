"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Particle system for floating leaves and growing plants
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      type: "leaf" | "circle" | "sprout"
      rotation: number
      rotationSpeed: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.size = Math.random() * 30 + 10
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = Math.random() * 0.5 + 0.2
        this.opacity = Math.random() * 0.3 + 0.1
        this.type = Math.random() > 0.5 ? "leaf" : Math.random() > 0.5 ? "circle" : "sprout"
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.02
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.rotation += this.rotationSpeed

        // Reset particle when it goes off screen
        if (this.y > canvas!.height + this.size) {
          this.y = -this.size
          this.x = Math.random() * canvas!.width
        }
        if (this.x > canvas!.width + this.size) this.x = -this.size
        if (this.x < -this.size) this.x = canvas!.width + this.size
      }

      draw() {
        if (!ctx) return
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.globalAlpha = this.opacity

        if (this.type === "leaf") {
          // Draw leaf shape
          ctx.fillStyle = "#10b981" // Emerald green
          ctx.beginPath()
          ctx.ellipse(0, 0, this.size, this.size * 1.5, 0, 0, Math.PI * 2)
          ctx.fill()
          // Leaf vein
          ctx.strokeStyle = "#059669"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(0, -this.size * 1.5)
          ctx.lineTo(0, this.size * 1.5)
          ctx.stroke()
        } else if (this.type === "circle") {
          // Draw soft circles
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size)
          gradient.addColorStop(0, "#34d399")
          gradient.addColorStop(1, "rgba(16, 185, 129, 0)")
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(0, 0, this.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Draw sprout/seedling
          ctx.strokeStyle = "#10b981"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(0, this.size / 2)
          ctx.lineTo(0, -this.size / 2)
          ctx.stroke()
          // Leaves
          ctx.fillStyle = "#22c55e"
          ctx.beginPath()
          ctx.arc(-this.size / 4, -this.size / 4, this.size / 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(this.size / 4, -this.size / 3, this.size / 3, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }
    }

    // Create particles
    const particles: Particle[] = []
    const particleCount = 50
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas!.height)
      gradient.addColorStop(0, "rgba(236, 253, 245, 0.5)") // Light green
      gradient.addColorStop(0.5, "rgba(209, 250, 229, 0.3)") // Lighter green
      gradient.addColorStop(1, "rgba(167, 243, 208, 0.2)") // Even lighter
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas!.width, canvas!.height)

      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 animated-background-gradient"
    />
  )
}
