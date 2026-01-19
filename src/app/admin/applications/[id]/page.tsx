'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sidebar } from '@/components/admin-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, ArrowLeft, LogOut, Clock, CheckCircle2, XCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type Status = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

interface Remark {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

interface Application {
  id: string;
  title: string;
  content: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  attachmentUrl?: string | null;
  student: {
    id: string;
    name: string | null;
    email: string;
    rollNumber: string | null;
  };
  remarks: Remark[];
}

export default function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role === 'STUDENT') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApplication();
    }
  }, [status, id]);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/applications/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Application not found');
          router.push('/admin/applications');
          return;
        }
        throw new Error('Failed to fetch application');
      }
      const data = await response.json();
      setApplication(data);
    } catch (error) {
      toast.error('Failed to load application');
      console.error('Error fetching application:', error);
      router.push('/admin/applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Status updated to ${newStatus}`);
      fetchApplication();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remark.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/applications/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: remark }),
      });

      if (!response.ok) {
        throw new Error('Failed to add remark');
      }

      toast.success('Remark added successfully');
      setRemark('');
      fetchApplication();
    } catch (error) {
      toast.error('Failed to add remark');
    } finally {
      setIsSubmitting(false);
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex">
          <Sidebar role="ADMIN" />
          <div className="flex-1 p-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-96 w-full max-w-6xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
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
              <div className="flex-1">
                <Link href="/admin/applications">
                  <Button variant="ghost" size="sm" className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Applications
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{application.title}</h1>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <Badge variant={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                      <span>{formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-6 max-w-6xl">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Application Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                        {application.content}
                      </p>
                    </div>
                    {application.attachmentUrl && (
                      <div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={application.attachmentUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4 mr-2" />
                            View Attachment
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Remarks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Remarks & Updates</CardTitle>
                    <CardDescription>
                      {application.remarks.length} {application.remarks.length === 1 ? 'remark' : 'remarks'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRemarkSubmit} className="mb-6">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Add a remark..."
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                          disabled={isSubmitting}
                          rows={3}
                          className="resize-none"
                        />
                        <Button type="submit" size="icon" disabled={isSubmitting || !remark.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>

                    {application.remarks.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <p>No remarks yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {application.remarks.map((remark) => (
                          <div key={remark.id} className="flex gap-3">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback>
                                {remark.author.name?.charAt(0) || remark.author.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {remark.author.name || remark.author.email}
                                </span>
                                <span className="text-xs text-slate-500">
                                  • {remark.author.role === 'ADMIN' ? 'Admin' : 'HOD'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  • {formatDistanceToNow(new Date(remark.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {remark.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select
                      value={application.status}
                      onValueChange={(value: Status) => handleStatusChange(value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Updating status will notify the student.
                    </p>
                  </CardContent>
                </Card>

                {/* Student Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {application.student.name?.charAt(0) || application.student.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {application.student.name || 'Student'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {application.student.email}
                        </p>
                      </div>
                    </div>
                    {application.student.rollNumber && (
                      <div className="text-sm">
                        <span className="text-slate-500">Roll Number:</span>
                        <span className="ml-2 font-medium">{application.student.rollNumber}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
