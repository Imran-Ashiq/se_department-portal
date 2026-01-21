'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, PlusCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/applications', label: 'Apps', icon: FileText },
  { href: '/applications/create', label: 'Create', icon: PlusCircle },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-4 mb-4">
        <div className="relative rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-lg">
          <div className="flex items-center justify-around px-2 py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomnav-active"
                      className="absolute inset-0 bg-indigo-50 rounded-2xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative z-10">
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors',
                        isActive ? 'text-indigo-600' : 'text-slate-600'
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'relative z-10 text-xs font-medium transition-colors',
                      isActive ? 'text-indigo-600' : 'text-slate-600'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
