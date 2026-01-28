"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type SearchResult = {
  id: number
  title: string
  poster_path?: string | null
  release_date?: string | number
  type: "movie" | "anime"
}

export function SearchSuggestions({ query, onClose }: { query: string; onClose?: () => void }) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setResults([])
      setError(null)
      return
    }

    const controller = new AbortController()
    const signal = controller.signal
    let mounted = true
    setLoading(true)
    setError(null)

    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`, { signal })
        .then((res) => {
          if (!res.ok) throw new Error(`status:${res.status}`)
          return res.json()
        })
        .then((data) => {
          if (!mounted) return
          setResults(data.results ?? [])
        })
        .catch((err) => {
          if (!mounted) return
          if (err.name === "AbortError") return
          console.error("search suggestions error:", err)
          setResults([])
          setError(String(err?.message ?? err))
        })
        .finally(() => mounted && setLoading(false))
    }, 180) // debounce 180ms

    return () => {
      mounted = false
      controller.abort()
      clearTimeout(timeout)
    }
  }, [query])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose?.()
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [onClose])

  return (
    <div ref={containerRef} className="absolute left-0 right-0 mt-2 w-full sm:w-[420px] bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
      <div className="p-2">
        {loading && <div className="p-2 text-sm text-muted-foreground">Loading…</div>}

        {!loading && error && (
          <div className="p-2 text-sm text-red-500">Error: {error}</div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="p-2 text-sm text-muted-foreground">No suggestions</div>
        )}

        {!loading && results.length > 0 && (
          <ul className="divide-y divide-border max-h-56 overflow-auto">
            {results.map((m) => (
              <li key={m.id} className="flex items-center gap-3 p-2 hover:bg-muted-foreground/5 rounded-md">
                <Link
                  href={m.type === "anime" ? `/anime/${m.id}` : `/movie/${m.id}`}
                  onClick={() => onClose?.()}
                  className="flex items-center gap-3 w-full"
                >
                  <div className="w-10 h-14 bg-muted-foreground/10 rounded overflow-hidden flex-shrink-0">
                    {m.poster_path ? (
                      m.type === "anime"
                        ? <img src={m.poster_path} alt={m.title} className="w-full h-full object-cover" />
                        : <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt={m.title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{typeof m.release_date === "string" ? m.release_date.slice(0, 4) : m.release_date ?? ""}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="p-2">
          <button
            type="button"
            onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
            className="w-full text-sm text-left text-primary hover:underline"
          >
            See more results for "{query}"
          </button>
        </div>
      </div>
    </div>
  )
}
