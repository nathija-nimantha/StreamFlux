import { MainNav } from '@/components/main-nav'
import { RequireAuth } from '@/components/require-auth'
import { AnimeRow } from '@/components/anime-row'
import { AnimeHeroCarousel } from '@/components/anime-hero-carousel'

export default function AnimeHomePage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="relative">
          <AnimeHeroCarousel />

          <div className="relative z-10 -mt-32 space-y-8 sm:space-y-12 pb-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <AnimeRow title="Trending Now" category="trending" />
              <AnimeRow title="Popular Anime" category="popular" />
              <AnimeRow title="Top Rated" category="top_rated" />
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}
