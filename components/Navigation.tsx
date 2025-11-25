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
    { href: '/scan-qr-code', label: 'Scan QR' },
    { href: '/features', label: 'Features' },
    { href: '/blog', label: 'Blog' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/faq', label: 'FAQ' },
  ]

  const cta = {
    href: '/pricing',
    label: 'Get Started',
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <Link href="/" className="navbar-brand">
            <img src="/logo.png" alt="CustomQR.pro" className="w-8 h-8" />
            <span>CustomQR<span className="text-gradient">.pro</span></span>
          </Link>
          
          <div className="navbar-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-link ${
                  isActive(link.href) ? 'active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Link href={cta.href} className="navbar-cta">
              {cta.label}
            </Link>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
