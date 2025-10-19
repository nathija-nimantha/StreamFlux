import { MainNav } from "@/components/main-nav"
import { RequireAuth } from "@/components/require-auth"
import { HeroCarousel } from "@/components/hero-carousel"
import { MovieRow } from "@/components/movie-row"

export default function HomePage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <MainNav />

        <main className="relative">
          <HeroCarousel />

          <div className="relative z-10 -mt-32 space-y-8 sm:space-y-12 pb-20">
            <MovieRow title="Trending Now" category="trending" />
            <MovieRow title="Popular Movies" category="popular" />
            <MovieRow title="Top Rated" category="top_rated" />
            <MovieRow title="Upcoming Releases" category="upcoming" />
            <MovieRow title="Action & Adventure" genre={28} />
            <MovieRow title="Comedy" genre={35} />
            <MovieRow title="Drama" genre={18} />
            <MovieRow title="Science Fiction" genre={878} />
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}
