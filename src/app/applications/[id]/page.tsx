'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ArrowLeft, User as UserIcon, Calendar } from 'lucide-react';
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

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
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
          router.push('/applications');
          return;
        }
        throw new Error('Failed to fetch application');
      }
      const data = await response.json();
      setApplication(data);
    } catch (error) {
      toast.error('Failed to load application');
      console.error('Error fetching application:', error);
      router.push('/applications');
    } finally {
      setIsLoading(false);
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
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-96 w-full max-w-4xl" />
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/applications">
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
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                </span>
                <span>•</span>
                <span>Updated {formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>Full application information</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(application.status)}>
                    {getStatusText(application.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {application.content}
                  </p>
                </div>

                {application.attachmentUrl && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Attachment</h3>
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
            {/* Applicant Info */}
            <Card>
              <CardHeader>
                <CardTitle>Applicant Information</CardTitle>
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

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Application Submitted</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {application.updatedAt !== application.createdAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
