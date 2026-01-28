import { NextResponse } from "next/server"
import { getTrendingMoviesWithFilters } from "@/lib/tmdb-actions"
import { getTrendingAnime } from "@/lib/anilist-actions"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const timeWindow = (url.searchParams.get("timeWindow") as "day" | "week") || "week"
    const genre = url.searchParams.get("genre") || "all"
    const sortBy = url.searchParams.get("sortBy") || undefined
    const minVote = url.searchParams.get("minVote") ? Number(url.searchParams.get("minVote")) : undefined
    const year = url.searchParams.get("year") ? Number(url.searchParams.get("year")) : undefined
    const contentType = url.searchParams.get("contentType") || "all"

    let results: any[] = []

    // Fetch movies
    if (contentType === "all" || contentType === "movies") {
      const movieResults = await getTrendingMoviesWithFilters(timeWindow, genre, {
        sortBy,
        minVote,
        year,
      })
      results = [...results, ...movieResults.map((m) => ({ ...m, type: "movie" }))]
    }

    // Fetch anime
    if (contentType === "all" || contentType === "anime") {
      const animeResults = await getTrendingAnime(1, 20)
      const mappedAnime = animeResults.map((a) => ({
        id: a.id,
        title: a.title.english || a.title.romaji || a.title.native || "Unknown",
        poster_path: a.coverImage?.large || a.coverImage?.extraLarge,
        vote_average: a.averageScore ? a.averageScore / 10 : 0,
        release_date: `${a.seasonYear || ""}`,
        overview: a.description,
        type: "anime",
        anime: a, // Keep full anime object for rendering
      }))
      results = [...results, ...mappedAnime]
    }

    // Sort by popularity/rating if needed
    if (sortBy === "popularity.desc") {
      results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    } else if (sortBy === "vote_average.desc") {
      results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    }

    return NextResponse.json({ results })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("/api/trending error", err)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
