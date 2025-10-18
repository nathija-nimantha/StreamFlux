import { NextResponse } from "next/server"
import { searchMovies } from "@/lib/tmdb-actions"
import { searchAnime } from "@/lib/search-anime"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get("q") || ""
    const limitParam = url.searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 6

    if (!q) return NextResponse.json({ results: [] })

    // Search movies
    const movieResults = await searchMovies(q)
    const movies = movieResults.slice(0, limit).map((r) => ({
      id: r.id,
      title: r.title,
      poster_path: r.poster_path,
      release_date: r.release_date,
      type: "movie",
    }))

    // Search anime
    const animeResults = await searchAnime(q)
    const anime = animeResults.slice(0, limit).map((r) => ({
      id: r.id,
      title: r.title.romaji || r.title.english || r.title.native,
      poster_path: r.coverImage?.large,
      release_date: r.seasonYear,
      type: "anime",
    }))

    // Merge and limit total results
    const results = [...movies, ...anime].slice(0, limit)

    return NextResponse.json({ results })
  } catch (err) {
    console.error("/api/search error", err)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
