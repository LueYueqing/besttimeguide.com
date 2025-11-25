import React from 'react'

interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function Container({ children, size = 'lg', className = '' }: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

interface SectionProps {
  children: React.ReactNode
  variant?: 'default' | 'white' | 'primary' | 'gradient' | 'dark'
  className?: string
  id?: string
}

export function Section({ children, variant = 'default', className = '', id }: SectionProps) {
  const variantClasses = {
    default: 'section',
    white: 'section bg-white',
    primary: 'section bg-gradient-primary',
    gradient: 'section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white',
    dark: 'section bg-neutral-900 text-white'
  }

  return (
    <section id={id} className={`${variantClasses[variant]} ${className}`}>
      <div className="container">
        {children}
      </div>
    </section>
  )
}

interface HeroProps {
  children: React.ReactNode
  variant?: 'default' | 'pattern'
  className?: string
}

export function Hero({ children, variant = 'default', className = '' }: HeroProps) {
  const variantClasses = {
    default: 'hero hero-bg',
    pattern: 'hero hero-bg bg-pattern'
  }

  return (
    <section className={`${variantClasses[variant]} ${className}`}>
      <div className="hero-container text-center">
        {children}
      </div>
    </section>
  )
}
