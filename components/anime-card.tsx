"use client"

import Image from 'next/image'
import { Star, Heart } from 'lucide-react'
import { favoritesStore, FavoriteMovie } from '@/lib/favorites-store'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface AnimeCardProps {
  anime: any // AniListMedia
  index?: number
}

export function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    setIsFav(favoritesStore.isFavorite(anime.id, 'anime'))
    const handler = () => setIsFav(favoritesStore.isFavorite(anime.id, 'anime'))
    window.addEventListener('favorites-changed', handler)
    return () => window.removeEventListener('favorites-changed', handler)
  }, [anime.id])

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
    } as FavoriteMovie)
  }

  const title = anime.title?.english || anime.title?.romaji || anime.title?.native || 'Unknown'
  const imageUrl = anime.coverImage?.large || anime.coverImage?.extraLarge || '/placeholder.svg'
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : '—'
  const year = anime.seasonYear || anime.startDate?.year || '—'

  return (
    <Link href={`/anime/${anime.id}`}>
      <div
        className="group relative aspect-[2/3] rounded-xl overflow-hidden glass cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 animate-fade-in-up"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <Image
          src={imageUrl}
          alt={title}
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
            isFav ? "bg-primary/20 border-primary" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : "text-foreground"}`} />
        </Button>

        {/* Info overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-2 text-foreground">{title}</h3>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1 text-primary">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
              <span className="font-medium">{score}</span>
            </div>
            <span className="text-muted-foreground">{year}</span>
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 left-2 glass-strong px-2 py-1 rounded-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Star className="h-3 w-3 text-primary fill-current" />
          <span className="text-xs font-medium text-foreground">{score}</span>
        </div>
      </div>
    </Link>
  )
}
