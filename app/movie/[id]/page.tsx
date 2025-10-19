import { getMovieDetails } from "@/lib/tmdb-actions"
import { MainNav } from "@/components/main-nav"
import { MovieDetailClient } from "@/components/movie-detail-client"
import { RequireAuth } from "@/components/require-auth"
import { notFound } from "next/navigation"

export default async function MovieDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params
  const movieId = Number.parseInt(id)
  const movie = await getMovieDetails(movieId)

  if (!movie) {
    notFound()
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <MainNav />
        <MovieDetailClient movie={movie} />
      </div>
    </RequireAuth>
  )
}
