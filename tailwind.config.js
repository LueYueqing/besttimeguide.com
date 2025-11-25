/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // 深蓝专业系 - 主色调
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // 主品牌色
          600: '#2563eb',  // 按钮默认
          700: '#1d4ed8',  // 按钮悬停
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // 橙色强调色系
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // 橙色CTA
          600: '#ea580c',  // 橙色CTA悬停
          700: '#dc2626',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // 语义色系
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // 中性色系优化
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      // bg.ibelick风格渐变背景
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        'gradient-hero': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 25%, #bfdbfe 50%, #93c5fd 75%, #60a5fa 100%)',
        'gradient-cta': 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // 专业级阴影系统
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(37, 99, 235, 0.05)',
        'soft': '0 2px 15px -3px rgba(37, 99, 235, 0.07), 0 2px 6px -2px rgba(37, 99, 235, 0.05)',
        'medium': '0 4px 25px -5px rgba(37, 99, 235, 0.1), 0 4px 10px -3px rgba(37, 99, 235, 0.05)',
        'strong': '0 10px 40px -10px rgba(37, 99, 235, 0.15), 0 4px 25px -5px rgba(37, 99, 235, 0.1)',
        'glow': '0 0 20px rgba(37, 99, 235, 0.3)',
        'accent-soft': '0 4px 14px 0 rgba(249, 115, 22, 0.25)',
        'accent-medium': '0 8px 25px 0 rgba(249, 115, 22, 0.35)',
      },
      // 动画曲线
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-brand': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // 间距系统
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // 边框圆角
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      // 断点优化
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}
