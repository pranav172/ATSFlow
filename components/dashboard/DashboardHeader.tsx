'use client';

import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Resumes' },
    // { href: '/dashboard/settings', label: 'Settings' }, // Future
  ];

  return (
    <header className="border-b bg-white dark:bg-dark-surface border-border dark:border-dark-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            ATSFlow
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-text-primary dark:hover:text-dark-text-primary",
                  pathname === link.href 
                    ? "text-text-primary dark:text-dark-text-primary" 
                    : "text-text-muted dark:text-dark-text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
