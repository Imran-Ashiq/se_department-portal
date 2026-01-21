'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, FileText, LayoutDashboard, Users, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(role));

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-slate-900 border-b border-slate-800 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span className="ml-2">Menu</span>
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-slate-400">
                  {role === 'SUPER_ADMIN' ? 'HOD Portal' : 
                   role === 'TEACHER' ? 'Teacher Portal' :
                   role === 'CLERK' ? 'Clerk Portal' : 'Admin Portal'}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-6">
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
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Profile Section */}
          <div className="border-t border-slate-800">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 border-2 border-slate-700">
                  <AvatarFallback className="bg-indigo-600 text-white text-sm font-semibold">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {session?.user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
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
