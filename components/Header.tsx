import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">ATSFlow</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-text-secondary hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/pricing" 
              className="text-text-secondary hover:text-primary transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* User button */}
          <div className="flex items-center space-x-4">
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
