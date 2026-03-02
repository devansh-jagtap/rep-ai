'use client'
import Link from 'next/link'
import { LogoIcon } from '@/components/logo'
import { Menu, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'

const menuItems = [
    { name: 'How it works', href: '/how-it-works' },
    { name: 'What we build', href: '/what-we-build' },
    { name: 'Agents', href: '/agents' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About', href: '/about' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="relative z-50">
            <nav
                data-state={menuState && 'active'}
                className={cn(
                    'fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 rounded-full border border-white/10 shadow-2xl',
                    isScrolled
                        ? 'w-[95%] md:w-[75%] bg-black/80 backdrop-blur-2xl py-3 px-2 md:px-4'
                        : 'w-[98%] md:w-[80%] bg-white/5 backdrop-blur-xl py-4 px-4 md:px-6'
                )}>
                <div className="mx-auto w-full">
                    <div className="relative flex items-center justify-between gap-4">
                        {/* Left: Logo */}
                        <div className="flex shrink-0">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center gap-2">
                                <LogoIcon className="h-8 md:h-9 w-auto" />
                                <span className="font-serif text-lg md:text-xl tracking-tight text-white hidden sm:inline-block">Mimick.me</span>
                            </Link>
                        </div>

                        {/* Center: Navigation Links */}
                        <div className="hidden lg:flex items-center justify-center flex-1">
                            <ul className="flex items-center gap-6 xl:gap-8">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-[13px] font-medium text-white/60 hover:text-white transition-colors duration-200 tracking-wide uppercase">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 md:gap-4 shrink-0">
                            <button aria-label="Search" className="text-white/60 hover:text-white transition-colors hidden sm:block">
                                <Search className="size-4 md:size-5" />
                            </button>
                            <Link
                                href="/auth/signin"
                                className="text-[13px] font-medium text-white/60 hover:text-white transition-colors hidden md:block">
                                Log in
                            </Link>
                            <Button
                                asChild
                                size="sm"
                                className="rounded-full bg-[#D36746] hover:bg-[#b5583c] text-white px-4 md:px-6 h-9 md:h-10 text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border-none">
                                <Link href="/auth/signup">
                                    Get Started
                                </Link>
                            </Button>

                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="lg:hidden text-white p-1 hover:bg-white/10 rounded-full transition-colors">
                                {menuState ? <X className="size-5 md:size-6" /> : <Menu className="size-5 md:size-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={cn(
                    "fixed inset-0 z-20 lg:hidden bg-black/95 backdrop-blur-2xl transition-all duration-500 flex flex-col items-center justify-center p-8 space-y-8",
                    menuState ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
                )}>
                    <ul className="flex flex-col items-center gap-8 text-center">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    onClick={() => setMenuState(false)}
                                    className="text-2xl font-serif text-white/80 hover:text-white">
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col w-full gap-4 pt-8">
                        <Button asChild variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">
                            <Link href="/auth/signin">Log in</Link>
                        </Button>
                        <Button asChild className="rounded-full bg-[#D36746] text-white">
                            <Link href="/auth/signup">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </nav>
        </header>
    )
}
