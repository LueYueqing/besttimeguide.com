'use client'

import { useState, ReactNode } from 'react'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import Image from 'next/image'
import SidebarNavigation from './SidebarNavigation'

interface DashboardLayoutProps {
    children: ReactNode
    title?: string
    subtitle?: string
    isFullWidth?: boolean
}

export default function DashboardLayout({ children, title, subtitle, isFullWidth = false }: DashboardLayoutProps) {
    const { user, signOut } = useUser()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)

    if (!user) return null

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
            {/* Top Header */}
            <header className="h-16 bg-white border-b border-neutral-200 fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        aria-label="Toggle Sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
                            <Image
                                src="/images/logo-quart.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                        <span className="font-bold text-lg hidden sm:block tracking-tight text-neutral-900">
                            BestTime<span className="text-primary-600">Guide</span>
                        </span>
                    </Link>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Dashboard Title (Desktop only) */}
                    {title && (
                        <div className="hidden md:block border-l border-neutral-200 pl-4">
                            <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-neutral-100 transition-colors focus:outline-none"
                        >
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    width={32}
                                    height={32}
                                    className="rounded-full shadow-sm"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
                                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </div>
                            )}
                            <svg
                                className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
                                    <div className="px-4 py-2 border-b border-neutral-100 mb-1">
                                        <p className="text-sm font-semibold text-neutral-900 truncate">{user.name || 'User'}</p>
                                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        href="/dashboard/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Account Settings</span>
                                    </Link>
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span>Back to Site</span>
                                    </Link>
                                    <div className="border-t border-neutral-100 mt-1 pt-1">
                                        <button
                                            onClick={async () => {
                                                setShowUserMenu(false)
                                                await signOut()
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <div className="flex flex-1 pt-16">
                {/* Sidebar */}
                <SidebarNavigation
                    user={user}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Content Area */}
                <main className="flex-1 w-0 min-w-0 lg:ml-64 overflow-x-hidden">
                    <div className={`${isFullWidth ? 'max-w-none' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

