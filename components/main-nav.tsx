"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Film, Search, Home, TrendingUp, Heart, User, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchSuggestions } from "@/components/search-suggestions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrentUser } from '@/hooks/use-current-user'
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Trending", href: "/trending", icon: TrendingUp },
  { name: "Anime", href: "/anime", icon: Film },
  { name: "Favorites", href: "/favorites", icon: Heart },
]

export function MainNav() {
  const { profile } = useCurrentUser()
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="relative">
              <Film className="h-6 w-6 sm:h-7 sm:w-7 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:inline">
              StreamFlux
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
                    isActive
                      ? "text-foreground bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Search & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center gap-2 animate-fade-in">
                  <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
                    <Input
                      id="header-search"
                      type="search"
                      placeholder="Search movies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 sm:w-64 glass border-border/50 focus:border-primary bg-background/50 text-foreground placeholder:text-muted-foreground"
                      autoFocus
                      aria-label="Search movies"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchQuery("")
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </form>

                  {/* Suggestions popup anchored below the input */}
                  {searchQuery.trim().length > 0 && (
                    <div className="absolute left-0 mt-12 sm:mt-14">
                      <SearchSuggestions
                        query={searchQuery}
                        onClose={() => {
                          setIsSearchOpen(false)
                          setSearchQuery("")
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsSearchOpen(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Profile */}
            <Link href="/profile" className="hidden sm:block">
              <Avatar className="h-9 w-9 ring-2 ring-border hover:ring-primary transition-all cursor-pointer">
                <AvatarImage src={profile?.avatar ?? "/placeholder.svg?height=36&width=36"} alt={profile?.fullName ?? 'Profile'} />
                <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
              </Avatar>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                    isActive
                      ? "text-foreground bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-300"
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Profile</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
