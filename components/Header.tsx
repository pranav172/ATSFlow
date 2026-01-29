import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <header className="border-b border-border dark:border-slate-700 bg-white dark:bg-dark-surface transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/icon-192.png" alt="ATSFlow" className="w-8 h-8 rounded-lg" />
            <span className="text-2xl font-bold text-primary">ATSFlow</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-text-secondary dark:text-slate-300 hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className="text-text-secondary dark:text-slate-300 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/pricing" 
              className="text-text-secondary dark:text-slate-300 hover:text-primary transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* User button & Theme Toggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
