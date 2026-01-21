'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2, FileText, User } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateApplicationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    attachmentUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
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
        toast.error(data.error || 'Failed to submit application');
      } else {
        toast.success('Application submitted successfully!');
        router.push('/applications');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/applications">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">New Application</h1>
              <p className="text-sm text-slate-500">Submit your request</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">
                    {session?.user?.name || 'Student'}
                  </p>
                  <p className="text-sm text-slate-600 truncate">
                    {session?.user?.email}
                  </p>
                  {session?.user?.rollNumber && (
                    <p className="text-xs text-slate-500">
                      Roll: {session.user.rollNumber}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Title Field */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Application Title
              </CardTitle>
              <CardDescription className="text-xs">
                Brief summary of your request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g., Request for Course Registration"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </CardContent>
          </Card>

          {/* Content Field */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Description</CardTitle>
              <CardDescription className="text-xs">
                Provide details about your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Explain your request in detail..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                required
              />
              <p className="text-xs text-slate-400 mt-2">
                {formData.content.length} characters
              </p>
            </CardContent>
          </Card>

          {/* Attachment URL Field (Optional) */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Attachment Link
                <span className="text-xs font-normal text-slate-400 ml-2">(Optional)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Add a Google Drive or Dropbox link if needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="url"
                placeholder="https://..."
                value={formData.attachmentUrl}
                onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="sticky bottom-20 md:bottom-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-base font-semibold shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
