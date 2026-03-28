'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Activity, Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const navItems = [
  { href: '/', label: 'Home', protected: false },
  { href: '/dashboard', label: 'Medicine Search', protected: true },
  { href: '/appointments', label: 'Appointments', protected: true },
]

export default function Navbar() {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const handleAuthClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (isAuthenticated) {
      void signOut({ callbackUrl: '/' })
    } else {
      void signIn('google')
    }
  }

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, isProtected: boolean) => {
    if (isProtected && !isAuthenticated) {
      event.preventDefault()
      void signIn('google')
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
                  onClick={(e) => handleNavClick(e, item.protected)}
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
              <Link href="/" onClick={handleAuthClick} className="btn-ghost text-sm py-2 px-4 whitespace-nowrap">
                {isAuthenticated ? 'Sign Out' : 'Sign In'}
              </Link>
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
                  handleNavClick(e, item.protected)
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
              <Link
                href="/"
                onClick={(event) => {
                  setMenuOpen(false)
                  handleAuthClick(event)
                }}
                className="btn-ghost w-full justify-center text-sm"
              >
                {isAuthenticated ? 'Sign Out' : 'Sign In'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
