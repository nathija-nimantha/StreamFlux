"use client"

import type React from "react"

import Image from "next/image"
import { Star, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { favoritesStore } from "@/lib/favorites-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// TMDb genre mapping
const GENRE_MAP: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
}

interface MovieCardProps {
  movie: {
    id: number
    title: string
    poster_path: string
    vote_average: number
    release_date: string
    backdrop_path?: string
    category?: 'movie' | 'anime'
    popularity?: number
    genres?: { id: number; name: string }[]
    genre_ids?: number[]
    overview?: string
  }
  index?: number
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    setIsFavorite(favoritesStore.isFavorite(movie.id, movie.category ?? 'movie'))

    const handleFavoritesChange = () => {
  setIsFavorite(favoritesStore.isFavorite(movie.id, movie.category ?? 'movie'))
    }

    window.addEventListener("favorites-changed", handleFavoritesChange)
    return () => window.removeEventListener("favorites-changed", handleFavoritesChange)
  }, [movie.id])

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Convert genre_ids to genres array if needed
    let genres = movie.genres
    if (!genres && movie.genre_ids) {
      genres = movie.genre_ids.map(id => ({ id, name: GENRE_MAP[id] || 'Unknown' }))
    }
    
    favoritesStore.toggleFavorite({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      backdrop_path: movie.backdrop_path,
      popularity: movie.popularity,
      genres: genres,
      overview: movie.overview,
      category: movie.category ?? 'movie',
    } as any)
  }

  // Handle both movie (TMDb) and anime (AniList) image URLs
  const imageUrl = movie.poster_path
    ? movie.category === 'anime' || movie.poster_path.startsWith('http')
      ? movie.poster_path // Anime images are already full URLs
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}` // Movie images need TMDb base URL
    : "/abstract-movie-poster.png"

  const linkHref = movie.category === 'anime' ? `/anime/${movie.id}` : `/movie/${movie.id}`

  return (
    <Link href={linkHref}>
      <div
        className="group relative aspect-[2/3] rounded-xl overflow-hidden glass cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 animate-fade-in-up"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <Button
          size="icon"
          variant="ghost"
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity glass-strong border-border/50 ${
            isFavorite ? "bg-primary/20 border-primary" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : "text-foreground"}`} />
        </Button>

        {/* Info overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-2 text-foreground">{movie.title}</h3>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1 text-primary">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
              <span className="font-medium">{typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—'}</span>
            </div>
            <span className="text-muted-foreground">{movie.release_date ? new Date(movie.release_date).getFullYear() : '—'}</span>
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 left-2 glass-strong px-2 py-1 rounded-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Star className="h-3 w-3 text-primary fill-current" />
          <span className="text-xs font-medium text-foreground">{typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—'}</span>
        </div>
      </div>
    </Link>
  )
}
