import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, LogIn, LayoutDashboard } from 'lucide-react';
import { NoticeFeed } from '@/components/notice-feed';

async function getInitialNotices() {
  const limit = 5;
  
  const [notices, totalCount] = await Promise.all([
    db.notice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      take: limit,
    }),
    db.notice.count(),
  ]);

  return {
    notices: notices.map(notice => ({
      ...notice,
      createdAt: notice.createdAt.toISOString(),
    })),
    hasMore: notices.length < totalCount,
  };
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const { notices, hasMore } = await getInitialNotices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Department Portal</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Public Notice Board</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {session ? (
              <Link href={session.user.role === 'STUDENT' ? '/dashboard' : '/admin/dashboard'}>
                <Button size="sm" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Go to Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login / Portal</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Social Feed */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Latest Department Updates
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Stay informed with the latest announcements and notices
          </p>
        </div>

        {/* Notices Feed */}
        <NoticeFeed initialNotices={notices} initialHasMore={hasMore} />
      </main>

      {/* Bottom Padding */}
      <div className="h-16"></div>
    </div>
  );
}
