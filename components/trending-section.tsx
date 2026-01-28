"use client"

import { useEffect, useState } from "react"
import { MovieCard } from "@/components/movie-card"
import { Flame } from "lucide-react"
import { getTrendingMovies } from "@/lib/tmdb-actions"

interface Movie {
  id: number
  title: string
  poster_path: string
  vote_average: number
  release_date: string
}

export function TrendingSection() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getTrendingMovies("week")
        setMovies(data.slice(0, 6))
      } catch (error) {
        console.error("Error fetching trending movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

  if (loading) {
    return (
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <Flame className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] glass rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <Flame className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-pulse" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Trending Now</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
