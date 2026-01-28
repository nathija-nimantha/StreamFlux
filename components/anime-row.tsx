"use client"

import { useEffect, useState, useRef } from 'react'
import { AnimeCard } from './anime-card'
import { getTrendingAnime, getPopularAnime, getTopRatedAnime, AniListMedia } from '@/lib/anilist-actions'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

interface AnimeRowProps {
  title: string
  category: 'trending' | 'popular' | 'top_rated'
}

export function AnimeRow({ title, category }: AnimeRowProps) {
  const [items, setItems] = useState<AniListMedia[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const data =
          category === 'trending'
            ? await getTrendingAnime(1, 10)
            : category === 'popular'
            ? await getPopularAnime(1, 10)
            : await getTopRatedAnime(1, 10)
        if (active) setItems(data)
      } catch (e) {
        console.warn('Failed to load anime', e)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [category])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
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
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 glass-strong opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-primary/20 hidden sm:flex"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 glass-strong opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-primary/20 hidden sm:flex"
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </Button>

          {/* Anime scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((anime, index) => (
              <div key={anime.id} className="min-w-[150px] sm:min-w-[200px]">
                <AnimeCard anime={anime} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
