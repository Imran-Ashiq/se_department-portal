'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/admin-sidebar';
import { FileText, Bell, Users, Clock, LogOut, LayoutDashboard, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Stats {
  totalNotices: number;
  totalApplications: number;
  pendingApplications: number;
  resolvedApplications: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role === 'STUDENT') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [noticesRes, applicationsRes] = await Promise.all([
        fetch('/api/notices'),
        fetch('/api/applications'),
      ]);

      if (!noticesRes.ok || !applicationsRes.ok) {
        throw new Error('Failed to fetch stats');
      }

      const notices = await noticesRes.json();
      const applications = await applicationsRes.json();

      setStats({
        totalNotices: notices.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((a: any) => a.status === 'PENDING').length,
        resolvedApplications: applications.filter((a: any) => a.status === 'RESOLVED').length,
      });
    } catch (error) {
      toast.error('Failed to load dashboard stats');
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex">
          <div className="w-64 hidden md:block border-r bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
            <Skeleton className="h-full" />
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar role={session?.user?.role || 'ADMIN'} />

        {/* Main Content */}
        <div className="flex-1 min-h-0 md:ml-64 pt-16 md:pt-0">
          {/* Header */}
          <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {session?.user?.role === 'SUPER_ADMIN' ? 'Head of Department' : 'Admin Panel'}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session?.user?.name || 'Admin'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.role === 'SUPER_ADMIN' ? 'Head of Department' : 'Admin'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1">Overview</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Welcome back! Here's what's happening today.
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
                    <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalNotices || 0}</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Published announcements
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Student applications
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                    <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Awaiting your attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.resolvedApplications || 0}</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Successfully completed
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
                <Link href="/admin/notices/new">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-700 flex items-center justify-center mb-4">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle>Create Notice</CardTitle>
                    <CardDescription>
                      Publish a new announcement for students
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
                <Link href="/admin/applications">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-700 flex items-center justify-center mb-4">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle>Review Applications</CardTitle>
                    <CardDescription>
                      Check pending student applications
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              {session?.user?.role === 'SUPER_ADMIN' && (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
                  <Link href="/admin/users">
                    <CardHeader>
                      <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-700 flex items-center justify-center mb-4">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle>Manage Users</CardTitle>
                      <CardDescription>
                        View and manage faculty accounts
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
