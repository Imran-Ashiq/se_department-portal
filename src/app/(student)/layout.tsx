'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BottomNav } from '@/components/student/bottom-nav';

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.role === 'STUDENT') {
    return (
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        {children}
        <BottomNav />
      </div>
    );
  }

  return null;
}
