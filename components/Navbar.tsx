'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Activity, LogOut, Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import {
  DEFAULT_AUTH_CALLBACK_URL,
  buildSignInPath,
  normalizeCallbackUrl,
} from '@/lib/authRoutes'

const navItems = [
  { href: '/', label: 'Home', protected: false },
  { href: '/dashboard', label: 'Medicine Search', protected: true },
  { href: '/appointments', label: 'Appointments', protected: true },
]

type UserAvatarProps = {
  image?: string | null
  name?: string | null
  className?: string
}

function UserAvatar({ image, name, className = '' }: UserAvatarProps) {
  const fallbackLabel = name?.trim().charAt(0).toUpperCase() || 'U'

  if (image) {
    return (
      <img
        src={image}
        alt={name ? `${name} profile` : 'User profile'}
        className={`rounded-full object-cover ${className}`}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <div className={`rounded-full bg-sage-200 text-sage-700 ${className} flex items-center justify-center text-sm font-semibold`}>
      {fallbackLabel}
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const userName = session?.user?.name?.trim() || session?.user?.email?.split('@')[0] || 'Profile'
  const compactUserName = userName.split(/\s+/)[0] || userName
  const userEmail = session?.user?.email || 'Signed in with Google'

  const handleAuthAction = () => {
    if (isAuthenticated) {
      void signOut({ callbackUrl: '/' })
      return
    }

    if (pathname === '/sign-in') {
      const currentSearch = typeof window === 'undefined' ? '' : window.location.search
      const params = new URLSearchParams(currentSearch)
      const callbackUrl = normalizeCallbackUrl(params.get('callbackUrl'))
      void signIn('google', { callbackUrl })
      return
    }

    const callbackUrl = pathname === '/' ? DEFAULT_AUTH_CALLBACK_URL : pathname
    router.push(buildSignInPath(callbackUrl))
  }

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    isProtected: boolean,
  ) => {
    if (isProtected && !isAuthenticated) {
      event.preventDefault()
      router.push(buildSignInPath(href))
    }
  }

  useEffect(() => {
    // GSAP entrance animation
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.1 }
      )
      gsap.fromTo(logoRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.7)', delay: 0.5 }
      )
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-3 md:top-4 left-1/2 -translate-x-1/2 w-[94vw] max-w-7xl z-[101] transition-all duration-300 rounded-full select-none ${
          scrolled ? 'glass shadow-lg border-white/20' : 'bg-white/10 backdrop-blur-md border border-white/10'
        }`}
      >
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">

            <div ref={logoRef} className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-sage-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <Activity size={18} className="text-white" />
                </div>
                <span className="font-display text-base md:text-lg lg:text-xl font-bold text-sage-800 whitespace-nowrap hidden sm:block">Shifa <span className="text-sage-500">AI</span></span>
              </Link>
            </div>

            {/* Desktop Nav Links - Only visible on Large Screens */}
            <div className="hidden min-[1100px]:flex items-center gap-4 xl:gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href, item.protected)}
                  className={`nav-link text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    pathname === item.href
                      ? 'text-sage-700 active'
                      : 'text-sage-500 hover:text-sage-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden min-[1100px]:flex items-center gap-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleAuthAction}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-sage-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-sage-300 hover:bg-white/10"
                  title="Sign out"
                >
                  <UserAvatar
                    image={session?.user?.image}
                    name={session?.user?.name}
                    className="h-9 w-9 border border-white/50 shadow-sm"
                  />
                  <span className="max-w-24 truncate text-sm font-semibold text-sage-700">
                    {compactUserName}
                  </span>
                  <span className="h-5 w-px bg-sage-200" aria-hidden="true" />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                    <LogOut size={15} />
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAuthAction}
                  className="btn-ghost whitespace-nowrap px-4 py-2 text-sm"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile/Tablet Hamburger */}
            <div className="min-[1100px]:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                className="theme-toggle !p-2 !gap-0"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[100] min-[1100px]:hidden transition-all duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-sage-900/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`absolute top-2 right-2 bottom-2 w-[calc(100%-1rem)] max-w-sm glass shadow-2xl rounded-[2rem] transition-transform duration-500 ease-out border border-white/20 ${
            menuOpen ? 'translate-x-0' : 'translate-x-[110%]'
          }`}
        >
          <div className="pt-20 px-6 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  setMenuOpen(false)
                  handleNavClick(e, item.href, item.protected)
                }}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-sage-100 text-sage-800'
                    : 'text-sage-600 hover:bg-sage-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-cream-200 flex flex-col gap-2">
              {isAuthenticated && (
                <div className="rounded-2xl bg-cream-100/80 p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      image={session?.user?.image}
                      name={session?.user?.name}
                      className="h-12 w-12 border border-white/50"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-sage-800">{userName}</p>
                      <p className="truncate text-xs text-sage-400">{userEmail}</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  handleAuthAction()
                }}
                className="btn-ghost w-full justify-center text-sm"
              >
                {isAuthenticated ? (
                  <>
                    <UserAvatar
                      image={session?.user?.image}
                      name={session?.user?.name}
                      className="h-8 w-8 border border-white/40"
                    />
                    <span>Sign Out</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
