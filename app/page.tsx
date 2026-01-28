import { LandingNav } from "@/components/landing-nav"
import { HeroSection } from "@/components/hero-section"
import { TrendingSection } from "@/components/trending-section"
import { Spline3D } from "@/components/spline-3d"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10">
        <LandingNav />
        <HeroSection />
        <Spline3D />
        <TrendingSection />
      </div>
    </div>
  )
}
