'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/admin-sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Plus, LogOut, Pencil, Trash2, MoreVertical } from 'lucide-react';
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
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export default function AdminNoticesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedNotices, setExpandedNotices] = useState<Set<string>>(new Set());

  const toggleExpanded = (noticeId: string) => {
    setExpandedNotices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noticeId)) {
        newSet.delete(noticeId);
      } else {
        newSet.add(noticeId);
      }
      return newSet;
    });
  };

  const CHAR_LIMIT = 400;

  const getTruncatedContent = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    const truncated = text.substring(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role === 'STUDENT') {
      router.push('/dashboard');
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
    } catch (error) {
      toast.error('Failed to load notices');
      console.error('Error fetching notices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete notice');
      }

      toast.success('Notice deleted successfully');
      setNotices(notices.filter(notice => notice.id !== id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete notice');
    } finally {
      setDeletingId(null);
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

  const canEdit = (notice: Notice) => {
    return session?.user?.role === 'SUPER_ADMIN' || notice.author.id === session?.user?.id;
  };

  const canDelete = (notice: Notice) => {
    return session?.user?.role === 'SUPER_ADMIN' || notice.author.id === session?.user?.id;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex">
          <Sidebar role="ADMIN" />
          <div className="flex-1 p-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48 w-full" />
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
                <h1 className="text-2xl font-bold">Manage Notices</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Create and manage department announcements
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/admin/notices/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Notice
                  </Button>
                </Link>

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
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : notices.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="w-16 h-16 text-slate-400 mb-4" />
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                    No notices yet
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Get started by creating your first notice.
                  </p>
                  <Link href="/admin/notices/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Notice
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notices.map((notice) => (
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
                            By {notice.author.name || 'Admin'} • {notice.author.role === 'ADMIN' ? 'Admin' : 'HOD'}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/notices/${notice.id}/edit`}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(notice.id)}
                              disabled={!canDelete(notice) || deletingId === notice.id}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                        {expandedNotices.has(notice.id) || notice.content.length <= CHAR_LIMIT
                          ? notice.content
                          : getTruncatedContent(notice.content, CHAR_LIMIT) + '...'}
                      </p>
                      {notice.content.length > CHAR_LIMIT && (
                        <Button
                          variant="link"
                          className="mt-2 p-0 h-auto font-semibold text-blue-600 dark:text-blue-400"
                          onClick={() => toggleExpanded(notice.id)}
                        >
                          {expandedNotices.has(notice.id) ? 'See Less' : 'See More'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
