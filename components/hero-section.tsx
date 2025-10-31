"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function HeroSection() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in via localStorage
    const userData = localStorage.getItem('streamflux_user')
    setIsLoggedIn(!!userData)
  }, [])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/home')
    } else {
      router.push('/auth')
    }
  }

  return (
    <section className="pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-6 sm:space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Your Premium Streaming Experience</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance">
            Where Every Story
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Comes to Life
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Discover unlimited entertainment with thousands of movies and shows. Your next favorite story is just a
            click away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              onClick={handleGetStarted}
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            
            {!isLoggedIn && (
              <Link href="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass border-border/50 hover:border-primary/50 w-full sm:w-auto bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
