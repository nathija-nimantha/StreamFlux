"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { getPopularAnime, AniListMedia } from "@/lib/anilist-actions"

export function AnimeHeroCarousel() {
  const [items, setItems] = useState<AniListMedia[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await getPopularAnime(1, 5)
        if (active) setItems(data)
      } catch (e) {
        console.warn("Error fetching anime for hero:", e)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (items.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [items.length])

  const goToPrevious = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % items.length)

  if (loading || items.length === 0) {
    return (
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] bg-muted animate-pulse mb-20 sm:mb-24 md:mb-32 lg:mb-40 xl:mb-16">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>
    )
  }

  const current = items[currentIndex]
  const title = current.title?.english || current.title?.romaji || current.title?.native || ""

  return (
    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] overflow-hidden mb-20 sm:mb-24 md:mb-32 lg:mb-40 xl:mb-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        {current.bannerImage ? (
          <Image src={current.bannerImage} alt={title} fill className="object-cover transition-opacity duration-700" priority />
        ) : current.coverImage?.extraLarge ? (
          <Image src={current.coverImage.extraLarge} alt={title} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl space-y-4 sm:space-y-6 pt-16 sm:pt-20 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
            {title}
          </h1>

          {current.description ? (
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground line-clamp-3 text-pretty leading-relaxed" dangerouslySetInnerHTML={{ __html: current.description }} />
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 pb-12 md:pb-0">
            <a
              href={`/anime/${current.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="h-5 w-5 fill-current" />
                View Details
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href={`/anime/${current.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium glass border-border/50 hover:border-primary/50 bg-background/50 text-foreground"
            >
              <Info className="h-5 w-5" />
              More Info
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 glass-strong p-2 sm:p-3 rounded-full hover:bg-primary/20 transition-all group hidden sm:block"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-primary transition-colors" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 glass-strong p-2 sm:p-3 rounded-full hover:bg-primary/20 transition-all group hidden sm:block"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-primary transition-colors" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              index === currentIndex ? "w-8 bg-primary" : "w-4 bg-muted-foreground/50 hover:bg-muted-foreground",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
