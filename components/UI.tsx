import React from 'react'

// ===== 按钮组件 =====
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'white'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  href,
  onClick,
  type = 'button',
  disabled = false
}: ButtonProps) {
  const baseClasses = 'btn transition-all duration-200 font-semibold'
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    accent: 'btn-accent',
    ghost: 'btn-ghost',
    white: 'bg-white text-primary-600 hover:bg-neutral-50'
  }
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }
  
  return (
    <button 
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// ===== 卡片组件 =====
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'highlighted' | 'gradient' | 'bordered'
  padding?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md',
  className = '' 
}: CardProps) {
  const baseClasses = 'card'
  
  const variantClasses = {
    default: '',
    highlighted: 'border-2 border-primary-200',
    gradient: 'bg-gradient-to-br from-primary-50 to-primary-100',
    bordered: 'border-2 border-primary-500'
  }
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}

// ===== 标题组件 =====
interface HeadingProps {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  variant?: 'default' | 'gradient' | 'primary'
  className?: string
}

export function Heading({ 
  children, 
  level = 2, 
  variant = 'default',
  className = '' 
}: HeadingProps) {
  const baseClasses = 'font-bold text-neutral-900'
  
  const levelClasses = {
    1: 'text-4xl lg:text-5xl',
    2: 'text-2xl lg:text-3xl',
    3: 'text-xl lg:text-2xl', 
    4: 'text-lg lg:text-xl',
    5: 'text-base lg:text-lg',
    6: 'text-sm lg:text-base'
  }
  
  const variantClasses = {
    default: '',
    gradient: 'text-gradient',
    primary: 'text-primary-600'
  }
  
  const classes = `${baseClasses} ${levelClasses[level]} ${variantClasses[variant]} ${className}`
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <Tag className={classes}>
      {children}
    </Tag>
  )
}

// ===== 间距组件 =====
interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

export function Spacer({ size = 'md', className = '' }: SpacerProps) {
  const sizeClasses = {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8', 
    xl: 'h-12',
    '2xl': 'h-16'
  }
  
  return <div className={`${sizeClasses[size]} ${className}`} />
}

// ===== 文本组件 =====
interface TextProps {
  children: React.ReactNode
  variant?: 'body' | 'lead' | 'small' | 'muted'
  className?: string
}

export function Text({ 
  children, 
  variant = 'body',
  className = '' 
}: TextProps) {
  const variantClasses = {
    body: 'text-neutral-700',
    lead: 'text-lg text-neutral-600',
    small: 'text-sm text-neutral-600',
    muted: 'text-neutral-500'
  }
  
  return (
    <p className={`${variantClasses[variant]} ${className}`}>
      {children}
    </p>
  )
}

// ===== 网格组件 =====
interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Grid({ 
  children, 
  cols = 2, 
  gap = 'md',
  className = '' 
}: GridProps) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
  
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }
  
  const classes = `grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}
