"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { getPopularMovies } from "@/lib/tmdb-actions"

interface Movie {
  id: number
  title: string
  poster_path: string
  vote_average: number
  release_date?: string
  overview?: string
  backdrop_path?: string
}

export function HeroCarousel() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getPopularMovies()
        setMovies(data.slice(0, 5))
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  useEffect(() => {
    if (movies.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [movies.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }

    if (loading || movies.length === 0) {
    return (
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] bg-muted animate-pulse mb-48 min-[425px]:mb-32 sm:mb-24 md:mb-32 lg:mb-40 xl:mb-16">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>
    )
  }

  const currentMovie = movies[currentIndex]

  return (
    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] overflow-hidden mb-48 min-[425px]:mb-32 sm:mb-24 md:mb-32 lg:mb-40 xl:mb-16">
      {/* Background Image */}
      <div className="absolute inset-0">
          {currentMovie.backdrop_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
              alt={currentMovie.title}
              fill
              className="object-cover transition-opacity duration-700"
              priority
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl space-y-4 sm:space-y-6 pt-16 sm:pt-20 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
            {currentMovie.title}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground line-clamp-3 text-pretty leading-relaxed">
            {currentMovie.overview ?? "No description available."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 pb-12 md:pb-0">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="h-5 w-5 fill-current" />
                Play Now
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass border-border/50 hover:border-primary/50 bg-background/50 text-foreground"
            >
              <Info className="h-5 w-5 mr-2" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 glass-strong p-2 sm:p-3 rounded-full hover:bg-primary/20 transition-all group hidden sm:block"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-primary transition-colors" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 glass-strong p-2 sm:p-3 rounded-full hover:bg-primary/20 transition-all group hidden sm:block"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-primary transition-colors" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              index === currentIndex ? "w-8 bg-primary" : "w-4 bg-muted-foreground/50 hover:bg-muted-foreground",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
