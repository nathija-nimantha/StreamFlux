"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import { Heart, Play, Star, Calendar, Clock, Globe, DollarSign } from "lucide-react"
import { favoritesStore } from "@/lib/favorites-store"
import Image from "next/image"

interface MovieDetailProps {
  movie: any
}

export function MovieDetailClient({ movie }: MovieDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    setIsFavorite(favoritesStore.isFavorite(movie.id, 'movie'))

    const handleFavoritesChange = () => {
  setIsFavorite(favoritesStore.isFavorite(movie.id, 'movie'))
    }

    window.addEventListener("favorites-changed", handleFavoritesChange)
    return () => window.removeEventListener("favorites-changed", handleFavoritesChange)
  }, [movie.id])

  const handleToggleFavorite = () => {
    favoritesStore.toggleFavorite({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      backdrop_path: movie.backdrop_path,
      popularity: movie.popularity,
      genres: movie.genres,
      overview: movie.overview,
      category: 'movie',
    })
  }

  const trailer = movie.videos?.results?.find((video: any) => video.type === "Trailer" && video.site === "YouTube")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <main className="relative">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh]">
        <div className="absolute inset-0">
          {movie.backdrop_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12 sm:pb-16">
          <div className="max-w-3xl space-y-4 sm:space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground text-balance">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary fill-current" />
                <span className="font-bold text-foreground">{typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—'}</span>
                <span className="text-muted-foreground">/ 10</span>
              </div>

              {movie.release_date && (
                <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-foreground">{new Date(movie.release_date).getFullYear()}</span>
                </div>
              )}

              {movie.runtime && (
                <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-foreground">{formatRuntime(movie.runtime)}</span>
                </div>
              )}

              {movie.adult !== undefined && (
                <div className="glass px-3 py-1.5 rounded-full">
                  <span className="text-foreground font-medium">{movie.adult ? "18+" : "PG"}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((genre: any) => (
                <span key={genre.id} className="glass px-3 py-1 rounded-full text-sm text-foreground">
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty">{movie.overview}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              {trailer && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Play className="h-5 w-5 mr-2 fill-current" />
                      Watch Trailer
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-6xl w-full">
                    <div className="w-full aspect-video rounded overflow-hidden">
                      <iframe
                        title={`Trailer for ${movie.title}`}
                        src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                        frameBorder="0"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <Button
                size="lg"
                variant="outline"
                className={`glass-strong border-border/50 ${
                  isFavorite ? "bg-primary/20 border-primary text-primary" : "text-foreground"
                }`}
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-5 w-5 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Movie Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {movie.budget > 0 && (
            <div className="glass-strong rounded-xl p-6 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-primary">
                <DollarSign className="h-5 w-5" />
                <h3 className="font-semibold">Budget</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(movie.budget)}</p>
            </div>
          )}

          {movie.revenue > 0 && (
            <div className="glass-strong rounded-xl p-6 space-y-2 animate-fade-in" style={{ animationDelay: "50ms" }}>
              <div className="flex items-center gap-2 text-primary">
                <DollarSign className="h-5 w-5" />
                <h3 className="font-semibold">Revenue</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(movie.revenue)}</p>
            </div>
          )}

          {movie.original_language && (
            <div className="glass-strong rounded-xl p-6 space-y-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2 text-primary">
                <Globe className="h-5 w-5" />
                <h3 className="font-semibold">Language</h3>
              </div>
              <p className="text-2xl font-bold text-foreground uppercase">{movie.original_language}</p>
            </div>
          )}

          {movie.status && (
            <div className="glass-strong rounded-xl p-6 space-y-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center gap-2 text-primary">
                <Star className="h-5 w-5" />
                <h3 className="font-semibold">Status</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">{movie.status}</p>
            </div>
          )}
        </div>

        {/* Cast */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {movie.credits.cast.slice(0, 10).map((person: any) => (
                <div key={person.id} className="flex-shrink-0 w-32 sm:w-40 space-y-2">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden glass-strong">
                    {person.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                        alt={person.name}
                        width={160}
                        height={240}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background flex items-center justify-center">
                        <span className="text-4xl text-muted-foreground">{person.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm truncate">{person.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Production Companies */}
        {movie.production_companies && movie.production_companies.length > 0 && (
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "250ms" }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Production Companies</h2>
            <div className="flex flex-wrap gap-4">
              {movie.production_companies.map((company: any) => (
                <div key={company.id} className="glass-strong rounded-xl p-4 flex items-center gap-3">
                  {company.logo_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                      alt={company.name}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="text-xs text-primary font-bold">{company.name[0]}</span>
                    </div>
                  )}
                  <span className="text-foreground font-medium">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {movie.similar?.results && movie.similar.results.length > 0 && (
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Similar Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movie.similar.results.slice(0, 6).map((similarMovie: any) => (
                <a key={similarMovie.id} href={`/movie/${similarMovie.id}`} className="group cursor-pointer space-y-2">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden glass-strong group-hover:ring-2 group-hover:ring-primary transition-all">
                    {similarMovie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${similarMovie.poster_path}`}
                        alt={similarMovie.title}
                        width={300}
                        height={450}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{similarMovie.title}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
