'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { gsap } from 'gsap'
import {
  Activity,
  ArrowRight,
  Calendar,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

type SignInPanelProps = {
  callbackUrl: string
  error?: string
  googleConfigured: boolean
}

const highlights = [
  {
    icon: Search,
    title: 'Medicine Search',
    description: 'Look up dosage, composition, side effects, and pricing in one place.',
    tone: 'bg-sage-100 text-sage-700',
  },
  {
    icon: Calendar,
    title: 'Appointments',
    description: 'Book visits and keep reminders lined up with the rest of your care.',
    tone: 'bg-teal-50 text-teal-700',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    description: 'Your Google sign-in keeps access simple while protecting your health flow.',
    tone: 'bg-amber-50 text-amber-700',
  },
]

const authErrorCopy: Record<string, string> = {
  AccessDenied: 'Google sign-in was denied. Please try again with an approved account.',
  Callback: 'The Google sign-in callback did not complete. Please try again.',
  Configuration: 'Google authentication is not configured correctly yet.',
  Default: 'Google sign-in could not be completed. Please try again.',
  OAuthAccountNotLinked: 'This email is linked to another sign-in method. Use the original provider first.',
  OAuthCallback: 'Google sign-in returned an invalid response. Please try again.',
  OAuthCreateAccount: 'We could not create your account from Google. Please try again.',
  OAuthSignin: 'Google sign-in could not be started. Please try again.',
  SessionRequired: 'Please sign in with Google to continue.',
  Verification: 'Your sign-in link or session is no longer valid. Please try again.',
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.205 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.841 1.154 7.955 3.045l5.657-5.657C34.05 6.053 29.278 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819A11.968 11.968 0 0 1 24 12c3.059 0 5.841 1.154 7.955 3.045l5.657-5.657C34.05 6.053 29.278 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.178 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.95 11.95 0 0 1 24 36c-5.184 0-9.62-3.318-11.283-7.946l-6.522 5.025C9.503 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.06 12.06 0 0 1-4.084 5.57l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  )
}

function formatDestinationLabel(callbackUrl: string) {
  if (callbackUrl === '/dashboard') return 'Medicine Search'
  if (callbackUrl === '/appointments') return 'Appointments'

  const cleaned = callbackUrl.split('?')[0].split('#')[0]
  const label = cleaned
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' / ')

  return label || 'Dashboard'
}

export default function SignInPanel({
  callbackUrl,
  error,
  googleConfigured,
}: SignInPanelProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 },
      )

      gsap.fromTo(
        cardRef.current,
        { y: 44, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.22 },
      )
    })

    return () => ctx.revert()
  }, [])

  const handleGoogleSignIn = async () => {
    if (!googleConfigured || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    await signIn('google', { callbackUrl })
    setIsSubmitting(false)
  }

  const errorMessage = error ? authErrorCopy[error] ?? authErrorCopy.Default : null
  const destinationLabel = formatDestinationLabel(callbackUrl)

  return (
    <main className="relative min-h-screen overflow-hidden noise-overlay">
      <div className="absolute inset-0 pointer-events-none">
        <div className="blob absolute top-[10%] left-[6%] h-[24rem] w-[24rem] bg-sage-200/40 opacity-70" />
        <div className="blob absolute bottom-[8%] right-[8%] h-[18rem] w-[18rem] bg-cream-300/60 opacity-60" />
        <div className="blob absolute top-[44%] right-[18%] h-[10rem] w-[10rem] bg-sage-100/60 opacity-60" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div ref={heroRef}>
          <div className="pill mb-6 inline-flex items-center gap-1.5 bg-sage-100 text-sage-700">
            <Sparkles size={12} />
            Secure Google Access
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight text-sage-900 sm:text-5xl lg:text-6xl">
            Sign in once,
            <span className="gradient-text"> keep your care moving.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-sage-500 sm:text-lg">
            Use Google to unlock the same Shifa AI experience across medicine search,
            appointment booking, and the rest of your health workflow.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description, tone }) => (
              <div key={title} className="glass rounded-2xl p-5 card-lift">
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
                  <Icon size={18} />
                </div>
                <h2 className="font-display text-lg font-semibold text-sage-800">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-sage-400">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-sage-500">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-sage-500" />
              Smooth access to protected routes
            </div>
            <Link href="/" className="btn-ghost py-3 text-sm">
              Back Home
            </Link>
          </div>
        </div>

        <div ref={cardRef} className="glass rounded-[2rem] border border-white/30 p-7 shadow-2xl sm:p-8">
          <div className="pill mb-4 inline-flex bg-cream-100 text-sage-700">
            Continue to {destinationLabel}
          </div>

          <h2 className="font-display text-3xl font-bold text-sage-900">
            Welcome back to Shifa AI
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-sage-500 sm:text-base">
            Sign in with Google to personalize your dashboard, sync your profile image,
            and keep protected tools just one click away.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/80 p-4 text-sm text-orange-700">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!googleConfigured || isSubmitting}
            className="btn-primary mt-6 w-full justify-center py-4 text-base disabled:cursor-not-allowed disabled:opacity-70"
          >
            <GoogleIcon />
            {isSubmitting ? 'Redirecting to Google...' : 'Continue with Google'}
            <ArrowRight size={16} />
          </button>

          {!googleConfigured && (
            <p className="mt-3 text-xs leading-relaxed text-orange-600">
              Add `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` to enable Google login on this route.
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-cream-100/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">After sign-in</p>
              <p className="mt-1 text-sm text-sage-700">You will land on {destinationLabel} automatically.</p>
            </div>
            <div className="rounded-2xl bg-sage-100/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">Profile sync</p>
              <p className="mt-1 text-sm text-sage-700">Your Google avatar is saved and shown in the navigation.</p>
            </div>
          </div>

          <div className="mt-6 border-t border-cream-200 pt-5 text-sm text-sage-500">
            Protected pages will always bring guests back here first, so the experience stays consistent across the app.
          </div>
        </div>
      </section>
    </main>
  )
}
