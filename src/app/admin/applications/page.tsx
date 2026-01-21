'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/admin-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { FileText, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Status = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

interface Application {
  id: string;
  title: string;
  content: string;
  status: Status;
  createdAt: string;
  student: {
    id: string;
    name: string | null;
    email: string;
    rollNumber: string | null;
  };
  remarks: any[];
}

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
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

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Application status updated to ${newStatus}`);
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update status');
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

  const getStatusBadge = (status: Status) => {
    const config = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
      UNDER_REVIEW: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      RESOLVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    };

    const { bg, text, border } = config[status] || config.PENDING;

    return (
      <span className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        bg, text, border
      )}>
        {status.replace('_', ' ')}
      </span>
    );
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
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    {
      header: 'Student',
      accessor: (row: Application) => (
        <div>
          <p className="font-medium text-slate-900">{row.student.name || 'Unknown'}</p>
          <p className="text-xs text-slate-500">{row.student.rollNumber || row.student.email}</p>
        </div>
      ),
    },
    {
      header: 'Title',
      accessor: (row: Application) => (
        <div>
          <p className="font-medium text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{row.content}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Application) => getStatusBadge(row.status),
    },
    {
      header: 'Submitted',
      accessor: (row: Application) => (
        <span className="text-sm text-slate-600">
          {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Application) => (
        <Link href={`/admin/applications/${row.id}`}>
          <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar role={session?.user?.role || 'ADMIN'} />

        <div className="flex-1 md:ml-64">
          <main className="p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Applications</h1>
              <p className="text-slate-600">
                Review and manage student applications
              </p>
            </div>

            <DataTable 
              columns={columns} 
              data={applications} 
              emptyMessage="No applications found. Student applications will appear here."
            />
          </main>
        </div>
      </div>
    </div>
  );
}
