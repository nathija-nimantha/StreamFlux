"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { RequireAuth } from "@/components/require-auth"
import { MovieCard } from "@/components/movie-card"
import { searchMovies } from "@/lib/tmdb-actions"
import { Search, Film } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Movie {
  id: number
  title: string
  poster_path: string
  vote_average: number
  release_date: string
  backdrop_path?: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(!!initialQuery)

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim() && query !== initialQuery) {
        handleSearch(query)
      } else if (!query.trim()) {
        setResults([])
        setSearched(false)
      }
    }, 500)

    return () => clearTimeout(delaySearch)
  }, [query])

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const movies = await searchMovies(searchQuery)
      setResults(movies)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <MainNav />

        <main className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
          {/* Search Header */}
          <div className="mb-8 sm:mb-12 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-xl" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">Search Movies</h1>
            </div>

            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for movies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-14 text-lg glass-strong border-border/50 focus:border-primary bg-background/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] glass rounded-xl animate-pulse" />
              ))}
            </div>
          ) : searched && results.length > 0 ? (
            <div>
              <p className="text-muted-foreground mb-6">
                Found {results.length} {results.length === 1 ? "result" : "results"} for "{query}"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((movie, index) => (
                  <MovieCard key={movie.id} movie={movie} index={index} />
                ))}
              </div>
            </div>
          ) : searched && results.length === 0 ? (
            <div className="text-center py-20 glass-strong rounded-2xl">
              <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No results found</h2>
              <p className="text-muted-foreground">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="text-center py-20 glass-strong rounded-2xl">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Start searching</h2>
              <p className="text-muted-foreground">Enter a movie title to find what you're looking for</p>
            </div>
          )}
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}
