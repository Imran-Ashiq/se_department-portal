'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, FileText, LogOut, User, Bell, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type Category = 'GENERAL' | 'EXAMS' | 'EVENTS';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: Category;
  createdAt: string;
  author: {
    name: string | null;
    role: string;
  };
  attachmentUrl?: string | null;
  attachmentType?: string | null;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'ALL' | Category>('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotices();
    }
  }, [status]);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notices');
      if (!response.ok) throw new Error('Failed to fetch notices');
      const data = await response.json();
      setNotices(data);
      setFilteredNotices(data);
    } catch (error) {
      toast.error('Failed to load notices');
      console.error('Error fetching notices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeCategory === 'ALL') {
      setFilteredNotices(notices);
    } else {
      setFilteredNotices(notices.filter(notice => notice.category === activeCategory));
    }
  }, [activeCategory, notices]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case 'GENERAL':
        return 'default';
      case 'EXAMS':
        return 'secondary';
      case 'EVENTS':
        return 'outline';
      default:
        return 'default';
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
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
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
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Student Portal</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Departmental Announcements</p>
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
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as 'ALL' | Category)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="GENERAL">General</TabsTrigger>
            <TabsTrigger value="EXAMS">Exams</TabsTrigger>
            <TabsTrigger value="EVENTS">Events</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredNotices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No notices found
              </p>
              <p className="text-sm text-slate-500">
                {activeCategory === 'ALL' 
                  ? 'There are no notices at this time.' 
                  : `There are no ${activeCategory.toLowerCase()} notices at this time.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <Card key={notice.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={getCategoryColor(notice.category)}>
                          {notice.category}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{notice.title}</CardTitle>
                      <CardDescription className="mt-1">
                        By {notice.author.name || 'Department'} • {notice.author.role === 'ADMIN' ? 'Admin' : notice.author.role === 'SUPER_ADMIN' ? 'HOD' : 'Faculty'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                      {notice.content}
                    </p>
                  </div>
                  {notice.attachmentUrl && (
                    <div className="mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 mr-2" />
                          View Attachment
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
