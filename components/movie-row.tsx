"use client"

import { useEffect, useState, useRef } from "react"
import { MovieCard } from "@/components/movie-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMoviesByCategory, getMoviesByGenre } from "@/lib/tmdb-actions"

interface Movie {
  id: number
  title: string
  poster_path: string
  vote_average: number
  release_date: string
  popularity?: number
  genre_ids?: number[]
  overview?: string
  backdrop_path?: string
}

interface MovieRowProps {
  title: string
  category?: string
  genre?: number
}

export function MovieRow({ title, category, genre }: MovieRowProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        let data: Movie[] = []
        if (category) {
          data = await getMoviesByCategory(category)
        } else if (genre) {
          data = await getMoviesByGenre(genre)
        }
        setMovies(data)
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [category, genre])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="min-w-[150px] sm:min-w-[200px] aspect-[2/3] glass rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 group/row">
      <div className="container mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">{title}</h2>

        <div className="relative">
          {/* Scroll buttons */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 glass-strong opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-primary/20 hidden sm:flex"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 glass-strong opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-primary/20 hidden sm:flex"
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </Button>

          {/* Movies scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {movies.map((movie, index) => (
              <div key={movie.id} className="min-w-[150px] sm:min-w-[200px]">
                <MovieCard movie={movie} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
