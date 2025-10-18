import { NextResponse } from 'next/server'
import { getMovieDetails } from '@/lib/tmdb-actions'

export async function GET(req: Request, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  const p = await params
  const id = Number(p.id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const data = await getMovieDetails(id)
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(data)
}
