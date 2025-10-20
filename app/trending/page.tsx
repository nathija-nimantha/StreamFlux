"use client"

import { useEffect, useState, useRef } from "react"
import { MainNav } from "@/components/main-nav"
import { RequireAuth } from "@/components/require-auth"
import { MovieCard } from "@/components/movie-card"
import { AnimeCard } from "@/components/anime-card"
import { Flame, TrendingUp, Calendar, Film, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTrendingMoviesWithFilters } from "@/lib/tmdb-actions"

interface Movie {
  id: number
  title: string
  poster_path: string
  vote_average: number
  release_date: string
  overview?: string
  type?: "movie" | "anime"
  anime?: any
}

const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
]

export default function TrendingPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [timeWindow, setTimeWindow] = useState<"day" | "week">("week")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("popularity.desc")
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const [year, setYear] = useState<number | undefined>(undefined)
  const [contentType, setContentType] = useState<"all" | "movies" | "anime">("all")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const advancedButtonRef = useRef<HTMLButtonElement | null>(null)
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | undefined>(undefined)

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("timeWindow", timeWindow)
        params.set("genre", selectedGenre)
        params.set("contentType", contentType)
        if (sortBy) params.set("sortBy", sortBy)
        if (minRating) params.set("minVote", String(minRating))
        if (year) params.set("year", String(year))

        const res = await fetch(`/api/trending?${params.toString()}`)
        const json = await res.json()
        setMovies(json.results || [])
      } catch (error) {
        console.error("Error fetching trending movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [timeWindow, selectedGenre, sortBy, minRating, year, contentType])

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <MainNav />

        <main className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 sm:mb-12 space-y-6">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="relative">
                <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 blur-xl" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">Trending</h1>
            </div>

            {/* Redesigned Filters: compact, single-row with Advanced popover */}
            <div className="glass-strong p-4 rounded-2xl space-y-3">
              {/* Content Type Filter - Prominent */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Content</span>
                </div>
                <div className="flex items-center bg-background/20 rounded-full p-1">
                  <button
                    aria-pressed={contentType === "all"}
                    onClick={() => setContentType("all")}
                    className={`px-4 py-1.5 rounded-full text-sm ${
                      contentType === "all" ? "bg-primary text-primary-foreground" : "glass"
                    }`}
                  >
                    All
                  </button>
                  <button
                    aria-pressed={contentType === "movies"}
                    onClick={() => setContentType("movies")}
                    className={`px-4 py-1.5 rounded-full text-sm ${
                      contentType === "movies" ? "bg-primary text-primary-foreground" : "glass"
                    }`}
                  >
                    Movies
                  </button>
                  <button
                    aria-pressed={contentType === "anime"}
                    onClick={() => setContentType("anime")}
                    className={`px-4 py-1.5 rounded-full text-sm ${
                      contentType === "anime" ? "bg-primary text-primary-foreground" : "glass"
                    }`}
                  >
                    Anime
                  </button>
                </div>
              </div>

              {/* Other Filters Row */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Left: Time Period segmented */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center bg-background/20 rounded-full p-1">
                  <button
                    aria-pressed={timeWindow === "day"}
                    onClick={() => setTimeWindow("day")}
                    className={`px-3 py-1 rounded-full text-sm ${
                      timeWindow === "day" ? "bg-primary text-primary-foreground" : "glass"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    aria-pressed={timeWindow === "week"}
                    onClick={() => setTimeWindow("week")}
                    className={`px-3 py-1 rounded-full text-sm ${
                      timeWindow === "week" ? "bg-primary text-primary-foreground" : "glass"
                    }`}
                  >
                    This Week
                  </button>
                </div>
              </div>

              {/* Middle: Genre and Sort */}
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <span className="hidden sm:inline text-sm font-medium text-foreground">Genre</span>
                </div>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="w-[200px] glass border-border/50 focus:border-primary bg-background/50 text-foreground">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border/50 bg-popover text-popover-foreground">
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-sm font-medium text-foreground">Sort</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[200px] glass border-border/50 focus:border-primary bg-background/50 text-foreground">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border/50 bg-popover text-popover-foreground">
                      <SelectItem value="popularity.desc">Most Popular</SelectItem>
                      <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
                      <SelectItem value="release_date.desc">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right: Advanced popover (min rating + year) */}
              <div className="flex items-center">
                <button
                  ref={advancedButtonRef}
                  onClick={() => setAdvancedOpen((s) => !s)}
                  className="px-3 py-1 rounded-md glass"
                >
                  Advanced
                </button>

                {advancedOpen && (
                  <div
                    role="dialog"
                    aria-modal="false"
                    style={{
                      position: "fixed",
                      zIndex: 9999,
                      right: 24,
                      top: 120,
                      width: 300,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    }}
                    className="glass-strong p-3 rounded-lg"
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-foreground">Min Rating</label>
                        <Select
                          value={minRating?.toString() ?? "any"}
                          onValueChange={(v) => setMinRating(v && v !== "any" ? Number(v) : undefined)}
                        >
                          <SelectTrigger className="w-full glass border-border/50 focus:border-primary bg-background/50 text-foreground">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent className="glass-strong border-border/50 bg-popover text-popover-foreground">
                            <SelectItem value="any">Any</SelectItem>
                            {[6, 7, 8, 9].map((r) => (
                              <SelectItem key={r} value={String(r)}>
                                {r}+
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-foreground">Year</label>
                        <input
                          type="number"
                          value={year ?? ""}
                          onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="e.g. 2024"
                          className="mt-1 w-full glass border-border/50 focus:border-primary bg-background/50 text-foreground px-2 py-1 rounded"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => setAdvancedOpen(false)}
                          className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>

          {/* Movies Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="aspect-[2/3] glass rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((movie, index) => (
                movie.type === "anime" ? (
                  <AnimeCard key={`anime-${movie.id}`} anime={movie.anime} index={index} />
                ) : (
                  <MovieCard key={`movie-${movie.id}`} movie={movie} index={index} />
                )
              ))}
            </div>
          )}

          {!loading && movies.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No content found</p>
            </div>
          )}
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}
