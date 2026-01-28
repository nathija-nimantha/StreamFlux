"use client"

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { Heart, Play, Star, Calendar, Users, TrendingUp, Hash, Book, ChevronLeft, ChevronRight } from 'lucide-react'
import { favoritesStore } from '@/lib/favorites-store'
import { Button } from './ui/button'
import { Dialog, DialogTrigger, DialogContent } from './ui/dialog'

interface AnimeDetailClientProps {
  anime: any // AniListMedia
}

export function AnimeDetailClient({ anime }: AnimeDetailClientProps) {
  const [isFav, setIsFav] = useState(false)
  const charactersScrollRef = useRef<HTMLDivElement>(null)
  const recommendationsScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsFav(favoritesStore.isFavorite(anime.id, 'anime'))
    const handler = () => setIsFav(favoritesStore.isFavorite(anime.id, 'anime'))
    window.addEventListener('favorites-changed', handler)
    return () => window.removeEventListener('favorites-changed', handler)
  }, [anime.id])

  const scrollCharacters = (direction: "left" | "right") => {
    if (charactersScrollRef.current) {
      const scrollAmount = charactersScrollRef.current.clientWidth * 0.8
      charactersScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const scrollRecommendations = (direction: "left" | "right") => {
    if (recommendationsScrollRef.current) {
      const scrollAmount = recommendationsScrollRef.current.clientWidth * 0.8
      recommendationsScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const toggleFavorite = () => {
    favoritesStore.toggleFavorite({
      id: anime.id,
      title: anime.title.english || anime.title.romaji || anime.title.native || 'Unknown',
      poster_path: anime.coverImage?.large || anime.coverImage?.extraLarge || '',
      vote_average: (anime.averageScore ?? 0) / 10,
      release_date: `${anime.seasonYear || ''}`,
      backdrop_path: anime.bannerImage,
      overview: anime.description,
      genres: Array.isArray(anime.genres) ? anime.genres.map((g: string, i: number) => ({ id: i, name: g })) : [],
      category: 'anime',
    })
  }

  const trailer = anime.trailer && anime.trailer.site === 'youtube' ? anime.trailer.id : null
  const title = anime.title?.english || anime.title?.romaji || anime.title?.native || 'Unknown'
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : '—'

  // Clean HTML from description
  const cleanDescription = anime.description?.replace(/<[^>]*>/g, '') || 'No description available.'

  // Format episodes display
  const episodesText = anime.episodes ? `${anime.episodes} Episodes` : anime.status === 'RELEASING' ? 'Ongoing' : 'Unknown'

  return (
    <main className="relative">
      {/* Hero Section with Backdrop */}
      <div className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh]">
        <div className="absolute inset-0">
          {anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large ? (
            <Image
              src={anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large}
              alt={title}
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

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-12 sm:pb-16">
          <div className="max-w-3xl space-y-4 sm:space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground text-balance">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base">
              {anime.averageScore && (
                <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary fill-current" />
                  <span className="font-bold text-foreground">{score}</span>
                  <span className="text-muted-foreground">/ 10</span>
                </div>
              )}

              {anime.seasonYear && (
                <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-foreground">{anime.seasonYear}</span>
                </div>
              )}

              {anime.episodes && (
                <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
                  <Book className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-foreground">{episodesText}</span>
                </div>
              )}

              {anime.format && (
                <div className="glass px-3 py-1.5 rounded-full">
                  <span className="text-foreground font-medium">{anime.format.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {anime.genres?.map((genre: string) => (
                <span key={genre} className="glass px-3 py-1 rounded-full text-sm text-foreground">
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty">
              {cleanDescription}
            </p>

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
                        title={`Trailer for ${title}`}
                        src={`https://www.youtube.com/embed/${trailer}?autoplay=1&rel=0`}
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
                  isFav ? "bg-primary/20 border-primary text-primary" : "text-foreground"
                }`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 mr-2 ${isFav ? "fill-current" : ""}`} />
                {isFav ? "Remove from Favorites" : "Add to Favorites"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Anime Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {anime.popularity && (
            <div className="glass-strong rounded-xl p-6 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-semibold">Popularity</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">#{anime.popularity.toLocaleString()}</p>
            </div>
          )}

          {anime.favourites && (
            <div className="glass-strong rounded-xl p-6 space-y-2 animate-fade-in" style={{ animationDelay: "50ms" }}>
              <div className="flex items-center gap-2 text-primary">
                <Heart className="h-5 w-5" />
                <h3 className="font-semibold">Favorites</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">{anime.favourites.toLocaleString()}</p>
            </div>
          )}

          {anime.meanScore && (
            <div className="glass-strong rounded-xl p-6 space-y-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2 text-primary">
                <Star className="h-5 w-5" />
                <h3 className="font-semibold">Mean Score</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">{anime.meanScore}%</p>
            </div>
          )}

          {anime.status && (
            <div className="glass-strong rounded-xl p-6 space-y-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center gap-2 text-primary">
                <Hash className="h-5 w-5" />
                <h3 className="font-semibold">Status</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">{anime.status.replace('_', ' ')}</p>
            </div>
          )}
        </div>

        {/* Characters */}
        {anime.characters?.edges && anime.characters.edges.length > 0 && (
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Characters</h2>
            <div className="relative group/row">
              {/* Scroll buttons */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => scrollCharacters("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 glass-strong opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-primary/20 hidden sm:flex"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => scrollCharacters("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 glass-strong opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-primary/20 hidden sm:flex"
              >
                <ChevronRight className="h-6 w-6 text-foreground" />
              </Button>

              <div ref={charactersScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {anime.characters.edges.slice(0, 10).map((edge: any) => {
                  const character = edge.node
                  return (
                    <div key={character.id} className="flex-shrink-0 w-32 sm:w-40 space-y-2">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden glass-strong">
                        {character.image?.large ? (
                          <Image
                            src={character.image.large}
                            alt={character.name?.full || 'Character'}
                            width={160}
                            height={240}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background flex items-center justify-center">
                            <span className="text-4xl text-muted-foreground">
                              {character.name?.full?.[0] || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm truncate">
                          {character.name?.full || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{edge.role}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Studios */}
        {anime.studios?.edges && anime.studios.edges.length > 0 && (
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "250ms" }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Studios</h2>
            <div className="flex flex-wrap gap-4">
              {anime.studios.edges.map((edge: any) => (
                <div key={edge.node.id} className="glass-strong rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{edge.node.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {anime.recommendations?.edges && anime.recommendations.edges.length > 0 && (
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Recommendations</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {anime.recommendations.edges.slice(0, 6).map((edge: any) => {
                const rec = edge.node.mediaRecommendation
                if (!rec) return null
                return (
                  <a
                    key={rec.id}
                    href={`/anime/${rec.id}`}
                    className="group cursor-pointer space-y-2"
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden glass-strong group-hover:ring-2 group-hover:ring-primary transition-all">
                      {rec.coverImage?.large ? (
                        <Image
                          src={rec.coverImage.large}
                          alt={rec.title?.english || rec.title?.romaji || 'Anime'}
                          width={300}
                          height={450}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {rec.title?.english || rec.title?.romaji || 'Unknown'}
                    </p>
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
