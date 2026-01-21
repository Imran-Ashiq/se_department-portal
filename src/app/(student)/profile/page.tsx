'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, User, IdCard, Shield, LogOut, Edit } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'STUDENT':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Student</Badge>;
      case 'TEACHER':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Teacher</Badge>;
      case 'ADMIN':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Admin</Badge>;
      case 'SUPER_ADMIN':
        return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">HOD</Badge>;
      default:
        return <Badge>User</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
              <p className="text-sm text-slate-500">Account information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 border-4 border-white/20 mb-4">
                  <AvatarFallback className="bg-white/90 text-indigo-600 text-2xl font-bold">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">
                  {session?.user?.name || 'User'}
                </h2>
                <p className="text-indigo-100 mb-3">
                  {session?.user?.email}
                </p>
                {getRoleBadge(session?.user?.role)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Account Details</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 mb-1">Full Name</p>
                  <p className="font-medium text-slate-900">
                    {session?.user?.name || 'Not provided'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 mb-1">Email Address</p>
                  <p className="font-medium text-slate-900 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              {session?.user?.rollNumber && (
                <>
                  <Separator />
                  {/* Roll Number */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <IdCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 mb-1">Roll Number</p>
                      <p className="font-medium text-slate-900">
                        {session.user.rollNumber}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Role */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 mb-1">Account Role</p>
                  <p className="font-medium text-slate-900">
                    {session?.user?.role === 'STUDENT' ? 'Student' :
                     session?.user?.role === 'TEACHER' ? 'Teacher' :
                     session?.user?.role === 'ADMIN' ? 'Admin' :
                     session?.user?.role === 'SUPER_ADMIN' ? 'Head of Department' : 'User'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Button
            variant="outline"
            className="w-full justify-start py-6 text-slate-700 border-slate-200"
            disabled
          >
            <Edit className="w-5 h-5 mr-3" />
            Edit Profile
            <span className="ml-auto text-xs text-slate-400">Coming Soon</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start py-6 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
