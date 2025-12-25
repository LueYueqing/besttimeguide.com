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
    { href: '/travel', label: 'Travel' },
    { href: '/social-media', label: 'Social Media' },
    { href: '/health', label: 'Health' },
    { href: '/shopping', label: 'Shopping' },
    { href: '/lifestyle', label: 'Lifestyle' },
    { href: '/help/faq', label: 'FAQ' },
  ]

  const cta = {
    href: '/help/contact',
    label: 'Contact',
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <Link href="/" className="navbar-brand">
            <span className="text-2xl font-black">BestTime<span className="text-gradient">Guide</span></span>
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
