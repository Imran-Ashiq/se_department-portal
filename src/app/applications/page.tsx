'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, LogOut, Bell, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type Status = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

interface Application {
  id: string;
  title: string;
  content: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  remarks: any[];
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApplications();
    }
  }, [status]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      toast.error('Failed to load applications');
      console.error('Error fetching applications:', error);
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

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'PENDING':
        return 'default';
      case 'UNDER_REVIEW':
        return 'secondary';
      case 'RESOLVED':
        return 'outline';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Status) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'RESOLVED':
        return 'Resolved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-32" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Student Portal</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">My Applications</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="font-medium">
                <Bell className="w-4 h-4 mr-2" />
                Notices
              </Button>
            </Link>
            <Link href="/applications">
              <Button variant="ghost" className="font-medium">
                <FileText className="w-4 h-4 mr-2" />
                My Applications
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/applications/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name || 'Student'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                    {session?.user?.rollNumber && (
                      <p className="text-xs leading-none text-muted-foreground">
                        Roll No: {session.user.rollNumber}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/applications')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Applications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full font-medium">
                <Bell className="w-4 h-4 mr-2" />
                Notices
              </Button>
            </Link>
            <Link href="/applications" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full font-medium">
                <FileText className="w-4 h-4 mr-2" />
                Applications
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">My Applications</h2>
            <p className="text-slate-600 dark:text-slate-400">Track and manage your applications</p>
          </div>
          <Link href="/applications/new">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No applications yet
              </p>
              <p className="text-sm text-slate-500 mb-4">
                You haven't submitted any applications yet.
              </p>
              <Link href="/applications/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your First Application
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/applications/${application.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={getStatusColor(application.status)}>
                            {getStatusText(application.status)}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{application.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {application.content.substring(0, 150)}
                          {application.content.length > 150 && '...'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>
                        {application.remarks.length} {application.remarks.length === 1 ? 'remark' : 'remarks'}
                      </span>
                      <span>
                        Last updated {formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
