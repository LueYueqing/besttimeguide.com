'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from './AuthButton'

interface NavigationProps {
  variant?: 'default' | 'homepage'
}

export default function Navigation({ variant }: NavigationProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path.startsWith('#')) {
      return pathname === '/'
    }
    return pathname === path
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/travel', label: 'Travel' },
    { href: '/social-media', label: 'Social Media' },
    { href: '/health', label: 'Health' },
    { href: '/shopping', label: 'Shopping' },
    { href: '/lifestyle', label: 'Lifestyle' },
  ]

  return (
    <nav className="navbar-wikihow sticky top-0 z-50">
      <div className="navbar-wikihow-container">
        <div className="navbar-wikihow-content">
          {/* Logo */}
          <Link href="/" className="navbar-wikihow-brand">
            <span>BestTime<span>Guide</span></span>
          </Link>
          
          {/* Main Navigation - wikiHow style */}
          <div className="navbar-wikihow-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-wikihow-link ${
                  isActive(link.href) ? 'active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Right side - Search and Menu */}
          <div className="flex items-center gap-4">
            <Link
              href="/help/faq"
              className="hidden md:block navbar-wikihow-link"
            >
              FAQ
            </Link>
            <button className="md:hidden p-2 text-white hover:bg-white/20 rounded transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
