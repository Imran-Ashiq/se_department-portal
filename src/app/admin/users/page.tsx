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
import { Users, LogOut, Mail, Shield, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'CLERK' | 'TEACHER';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role === 'STUDENT') {
      router.push('/dashboard');
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'SUPER_ADMIN') {
      fetchUsers();
    }
  }, [status, session]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string | null, userEmail: string) => {
    // Prevent deleting yourself
    if (session?.user?.id === userId) {
      toast.error('You cannot delete your own account');
      return;
    }

    const confirmed = confirm(`Are you sure you want to remove ${userName || userEmail}? This action cannot be undone.`);
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
      console.error('Error deleting user:', error);
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
          <Sidebar role="SUPER_ADMIN" />
          <div className="flex-1 p-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
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
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Manage Faculty</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  View and manage admin accounts
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/admin/users/invite">
                  <Button>
                    <Shield className="w-4 h-4 mr-2" />
                    Invite Faculty
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
                          Head of Department
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
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-16 h-16 text-slate-400 mb-4" />
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                    No faculty members yet
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Invite faculty members to help manage the department.
                  </p>
                  <Link href="/admin/users/invite">
                    <Button>
                      <Shield className="w-4 h-4 mr-2" />
                      Invite First Faculty
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {users.map((user) => {
                  const getRoleBadge = (role: string) => {
                    switch(role) {
                      case 'SUPER_ADMIN':
                        return { label: 'HOD', variant: 'default' as const };
                      case 'ADMIN':
                        return { label: 'Admin', variant: 'secondary' as const };
                      case 'TEACHER':
                        return { label: 'Teacher', variant: 'outline' as const };
                      case 'CLERK':
                        return { label: 'Clerk', variant: 'outline' as const };
                      default:
                        return { label: role, variant: 'secondary' as const };
                    }
                  };

                  const roleBadge = getRoleBadge(user.role);
                  const isCurrentUser = session?.user?.id === user.id;

                  return (
                    <Card key={user.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                {user.name?.charAt(0) || user.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">
                                  {user.name || 'Faculty Member'}
                                </h3>
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Added {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={roleBadge.variant}>
                              {roleBadge.label}
                            </Badge>
                            {!isCurrentUser && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={() => handleDeleteUser(user.id, user.name, user.email)}
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
