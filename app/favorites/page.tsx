"use client"

import { useEffect, useState, useRef } from "react"
import { MainNav } from "@/components/main-nav"
import { RequireAuth } from "@/components/require-auth"
import { MovieCard } from "@/components/movie-card"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { favoritesStore, type FavoriteMovie } from "@/lib/favorites-store"
import { useCurrentUser } from "@/hooks/use-current-user"

const genres = [
  { id: "all", name: "All Genres" },
  { id: "28", name: "Action" },
  { id: "12", name: "Adventure" },
  { id: "16", name: "Animation" },
  { id: "35", name: "Comedy" },
  { id: "18", name: "Drama" },
  { id: "27", name: "Horror" },
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("popularity.desc")
  const { user } = useCurrentUser()
  const mountedRef = useRef(true)
  const enrichedIdsRef = useRef<Set<number>>(new Set()) // Track which movies we've already enriched

  // Helper: fetch movie details in small batches to avoid spiky network usage
  // Only fetch for movies that are missing complete data (old favorites)
  const fetchDetailsInBatches = async (movies: FavoriteMovie[], batchSize = 5) => {
    const results: FavoriteMovie[] = []
    for (let i = 0; i < movies.length; i += batchSize) {
      const chunk = movies.slice(i, i + batchSize)
      const chunkResults = await Promise.all(
        chunk.map(async (m) => {
          // Skip enrichment for anime category (already have data from AniList)
          if (m.category === 'anime') return m
          
          // Skip if we already have complete data (popularity and genres exist)
          if (m.popularity && m.genres && m.genres.length > 0) {
            enrichedIdsRef.current.add(m.id)
            return m
          }
          
          // Skip if we've already enriched this movie in this session
          if (enrichedIdsRef.current.has(m.id)) return m
          
          // Only fetch if missing data
          try {
            const res = await fetch(`/api/movie/${m.id}`)
            if (!res.ok) return m
            const data = await res.json()
            enrichedIdsRef.current.add(m.id) // Mark as enriched
            return {
              id: data.id ?? m.id,
              title: data.title ?? m.title,
              poster_path: data.poster_path ?? m.poster_path,
              vote_average: data.vote_average ?? m.vote_average,
              release_date: data.release_date ?? m.release_date,
              backdrop_path: data.backdrop_path ?? m.backdrop_path,
              overview: data.overview ?? m.overview,
              popularity: data.popularity ?? m.popularity,
              genres: data.genres ? data.genres.map((g: any) => ({ id: g.id, name: g.name })) : m.genres,
              category: 'movie',
            } as FavoriteMovie
          } catch (e) {
            return m
          }
        }),
      )
      results.push(...chunkResults)
    }
    return results
  }

  useEffect(() => {
    mountedRef.current = true

    const load = async () => {
      setError(null)
      setLoading(true)

      try {
        if (user) {
          const stored = await favoritesStore.fetchFavoritesFromDb()
          // fetch TMDb details in batches
          const detailed = await fetchDetailsInBatches(stored, 5)
          if (mountedRef.current) setFavorites(detailed)
        } else {
          const local = favoritesStore.getFavorites()
          if (mountedRef.current) setFavorites(local)
        }
      } catch (e: any) {
        console.warn("Failed to load favorites", e)
        if (mountedRef.current) setError("Failed to load favorites")
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    load()

    const handleFavoritesChange = async () => {
      // On change, reload but skip re-fetching if data is already complete
      try {
        if (user) {
          const stored = await favoritesStore.fetchFavoritesFromDb()
          // Only fetch details for movies missing complete data
          const needsEnrichment = stored.some(m => m.category === 'movie' && (!m.popularity || !m.genres || m.genres.length === 0))
          if (needsEnrichment) {
            const detailed = await fetchDetailsInBatches(stored, 5)
            if (mountedRef.current) setFavorites(detailed)
          } else {
            if (mountedRef.current) setFavorites(stored)
          }
        } else {
          if (mountedRef.current) setFavorites(favoritesStore.getFavorites())
        }
      } catch (e) {
        console.warn('favorites-changed handler failed', e)
      }
    }

    window.addEventListener("favorites-changed", handleFavoritesChange)
    return () => {
      mountedRef.current = false
      window.removeEventListener("favorites-changed", handleFavoritesChange)
    }
  }, [user])

  const filteredFavorites = favorites
    .filter((m) => {
      if (selectedGenre && selectedGenre !== "all") {
        const gid = Number(selectedGenre)
        if (!isNaN(gid) && Array.isArray(m.genres)) {
          return m.genres.some((g) => g.id === gid)
        }
        // fallback: if we don't have genre info, include the movie
        return true
      }
      return true
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === "popularity.desc") return (b.popularity ?? 0) - (a.popularity ?? 0)
      if (sortBy === "vote_average.desc") return (b.vote_average ?? 0) - (a.vote_average ?? 0)
      if (sortBy === "release_date.desc") return (new Date(b.release_date ?? "").getTime() || 0) - (new Date(a.release_date ?? "").getTime() || 0)
      return 0
    })

  const movieFavorites = filteredFavorites.filter(f => f.category === 'movie')
  const animeFavorites = filteredFavorites.filter(f => f.category === 'anime')

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <MainNav />

        <main className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8 sm:mb-12 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-primary fill-current animate-pulse" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">My Favorites</h1>
              </div>

              <p className="text-muted-foreground text-lg">
                {favorites.length} item{favorites.length === 1 ? '' : 's'} saved ({movieFavorites.length} movies • {animeFavorites.length} anime)
              </p>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 glass-strong p-4 rounded-2xl">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-foreground">Genre:</span>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="ml-auto w-[180px] glass border-border/50 focus:border-primary bg-background/50 text-foreground">
                      <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border/50 bg-popover text-popover-foreground">
                      {genres.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-foreground">Sort:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="ml-auto w-[180px] glass border-border/50 focus:border-primary bg-background/50 text-foreground">
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
            </div>

            {/* Loading / Error */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] glass rounded-xl animate-pulse" />
                ))}
              </div>
            ) : null}
            {error && (
              <div className="text-center py-12 text-destructive">{error}</div>
            )}

            {/* Movies Section */}
            {!loading && movieFavorites.length > 0 && (
              <div className="space-y-4 mb-12">
                <h2 className="text-2xl font-bold text-foreground">Movies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movieFavorites.map((movie, index) => (
                    <div key={`movie-${movie.id}`}>
                      <MovieCard movie={movie} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anime Section */}
            {!loading && animeFavorites.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Anime</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {animeFavorites.map((anime, index) => (
                    <div key={`anime-${anime.id}`}> 
                      {/* Reuse MovieCard for now, data shape similar. Poster path holds cover image. */}
                      <MovieCard movie={anime} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && filteredFavorites.length === 0 && (
              <div className="text-center py-20 glass-strong rounded-2xl">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">No favorites yet</h2>
                <p className="text-muted-foreground mb-6">Start adding movies or anime to your favorites to see them here</p>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <a href="/home">Browse Movies</a>
                </Button>
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <a href="/anime">Browse Anime</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}
