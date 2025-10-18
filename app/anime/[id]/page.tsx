import { notFound } from 'next/navigation'
import { getAnimeDetails } from '@/lib/anilist-actions'
import { MainNav } from '@/components/main-nav'
import { RequireAuth } from '@/components/require-auth'
import { AnimeDetailClient } from '@/components/anime-detail-client'

export default async function AnimeDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params
  const animeId = Number.parseInt(id)
  if (Number.isNaN(animeId)) notFound()
  const anime = await getAnimeDetails(animeId)
  if (!anime) notFound()
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <MainNav />
        <AnimeDetailClient anime={anime} />
      </div>
    </RequireAuth>
  )
}
