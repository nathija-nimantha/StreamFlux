"use client"

import { useState, useEffect } from "react"
import { LandingNav } from "@/components/landing-nav"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { useSearchParams, useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Prefer sessionStorage flag so URL doesn't need a visible mode param
    let handled = false
    try {
      const flag = sessionStorage.getItem('auth.showSignup')
      if (flag === '1') {
        setIsLogin(false)
        sessionStorage.removeItem('auth.showSignup')
        handled = true
      }
    } catch (_) {
      // ignore sessionStorage errors
    }

    if (!handled) {
      const mode = searchParams.get('mode')
      if (mode === 'signup') setIsLogin(false)
      else setIsLogin(true)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10">
        <LandingNav />

        <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-20">
          <div className="w-full max-w-md animate-fade-in-up">
            {/* Toggle buttons */}
            <div className="glass-strong rounded-2xl p-1 mb-6 flex gap-1">
              <button
                onClick={() => {
                  setIsLogin(true)
                  router.replace('/auth?mode=signin')
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isLogin
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false)
                  router.replace('/auth?mode=signup')
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                  !isLogin
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Auth forms */}
            <div className="glass-strong rounded-2xl p-6 sm:p-8">{isLogin ? <LoginForm /> : <RegisterForm />}</div>

            {/* Additional info */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
