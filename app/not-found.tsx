import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNav />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full text-center">
          <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mx-auto mb-6 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-20 h-20 text-primary">
              <g fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M8 44c6-6 16-10 24-10s18 4 24 10" opacity="0.15" />
                <path d="M12 30c6-6 24-10 40 0" strokeLinecap="round" />
                <path d="M28 18c0 6-6 10-6 14" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M36 18c0 6 6 10 6 14" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="32" cy="30" r="2" fill="currentColor" />
              </g>
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
            Lost in the Stream?
          </h1>

          <p className="text-muted-foreground mb-6 text-lg">
            We couldn't find the page you were looking for. Maybe it swam off to a different playlist.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/home">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Take me home</Button>
            </Link>

            <Link href="/trending">
              <Button variant="outline">See what's trending</Button>
            </Link>

            <Link href="/search">
              <Button variant="ghost">Search movies</Button>
            </Link>
          </div>

          <div className="mt-10 text-sm text-muted-foreground">
            <p>Tip: try searching for a movie title, or check the navigation above.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto max-w-7xl">© {new Date().getFullYear()} Streamflux — you found a missing scene 🎬</div>
      </footer>
    </div>
  )
}
