'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X } from 'lucide-react';

export function SmartNavbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show on scroll up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Hide on scroll down
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/upload', label: 'Analyze Resume' },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-gray-200 dark:border-gray-800",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
             <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">ATSFlow</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-purple-600 dark:hover:text-purple-400",
                  pathname === link.href 
                    ? "text-purple-600 dark:text-purple-400" 
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
             <ThemeToggle />
             <SignedIn>
                <UserButton afterSignOutUrl="/" />
             </SignedIn>
             <SignedOut>
                <Link href="/sign-in">
                   <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                   <Button size="sm">Get Started</Button>
                </Link>
             </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
             {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
        
       {/* Mobile Menu Overlay */}
       {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-gray-950 pt-20 px-4 md:hidden">
            <nav className="flex flex-col gap-4">
                {navLinks.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                    "text-lg font-medium py-2 border-b border-gray-100 dark:border-gray-800",
                    pathname === link.href 
                        ? "text-purple-600 dark:text-purple-400" 
                        : "text-gray-600 dark:text-gray-400"
                    )}
                >
                    {link.label}
                </Link>
                ))}
                 <div className="flex items-center justify-between py-4">
                    <span>Theme</span>
                    <ThemeToggle />
                 </div>
                 <div className="flex flex-col gap-3 mt-4">
                    <SignedIn>
                        <div className="flex items-center gap-2">
                            <UserButton afterSignOutUrl="/" />
                            <span className="text-sm font-medium">Manage Account</span>
                        </div>
                    </SignedIn>
                    <SignedOut>
                        <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full">Sign In</Button>
                        </Link>
                        <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full">Get Started</Button>
                        </Link>
                    </SignedOut>
                 </div>
            </nav>
        </div>
       )}
    </>
  );
}
