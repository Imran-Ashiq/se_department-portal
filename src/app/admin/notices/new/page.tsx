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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sidebar } from '@/components/admin-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, ArrowLeft, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

type Category = 'GENERAL' | 'EXAMS' | 'EVENTS';

export default function NewNoticePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL' as Category,
    attachmentUrl: '',
    attachmentType: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role === 'STUDENT') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only images and PDFs are allowed.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Step 1: Get presigned URL from our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          filetype: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileUrl } = await response.json();

      // Step 2: Upload file to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Update form state
      const attachmentType = file.type.startsWith('image/') ? 'image' : 'pdf';
      setFormData({
        ...formData,
        attachmentUrl: fileUrl,
        attachmentType,
      });
      setUploadedFile({ name: file.name, url: fileUrl });
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
      setError('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFormData({
      ...formData,
      attachmentUrl: '',
      attachmentType: '',
    });
  };

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
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          attachmentUrl: formData.attachmentUrl || undefined,
          attachmentType: formData.attachmentType || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create notice');
        toast.error(data.error || 'Failed to create notice');
      } else {
        toast.success('Notice published successfully!');
        router.push('/admin/notices');
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
          <Sidebar role="ADMIN" />
          <div className="flex-1 p-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-96 w-full max-w-3xl" />
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
            <div className="px-6 py-4">
              <Link href="/admin/notices">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Notices
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Create New Notice</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Publish a new announcement
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            <div className="max-w-3xl">
              <Card>
                <CardHeader>
                  <CardTitle>Notice Details</CardTitle>
                  <CardDescription>
                    Provide complete information for the announcement
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
                        placeholder="Notice title (e.g., Exam Schedule, Holiday Announcement)"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: Category) => setFormData({ ...formData, category: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">General</SelectItem>
                          <SelectItem value="EXAMS">Exams</SelectItem>
                          <SelectItem value="EVENTS">Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        placeholder="Provide detailed information about the notice..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        disabled={isLoading}
                        required
                        rows={10}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="attachment">Attachment (Optional)</Label>
                      <div className="space-y-3">
                        {!uploadedFile ? (
                          <div className="flex items-center gap-2">
                            <Input
                              id="attachment"
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleFileChange}
                              disabled={isLoading || isUploading}
                              className="cursor-pointer"
                            />
                            {isUploading && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Uploading...</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                ✅ {uploadedFile.name}
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-500">
                                File uploaded successfully
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFile}
                              disabled={isLoading}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-slate-500">
                          Supported formats: Images (JPG, PNG, GIF, WebP) and PDF. Max size: 10MB.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Notice
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/notices')}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
