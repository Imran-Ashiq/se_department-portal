'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sidebar } from '@/components/admin-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function InviteFacultyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN' | 'CLERK' | 'TEACHER',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role === 'STUDENT') {
      router.push('/dashboard');
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setTempPassword('');

    if (!formData.email.trim()) {
      setError('Please enter an email address');
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to invite faculty');
        toast.error(data.error || 'Failed to invite faculty');
      } else {
        setSuccess(true);
        toast.success('Faculty invited successfully!');
        if (process.env.NODE_ENV === 'development' && data.debugPassword) {
          setTempPassword(data.debugPassword);
        }
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
        <div className="flex">
          <Sidebar role="SUPER_ADMIN" />
          <div className="flex-1 p-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-96 w-full max-w-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar role="SUPER_ADMIN" />

        {/* Main Content */}
        <div className="flex-1 min-h-0 md:ml-64 pt-16 md:pt-0">
          {/* Header */}
          <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="px-6 py-4">
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Faculty
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Invite Faculty Member</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Add a new admin to manage the department
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            <div className="max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Faculty Details</CardTitle>
                  <CardDescription>
                    Enter the email address and role for the new faculty member
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="faculty@university.edu"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={isLoading}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value: 'ADMIN' | 'SUPER_ADMIN' | 'CLERK' | 'TEACHER') => setFormData({ ...formData, role: value })}
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CLERK">Clerk</SelectItem>
                            <SelectItem value="TEACHER">Teacher</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="SUPER_ADMIN">Head of Department (HOD)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                          Clerk/Teacher: Can access admin panel with limited permissions
                          <br />
                          Admin: Can create/edit notices and review applications
                          <br />
                          HOD: Full admin access + user management
                        </p>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Send Invitation
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/admin/users')}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <MailCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                        <div>
                          <h3 className="font-semibold text-green-900 dark:text-green-100">
                            Invitation Sent Successfully!
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            An email with login credentials will be sent to {formData.email}
                          </p>
                        </div>
                      </div>

                      {tempPassword && (
                        <Alert>
                          <AlertDescription className="space-y-2">
                            <p className="font-semibold">Development Mode - Temporary Password:</p>
                            <code className="block p-2 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                              {tempPassword}
                            </code>
                            <p className="text-xs">
                              This password will only be shown once. In production, it will be sent via email.
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-4 pt-4">
                        <Button
                          onClick={() => {
                            setFormData({ email: '', role: 'ADMIN' });
                            setSuccess(false);
                            setTempPassword('');
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Invite Another
                        </Button>
                        <Button
                          onClick={() => router.push('/admin/users')}
                          className="flex-1"
                        >
                          View Faculty List
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
