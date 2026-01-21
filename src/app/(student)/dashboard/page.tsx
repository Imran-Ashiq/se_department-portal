'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, Search, Plus, List, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'ALL' | Category>('ALL');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notices?limit=100');
      if (!response.ok) throw new Error('Failed to fetch notices');
      const data = await response.json();
      setNotices(data.notices || []);
      setFilteredNotices(data.notices || []);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case 'GENERAL':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'EXAMS':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'EVENTS':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-24">
          <Skeleton className="h-12 w-64 mb-2" />
          <Skeleton className="h-6 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-20" />)}
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-48 w-full rounded-3xl" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Header Navigation */}
      <div className="hidden md:block border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Portal</h2>
              <p className="text-sm text-slate-500">Department Management System</p>
            </div>
            <nav className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  <FileText className="w-4 h-4 mr-2" />
                  Notices
                </Button>
              </Link>
              <Link href="/applications">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  <List className="w-4 h-4 mr-2" />
                  My Applications
                </Button>
              </Link>
              <Link href="/applications/create">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Notices */}
          <div className="lg:col-span-2">
            {/* Greeting Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-slate-900 mb-1">
                {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'Student'}
              </h1>
              <p className="text-slate-500">Stay updated with latest announcements</p>
            </motion.div>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
            >
              {(['ALL', 'GENERAL', 'EXAMS', 'EVENTS'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                    activeCategory === category
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200'
                  )}
                >
                  {category === 'ALL' ? 'All' : category.charAt(0) + category.slice(1).toLowerCase()}
                </button>
              ))}
            </motion.div>

            {/* Notice Cards */}
            {filteredNotices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-sm p-12 text-center"
              >
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-600 mb-2">
                  No notices found
                </p>
                <p className="text-sm text-slate-400">
                  {activeCategory === 'ALL' 
                    ? 'There are no notices at this time.' 
                    : `There are no ${activeCategory.toLowerCase()} notices.`}
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {filteredNotices.map((notice) => (
                  <motion.div
                    key={notice.id}
                    variants={item}
                    className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={cn('border', getCategoryColor(notice.category))}>
                          {notice.category}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                        {notice.title}
                      </h2>

                      {/* Author */}
                      <p className="text-xs text-slate-500 mb-4">
                        By {notice.author.name || 'Department'}
                      </p>

                      {/* Content */}
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                        {notice.content}
                      </p>

                      {/* Attachment */}
                      {notice.attachmentUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="mt-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4 mr-2" />
                            View Attachment
                          </a>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar - Quick Actions (Desktop Only) */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 space-y-4"
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                  <CardDescription>Manage your applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/applications/create">
                    <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Application
                    </Button>
                  </Link>
                  <Link href="/applications">
                    <Button variant="outline" className="w-full justify-start">
                      <List className="w-4 h-4 mr-2" />
                      View My Applications
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* User Info Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">My Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {session?.user?.name || 'Student'}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {session?.user?.email}
                      </p>
                      {session?.user?.rollNumber && (
                        <p className="text-xs text-slate-400">
                          Roll: {session.user.rollNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
