'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, FileText, LayoutDashboard, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  role: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'SUPER_ADMIN', 'CLERK', 'TEACHER'],
  },
  {
    title: 'Notices',
    href: '/admin/notices',
    icon: Bell,
    roles: ['ADMIN', 'SUPER_ADMIN', 'CLERK', 'TEACHER'],
  },
  {
    title: 'Applications',
    href: '/admin/applications',
    icon: FileText,
    roles: ['ADMIN', 'SUPER_ADMIN', 'CLERK', 'TEACHER'],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['SUPER_ADMIN'],
  },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-20 bg-white dark:bg-slate-950 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span className="ml-2">Menu</span>
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 border-r bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Admin Panel</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {role === 'SUPER_ADMIN' ? 'HOD Portal' : 
                   role === 'TEACHER' ? 'Teacher Portal' :
                   role === 'CLERK' ? 'Clerk Portal' : 'Admin Portal'}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t">
            <p className="text-xs text-slate-500 text-center">
              Departmental Portal v1.0
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
