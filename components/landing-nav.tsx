"use client"

import Link from "next/link"
import { Film, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function LandingNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in via localStorage
    const userData = localStorage.getItem('streamflux_user')
    setIsLoggedIn(!!userData)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Film className="h-7 w-7 sm:h-8 sm:w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StreamFlux
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            {!isLoggedIn && (
              <Button asChild variant="outline" className="glass border-border/50 hover:border-primary/50" size="sm">
                <Link href="/auth">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
            {isLoggedIn && (
              <Button asChild variant="outline" className="glass border-border/50 hover:border-primary/50" size="sm">
                <Link href="/home">
                  Go to Home
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
