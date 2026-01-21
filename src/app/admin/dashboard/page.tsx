'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/admin-sidebar';
import { FileText, Bell, Users, Clock, Plus, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Stats {
  totalNotices: number;
  totalApplications: number;
  pendingApplications: number;
  resolvedApplications: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'notice';
  action: string;
  timestamp: Date;
  user?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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
        fetch('/api/notices?limit=100'),
        fetch('/api/applications'),
      ]);

      if (!noticesRes.ok || !applicationsRes.ok) {
        throw new Error('Failed to fetch stats');
      }

      const noticesData = await noticesRes.json();
      const applications = await applicationsRes.json();

      const notices = noticesData.notices || [];

      setStats({
        totalNotices: notices.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((a: any) => a.status === 'PENDING').length,
        resolvedApplications: applications.filter((a: any) => a.status === 'RESOLVED').length,
      });

      // Mock recent activity from actual data
      const activities: RecentActivity[] = [
        ...applications.slice(0, 3).map((app: any) => ({
          id: app.id,
          type: 'application' as const,
          action: `New ${app.type.toLowerCase()} application submitted`,
          timestamp: new Date(app.createdAt),
          user: app.student?.name || 'Student',
        })),
        ...notices.slice(0, 2).map((notice: any) => ({
          id: notice.id,
          type: 'notice' as const,
          action: `Notice published: ${notice.title.substring(0, 40)}...`,
          timestamp: new Date(notice.createdAt),
          user: notice.author?.name || 'Admin',
        })),
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

      setRecentActivity(activities);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          <div className="w-64 hidden md:block">
            <Skeleton className="h-screen" />
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="h-12 w-64 mb-8" />
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
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar role={session?.user?.role || 'ADMIN'} />

        <div className="flex-1 md:ml-64">
          <main className="p-4 md:p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {session?.user?.role === 'SUPER_ADMIN' ? 'HOD Dashboard' : 'Admin Dashboard'}
              </h1>
              <p className="text-slate-600">
                Welcome back, {session?.user?.name?.split(' ')[0]}. Here's your overview.
              </p>
            </motion.div>

            {/* Stats Grid - Bento Style */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {/* Total Notices */}
              <motion.div variants={item}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Total Notices</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats?.totalNotices || 0}</h3>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                          <span className="text-xs text-emerald-600 font-medium">+2 this week</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Total Applications */}
              <motion.div variants={item}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Applications</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats?.totalApplications || 0}</h3>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                          <span className="text-xs text-emerald-600 font-medium">+5 this week</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pending */}
              <motion.div variants={item}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Pending Review</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats?.pendingApplications || 0}</h3>
                        <p className="text-xs text-slate-500 mt-2">
                          Needs attention
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Resolved */}
              <motion.div variants={item}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Resolved</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats?.resolvedApplications || 0}</h3>
                        <p className="text-xs text-slate-500 mt-2">
                          Completed
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity - Takes 2 columns */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                        <CardDescription>Latest actions in your department</CardDescription>
                      </div>
                      <Activity className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
                      ) : (
                        recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                              activity.type === 'application' ? 'bg-purple-100' : 'bg-blue-100'
                            )}>
                              {activity.type === 'application' ? (
                                <FileText className="w-4 h-4 text-purple-600" />
                              ) : (
                                <Bell className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {activity.action}
                              </p>
                              <p className="text-xs text-slate-500">
                                {activity.user} • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions - Takes 1 column */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                    <CardDescription>Common tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/admin/notices/new">
                      <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Notice
                      </Button>
                    </Link>
                    <Link href="/admin/applications">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Review Applications
                      </Button>
                    </Link>
                    {session?.user?.role === 'SUPER_ADMIN' && (
                      <Link href="/admin/users">
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="w-4 h-4 mr-2" />
                          Manage Users
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

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
