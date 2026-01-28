"use client"

import { useEffect, useRef } from "react"

export function Spline3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window

      const x = (clientX / innerWidth - 0.5) * 20
      const y = (clientY / innerHeight - 0.5) * 20

      containerRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.05)`
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div
          ref={containerRef}
          className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-3xl glass overflow-hidden transition-transform duration-300 ease-out"
        >
          {/* Spline 3D Scene Placeholder - Replace with actual Spline embed */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Animated 3D-like elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl animate-pulse" />
              <div className="relative w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl animate-spin-slow opacity-80"
                  style={{ animationDuration: "20s" }}
                />
                <div
                  className="absolute inset-4 bg-gradient-to-tl from-accent to-primary rounded-3xl animate-spin-slow opacity-60"
                  style={{ animationDuration: "15s", animationDirection: "reverse" }}
                />
                <div
                  className="absolute inset-8 bg-gradient-to-br from-primary/50 to-accent/50 rounded-2xl animate-spin-slow"
                  style={{ animationDuration: "10s" }}
                />
              </div>
            </div>
          </div>

          {/* Instructions overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-strong px-4 py-2 rounded-full">
            <p className="text-sm text-muted-foreground">Move your cursor to interact</p>
          </div>
        </div>
      </div>
    </section>
  )
}
