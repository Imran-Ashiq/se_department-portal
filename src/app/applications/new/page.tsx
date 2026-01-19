'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ArrowLeft, Loader2, Upload, User, Mail, IdCard, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function NewApplicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    attachmentUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          attachmentUrl: formData.attachmentUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit application');
        toast.error(data.error || 'Failed to submit application');
      } else {
        toast.success('Application submitted successfully!');
        router.push('/applications');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-96 w-full max-w-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
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
              <h1 className="text-2xl font-bold">Submit New Application</h1>
              <p className="text-slate-600 dark:text-slate-400">Fill in the details below</p>
            </div>
          </div>
        </div>

        {/* Student Profile Card - Digital ID */}
        <Card className="mb-6 border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <IdCard className="w-4 h-4" />
              Student Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              {/* Name */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Full Name</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {session?.user?.name || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              {/* Roll Number with Verification Badge */}
              {session?.user?.rollNumber && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <IdCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Roll Number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {session.user.rollNumber}
                      </p>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                        <BadgeCheck className="w-3 h-3 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info Badge */}
            <div className="flex items-start gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <BadgeCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This information is system-verified and will be automatically included with your application.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-600 dark:text-slate-400 font-medium">
              Application Details
            </span>
          </div>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>
              Provide complete information to ensure quick processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Application title (e.g., Leave Request, Document Request)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Description *</Label>
                <Textarea
                  id="content"
                  placeholder="Provide detailed information about your application..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  disabled={isLoading}
                  required
                  rows={10}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Attachment URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="attachment"
                    type="text"
                    placeholder="Enter file URL if you have one"
                    value={formData.attachmentUrl}
                    onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                    disabled={isLoading}
                  />
                  <Button type="button" variant="outline" size="icon" disabled>
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  File upload will be available soon. For now, you can paste a direct link to your file.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/applications')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
